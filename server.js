require("dotenv").config();

const express = require("express");
const cors = require("cors");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const admin = require("firebase-admin");
console.log("🔥 DEPLOY VERSION 3");
console.log("🔥 NEW DEPLOY ACTIVE - PRICE FIXED");
const nodemailer = require("nodemailer");

const app = express();

/* ================= FIREBASE ================= */

if (!process.env.FIREBASE_KEY) {
  throw new Error("❌ FIREBASE_KEY missing in env");
}

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
  console.log("🔥 STRIPE KEY:", process.env.STRIPE_SECRET_KEY);
  console.log("🔔 Stripe event:", event.type);

  try {
    switch (event.type) {

      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.metadata?.userId;

        if (!userId) break;

        await db.collection("users").doc(userId).set({
          isSubscribed: true,
          subscriptionStatus: "active",
          stripeCustomerId: session.customer,
          subscriptionId: session.subscription,
          updatedAt: new Date(),
        }, { merge: true });

        const userDoc = await db.collection("users").doc(userId).get();

        if (userDoc.exists) {
          await sendEmail(
            userDoc.data().email,
            "🎉 Your subscription is now active!"
          );
        }

        console.log("✅ Subscription activated:", userId);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;

        const users = await db.collection("users")
          .where("subscriptionId", "==", subscription.id)
          .get();

        users.forEach(docSnap => {
          docSnap.ref.update({
            isSubscribed: false,
            subscriptionStatus: "cancelled",
          });
        });

        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;

        const users = await db.collection("users")
          .where("stripeCustomerId", "==", invoice.customer)
          .get();

        users.forEach(docSnap => {
          docSnap.ref.update({
            subscriptionStatus: "past_due",
          });
        });

        break;
      }

      default:
        console.log("ℹ️ Unhandled event:", event.type);
    }

  } catch (error) {
    console.error("🔥 Webhook error:", error.message);
  }

  res.sendStatus(200);
});

/* ================= JSON PARSER ================= */

app.use(express.json());

/* ================= CREATE CHECKOUT ================= */

app.post("/create-checkout-session", async (req, res) => {
  try {
    const { userId, email } = req.body;

    console.log("📩 Request:", { userId, email });

    if (!userId || !email) {
      return res.status(400).json({ error: "Missing userId or email" });
    }

    if (!process.env.FRONTEND_URL) {
      throw new Error("FRONTEND_URL is not set");
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",

      payment_method_types: ["card"],

      line_items: [
        {
          price: "price_1TLkI2JyuWLk753BOYdILrmd", // ✅ your price
          quantity: 1,
        },
      ],

      customer_email: email,

      success_url: `${process.env.FRONTEND_URL}/dashboard`,
      cancel_url: `${process.env.FRONTEND_URL}/payment`,

      metadata: { userId },
    });

    console.log("✅ Checkout created:", session.id);

    res.json({ url: session.url });

  } catch (error) {
    console.error("🔥 Stripe Error:", error);

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
      return res.status(400).json({ error: "No Stripe customer ID" });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: userData.stripeCustomerId,
      return_url: `${process.env.FRONTEND_URL}/dashboard`,
    });

    res.json({ url: session.url });

  } catch (error) {
    console.error("🔥 Portal Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

/* ================= HEALTH CHECK ================= */

app.get("/", (req, res) => {
  res.send("Backend working ✅");
});

/* ================= START ================= */

const PORT = process.env.PORT || 4242;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
