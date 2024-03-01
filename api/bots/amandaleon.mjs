import express from "express";
import { configDotenv } from "dotenv";
import { Telegraf, Scenes, session, Markup } from "telegraf";
import { Mongo } from "@telegraf/session/mongodb";
import composer from "../botIndex.mjs";

//Controllers
import * as packs from "../controllers/packsController.mjs";
import * as links from "../controllers/linkAgreggatorController.mjs";
import * as admins from "../controllers/adminsController.mjs";
import * as subscriptions from "../controllers/subscriptionsController.mjs";

configDotenv();

const app = express();

const bot = new Telegraf(process.env.AMANDALEON_TOKEN);

app.post("/api/bots/amandaleon", async (req, res, next) => {
  const {
    customer_chat_id,
    subscription_id,
    pack_id,
    type_item_bought,
    bot_name
  } = req.body || {};

  if (type_item_bought !== undefined && type_item_bought === "subscription") {
    await subscriptions.subscriptionBought(
      bot,
      bot_name,
      customer_chat_id,
      subscription_id,
    );
  }

  if (type_item_bought !== undefined && type_item_bought === "pack") {
    await packs.packBought(bot, bot_name, customer_chat_id, pack_id);
  }

  next();
});

// setting webhook to receive updates
app.use(
  await bot.createWebhook({
    domain: process.env.WEBHOOK_DOMAIN,
    path: "/api/bots/amandaleon",
  })
);

// creates stage
const stage = new Scenes.Stage([
  links.createLink,
  links.viewLinks,
  packs.createPack,
  packs.viewPacks,
  packs.buyPacks,
  admins.createAdmin,
  admins.viewAdmins,
  subscriptions.createSubscriptionPlan,
  subscriptions.viewActiveSubscriptionsPlan,
  subscriptions.buySubscription,
]);

const store = Mongo({
  url: process.env.MONGODB_URI,
  database: "amandaleondb",
});

bot.use(session({ store }));
bot.use(stage.middleware());
bot.use(async (ctx, next) => {
  ctx.session.db = "amandaleondb";
  ctx.session.botName = "amandaleon";
  ctx.session.tgBotLink = "Amanda_LeonBot";
  return next();
});

bot.use(composer);

bot.command("/sair", async (ctx) => {
  await ctx.scene.leave();
  await ctx.reply("Saindo");
});

bot.catch((err) => {
  console.log("Error: " + err);
});

export default app;
