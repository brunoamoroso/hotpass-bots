import { Telegraf, Scenes, session } from "telegraf";
import express from "express";
import { configDotenv } from "dotenv";

//Controllers
import * as packs from "./controllers/packsController.mjs";
import * as links from "./controllers/linkAgreggatorController.mjs";
import * as admins from "./controllers/adminsController.mjs";
import * as auth from "./controllers/authController.mjs";
import * as subscriptions from "./controllers/subscriptionsController.mjs";

import mainMenu from "./mainMenu.mjs";

configDotenv();
const app = express();

const bot = new Telegraf(process.env.TOKEN);
// const SECRET_HASH = "32e58fbahey833349df3383dc910e180";

// setting webhook to receive updates
// app.use(await bot.createWebhook({domain: process.env.WEBHOOK_DOMAIN, path: '/api/'}))

//creates stage
const stage = new Scenes.Stage([
  links.createLinkWizard,
  links.viewLinks,
  packs.createPack,
  packs.viewPacks,
  packs.buyPacks,
  admins.createAdmin,
  admins.viewAdmins,
  subscriptions.createSubscription,
  subscriptions.viewActiveSubscriptions,
  subscriptions.buySubscription
]);
bot.use(session());
bot.use(stage.middleware());

//Initial message and entrypoint
bot.start((ctx) => {
  auth.authUser(ctx).then((resp) => {
    mainMenu(ctx, resp);
    ctx.session.userRole = resp;
  });
});


bot.command("/menu", (ctx) => {
  ctx.scene.leave();
  mainMenu(ctx);
});

//Subscriptions
//Admin
bot.action("subscriptions", (ctx) => {
  subscriptions.sendMenu(ctx);
});

bot.action("createSubscriptionPlan", (ctx) => {
  ctx.scene.enter("createSubscriptionPlanScene");
});

bot.action("viewActiveSubscriptions", (ctx) => {
  ctx.scene.enter("viewActivePlansScene");
})

//Customer
bot.action("subscriptionsCustomer", (ctx) => {
  ctx.scene.enter("buySubscriptionScene");
})

//End of Subscriptions

//Packs
//Admin
bot.action("packs", (ctx) => {
  packs.sendMenu(ctx);
});

bot.action("createPack", (ctx) => {
  ctx.scene.enter("createPackScene");
});

bot.action("viewPacks", (ctx) => {
  ctx.scene.enter("viewPacksScene");
});

//Customer
bot.action("packsCustomer", (ctx) => {
  ctx.scene.enter("buyPacksScene");
});

bot.on("pre_checkout_query", (ctx) => {
  ctx.answerPreCheckoutQuery(true);
});
//End of Packs

//Links Agreggator
//Admin
bot.action("links", (ctx) => {
  links.sendMenu(ctx);
});

bot.action("createLink", (ctx) => {
  ctx.scene.enter("createLinkScene");
});

bot.action("viewLinks", (ctx) => {
  ctx.scene.enter("viewLinksScene");
});

links.viewLinks.leave((ctx) => {
  setTimeout(() => {
    mainMenu(ctx);
  }, 2000);
});

//Customer
bot.action("linksCustomer", (ctx) => {
  links.sendCustomerLinks(ctx);
});
//End of Link Agreggator

//Create Admin
bot.action("admins", (ctx) => {
  admins.sendMenu(ctx);
});

bot.action("createAdmin", (ctx) => {
  ctx.scene.enter("createAdminScene");
});

bot.action("viewAdmins", (ctx) => {
  ctx.scene.enter("viewAdminsScene");
});

app.use("/", (req, res) => {
  bot.launch();
});

// app.post("/:botId", (req, res) => {
//   console.log(req.params.botId);
// });

export default app;
