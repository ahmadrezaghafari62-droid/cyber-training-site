require("dotenv").config();

const express = require("express");
const cors = require("cors");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

const app = express();

/* ================= FIREBASE ================= */

const serviceAccount = JSON.parse(process.env.FIREBASE_KEY);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

/* ================= EMAIL ================= */

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (email, message) => {
  try {
    await transporter.sendMail({
      from: `"CyberSentinel" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "CyberSentinel Notification",
      text: message,
    });
    console.log("📧 Email sent:", email);
  } catch (err) {
    console.error("❌ Email error:", err.message);
  }
};

/* ================= CORS ================= */

app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://cyber-training-site.web.app",
    "https://cyber-training-site.firebaseapp.com",
    "https://cybersentinelhq.io"
  ],
  credentials: true
}));

/* ================= WEBHOOK ================= */

app.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  console.log("🚨 WEBHOOK HIT");

  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("❌ Webhook signature failed:", err.message);
    return res.sendStatus(400);
  }

  console.log("🔔 Stripe event:", event.type);

  try {
    switch (event.type) {

      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.metadata?.userId;

        console.log("🔥 USER ID:", userId);

        if (!userId) break;

        await db.collection("users").doc(userId).set({
          isSubscribed: true,
          subscriptionStatus: "active",
          stripeCustomerId: session.customer,
          subscriptionId: session.subscription,
          updatedAt: new Date(),
        }, { merge: true });

        console.log("✅ Firestore updated");

        const userDoc = await db.collection("users").doc(userId).get();

        if (userDoc.exists) {
          await sendEmail(
            userDoc.data().email,
            "🎉 Your subscription is now active!"
          );
        }

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;

        const users = await db.collection("users")
          .where("subscriptionId", "==", subscription.id)
          .get();

        for (const docSnap of users.docs) {
          await docSnap.ref.update({
            isSubscribed: false,
            subscriptionStatus: "cancelled",
          });
        }

        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;

        const users = await db.collection("users")
          .where("stripeCustomerId", "==", invoice.customer)
          .get();

        for (const docSnap of users.docs) {
          await docSnap.ref.update({
            subscriptionStatus: "past_due",
          });
        }

        break;
      }

      default:
        console.log("ℹ️ Unhandled event:", event.type);
    }

  } catch (error) {
    console.error("🔥 Webhook processing error:", error.message);
  }

  res.sendStatus(200);
});

/* ================= JSON AFTER WEBHOOK ================= */

app.use(express.json());

/* ================= CREATE CHECKOUT ================= */

app.post("/create-checkout-session", async (req, res) => {
  try {
    const { userId, email } = req.body;

    console.log("📩 Incoming checkout request:");
    console.log("➡️ userId:", userId);
    console.log("➡️ email:", email);

    if (!userId || !email) {
      console.log("❌ Missing userId or email");
      return res.status(400).json({ error: "Missing userId or email" });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      console.log("❌ STRIPE_SECRET_KEY missing");
    }

    if (!process.env.FRONTEND_URL) {
      console.log("❌ FRONTEND_URL missing");
    }

    console.log("🚀 Creating Stripe session...");

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",

      payment_method_types: ["card"],

      line_items: [
        {
          price: "price_1TKQiIJyuWLk753BC9ROUYaU",
          quantity: 1,
        },
      ],

      customer_email: email,

      success_url: `${process.env.FRONTEND_URL}/dashboard`,
      cancel_url: `${process.env.FRONTEND_URL}/payment`,

      metadata: { userId },
    });

    console.log("✅ Stripe session created:");
    console.log("➡️ Session ID:", session.id);
    console.log("➡️ URL:", session.url);

    if (!session.url) {
      console.log("❌ No URL returned from Stripe");
      return res.status(500).json({ error: "No checkout URL returned" });
    }

    res.json({ url: session.url });

  } catch (error) {
    console.error("🔥 FULL STRIPE ERROR:");
    console.error(error); // 🔥 FULL ERROR OBJECT

    res.status(500).json({
      error: error.message,
      type: error.type,
      code: error.code,
    });
  }
});

/* ================= BILLING PORTAL ================= */

app.post("/create-portal-session", async (req, res) => {
  try {
    const { userId } = req.body;

    const userDoc = await db.collection("users").doc(userId).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    const userData = userDoc.data();

    if (!userData.stripeCustomerId) {
      return res.status(400).json({ error: "No Stripe customer ID found" });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: userData.stripeCustomerId,
      return_url: `${process.env.FRONTEND_URL}/dashboard`,
    });

    res.json({ url: session.url });

  } catch (error) {
    console.error("🔥 Portal error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

/* ================= TEST ================= */

app.get("/", (req, res) => {
  res.send("Backend working ✅");
});

/* ================= START ================= */

const PORT = process.env.PORT || 4242;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});