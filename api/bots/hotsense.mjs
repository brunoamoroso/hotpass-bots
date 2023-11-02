import express from "express";
import { configDotenv } from "dotenv";
import { Telegraf, Scenes, session } from "telegraf";
import { Mongo } from "@telegraf/session/mongodb";
import composer from "../index.mjs";

//Controllers
import * as packs from "../controllers/packsController.mjs";
import * as links from "../controllers/linkAgreggatorController.mjs";
import * as admins from "../controllers/adminsController.mjs";
import * as subscriptions from "../controllers/subscriptionsController.mjs";

configDotenv();

const app = express();

const bot = new Telegraf(process.env.HOTSENSEBOT_TOKEN);

// setting webhook to receive updates
app.use(
  await bot.createWebhook({
    domain: process.env.WEBHOOK_DOMAIN,
    path: "/api/bots/hotsense",
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
  database: "hotsense",
});

bot.use(session({ store }));
bot.use(stage.middleware());
bot.use(async (ctx, next) => {
  ctx.session.db = "hotsense";
  ctx.session.stripe = process.env.HOTSENSE_STRIPE
  ctx.session.productId = "prod_OvIXeLdH4iwsBx";
  return next();
});
bot.use(composer);

bot.command("sair", async (ctx) => {
  await ctx.scene.leave();
  return ctx.reply("Saindo");
});

bot.catch((err) => {
  console.log("Error: " + err);
});

export default app;
