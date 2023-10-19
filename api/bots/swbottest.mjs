import express from "express";
import { configDotenv } from "dotenv";
import { Telegraf, Scenes, session } from "telegraf";
import { Mongo } from '@telegraf/session/mongodb';
import composer from "../index.mjs";

//Controllers
// import * as packs from "./controllers/packsController.mjs";
// import * as links from "./controllers/linkAgreggatorController.mjs";
import * as admins from "../controllers/adminsController.mjs";
// import * as subscriptions from "./controllers/subscriptionsController.mjs";

configDotenv();

const app = express();

const bot = new Telegraf(process.env.SWBOTTOKEN);

// setting webhook to receive updates
app.use(
  await bot.createWebhook({
    domain: process.env.WEBHOOK_DOMAIN,
    path: "/api/bots/swbottest",
  })
);

// bot.start((ctx) => ctx.reply("oi"));
// creates stage
const stage = new Scenes.Stage([
  // links.createLinkWizard,
  // links.viewLinks,
  // packs.createPack,
  // packs.viewPacks,
  // packs.buyPacks,
  admins.createAdmin,
  admins.viewAdmins,
  // subscriptions.createSubscription,
  // subscriptions.viewActiveSubscriptions,
  // subscriptions.buySubscription,
]);

const store = Mongo({
  url: "mongodb://localhost:27017",
  database: "swbotdb",
})

bot.use(session({store}));
bot.use(stage.middleware());
bot.use(composer);


bot.action("admins", async (ctx) => {
  admins.sendMenu(ctx);
});

bot.action("createAdmin", async (ctx) => {
  ctx.scene.enter("createAdmin");
  ctx.session.db = "swbotdb";
});

bot.command("sair", (ctx) => {
  ctx.scene.leave();
})


bot.catch(err => {
  console.log("Error: " + err);
});

export default app;
