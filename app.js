require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");

const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

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

  app.get("/", async (req, res, next) => {
    try {
      const posts = await Post.find({});
      res.render("home", { homeStartingContent, posts });
    } catch (err) {
      next(err);
    }
  });

  app.get("/about", (req, res) => {
    res.render("about", { aboutContent });
  });

  app.get("/contact", (req, res) => {
    res.render("contact", { contactContent });
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
