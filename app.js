require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");

function stripHtml(html = "") {
  return String(html)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const app = express();
app.locals._ = _;

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public", { redirect: false }));

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/blogDB";
mongoose.connect(MONGO_URI).catch((err) => {
  console.error("MongoDB connection error:", err.message);
});

const postSchema = new mongoose.Schema({
  postTitle: String,
  postBody: String,
});

const Post = mongoose.model("Post", postSchema);

async function buildPaymentMiddleware() {
  const privateKey = process.env.SERVER_PRIVATE_KEY;
  if (!privateKey) {
    console.warn("SERVER_PRIVATE_KEY not set — /posts/:postId served without 402 payment gating");
    return null;
  }
  const { createPaymentMiddleware } = await import("@bsv/402-pay/server");
  const { ServerWallet } = await import("@bsv/simple/server");
  const serverWallet = await ServerWallet.create({
    privateKey,
    network: process.env.BSV_NETWORK || "main",
    storageUrl: process.env.BSV_STORAGE_URL || "https://store-us-1.bsvb.tech",
  });
  const priceSats = Number(process.env.POST_PRICE_SATS || 10);
  console.log(`402 payment middleware armed on /posts/:postId at ${priceSats} sats`);
  return createPaymentMiddleware({
    wallet: serverWallet.getClient(),
    calculatePrice: () => priceSats,
  });
}

async function start() {
  const paymentMiddleware = await buildPaymentMiddleware().catch((err) => {
    console.error("Payment middleware setup failed:", err.message);
    return null;
  });

  app.get("/", async (req, res) => {
    try {
      const posts = await Post.find({}).lean();
      const postsWithExcerpt = posts.map((post) => ({
        ...post,
        excerpt: _.truncate(stripHtml(post.postBody), { length: 140, omission: " ..." }),
      }));
      res.render("home", { posts: postsWithExcerpt });
    } catch (err) {
      // Graceful fallback when DB is unreachable (demo / local dev)
      console.warn("Home rendered without DB:", err.message);
      res.render("home", { posts: [] });
    }
  });

  app.get("/compose", (req, res) => {
    res.render("compose");
  });

  app.post("/compose", async (req, res, next) => {
    try {
      await Post.create({
        postTitle: req.body.postTitle,
        postBody: req.body.postBody,
      });
      res.redirect("/");
    } catch (err) {
      next(err);
    }
  });

  const postHandlers = [];
  if (paymentMiddleware) postHandlers.push(paymentMiddleware);
  postHandlers.push(async (req, res, next) => {
    try {
      const post = await Post.findById(req.params.postId);
      if (!post) return res.status(404).send("Post not found");
      res.render("post", { postTitle: post.postTitle, postBody: post.postBody });
    } catch (err) {
      next(err);
    }
  });
  app.get("/posts/:postId", ...postHandlers);

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
}

start();
