require("dotenv").config();

const express = require("express");
const cors = require("cors");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

const app = express();

console.log("🔥 DEPLOY VERSION FINAL");

/* ================= FIREBASE (FIXED) ================= */

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
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

/* ================= TEST EMAIL ================= */

app.get("/send-test-email", async (req, res) => {
  try {
    await sendEmail(
      process.env.EMAIL_USER,
      "🚀 CyberSentinel email system is working!"
    );

    res.send("Email sent successfully!");
  } catch (err) {
    res.status(500).send("Email failed");
  }
});

/* ================= WEBHOOK ================= */

app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
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

          if (!userId) break;

          await db.collection("users").doc(userId).set(
            {
              isSubscribed: true,
              subscriptionStatus: "active",
              stripeCustomerId: session.customer,
              subscriptionId: session.subscription,
              updatedAt: new Date(),
            },
            { merge: true }
          );

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

          const users = await db
            .collection("users")
            .where("subscriptionId", "==", subscription.id)
            .get();

          users.forEach((docSnap) => {
            docSnap.ref.update({
              isSubscribed: false,
              subscriptionStatus: "cancelled",
            });
          });

          break;
        }

        case "invoice.payment_failed": {
          const invoice = event.data.object;

          const users = await db
            .collection("users")
            .where("stripeCustomerId", "==", invoice.customer)
            .get();

          users.forEach((docSnap) => {
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
  }
);

/* ================= MIDDLEWARE ================= */

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://cyber-training-site.web.app",
      "https://cyber-training-site.firebaseapp.com",
      "https://cybersentinelhq.io",
    ],
    credentials: true,
  })
);

app.use(express.json());

/* ================= CREATE CHECKOUT ================= */

app.post("/create-checkout-session", async (req, res) => {
  try {
    const { userId, email } = req.body;

    if (!userId || !email) {
      return res.status(400).json({ error: "Missing userId or email" });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: "price_1TMELbJyuWLk753BCekkNJDN",
          quantity: 1,
        },
      ],
      customer_email: email,
      metadata: { userId },
      success_url: `${process.env.FRONTEND_URL}/dashboard`,
      cancel_url: `${process.env.FRONTEND_URL}/payment`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("🔥 Stripe Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

/* ================= PORTAL ================= */

app.post("/create-portal-session", async (req, res) => {
  try {
    const { userId } = req.body;

    const userDoc = await db.collection("users").doc(userId).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    const userData = userDoc.data();

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

/* ================= HEALTH ================= */

app.get("/", (req, res) => {
  res.send("Backend working ✅");
});

/* ================= START ================= */

const PORT = process.env.PORT || 4242;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});