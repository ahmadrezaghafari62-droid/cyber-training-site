const express = require("express");
const cors = require("cors");
require("dotenv").config();

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// 🔥 Firebase Admin
const admin = require("firebase-admin");
const serviceAccount = JSON.parse(process.env.FIREBASE_KEY);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const app = express();

/* ================================
   🔥 MIDDLEWARE
================================ */

// Stripe webhook MUST use raw body
app.use("/webhook", express.raw({ type: "application/json" }));

app.use(cors());
app.use(express.json());

/* ================================
   💳 CREATE CHECKOUT SESSION
================================ */

app.post("/create-checkout-session", async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      console.log("❌ Missing userId");
      return res.status(400).json({ error: "Missing userId" });
    }

    console.log("👉 Creating session for:", userId);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",

      line_items: [
        {
          price: "price_1TEqF9FUdoCkyCR9kGVzXeed",
          quantity: 1,
        },
      ],

      success_url: `${process.env.FRONTEND_URL}/dashboard`,
      cancel_url: `${process.env.FRONTEND_URL}/payment`,

      metadata: {
        userId,
      },
    });

    console.log("✅ Session created:", session.id);

    res.json({ url: session.url });

  } catch (error) {
    console.error("🔥 Stripe Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

/* ================================
   🔔 STRIPE WEBHOOK
================================ */

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

app.post("/webhook", async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      endpointSecret
    );
  } catch (err) {
    console.error("❌ Webhook signature failed:", err.message);
    return res.sendStatus(400);
  }

  console.log("🔔 Event received:", event.type);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.metadata?.userId;

    console.log("👤 userId:", userId);

    if (!userId) return res.sendStatus(400);

    try {
      await db.collection("users").doc(userId).set(
        {
          isSubscribed: true,
          updatedAt: new Date(),
        },
        { merge: true }
      );

      console.log("✅ User upgraded:", userId);

    } catch (error) {
      console.error("🔥 Firestore error:", error.message);
    }
  }

  res.sendStatus(200);
});

/* ================================
   🧪 TEST ROUTE
================================ */

app.get("/", (req, res) => {
  res.send("Backend working ✅");
});

/* ================================
   🚀 START SERVER
================================ */

const PORT = process.env.PORT || 4242;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});