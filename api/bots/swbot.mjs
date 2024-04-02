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
import * as migration from '../controllers/migrationController.mjs';
import * as msgTrigger from '../controllers/msgTriggerController.mjs';
import * as customStart from '../controllers/customStartController.mjs';

configDotenv();

const app = express();

const bot = new Telegraf(process.env.SWBOTTOKEN);

app.post("/api/bots/swbot", async (req, res, next) => {
  const {
    customer_chat_id,
    subscription_id,
    order_id,
    plan_id,
    pack_id,
    type_item_bought,
    bot_name,
    payment_type
  } = req.body || {};

  if (type_item_bought !== undefined && type_item_bought === "subscription") {
    await subscriptions.subscriptionBought(
      bot,
      bot_name,
      customer_chat_id,
      subscription_id,
      order_id,
      plan_id,
      payment_type
    );
  }

  if (type_item_bought !== undefined && type_item_bought === "pack") {
    await packs.packBought(bot, bot_name, customer_chat_id, pack_id, payment_type);
  }

  next();
});

// setting webhook to receive updates
app.use(
  await bot.createWebhook({
    domain: process.env.WEBHOOK_DOMAIN,
    path: "/api/bots/swbot",
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
  migration.migrate,
  msgTrigger.msgTrigger,
  customStart.customStartCreator
]);

stage.command("cancelar", async (ctx) => {
  return ctx.scene.leave();
});

const store = Mongo({
  url: process.env.MONGODB_URI,
  database: "swbotdb",
});

bot.use(session({ store }));
bot.use(stage.middleware());
bot.use(async (ctx, next) => {
  ctx.session.db = "swbotdb";
  ctx.session.botName = "swbot";
  ctx.session.tgBotLink = "VercelTestebot";
  return next();
});
bot.use(composer);

bot.command("sair", async (ctx) => {
  await ctx.scene.leave();
  await ctx.reply("Saindo");
  ctx.telegram.unbanChatMember({
    o
  });
});

bot.catch((err) => {
  console.log("Error: " + err);
});

export default app;
