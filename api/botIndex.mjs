import { Composer } from "telegraf";

//Controllers
import * as packs from "./controllers/packsController.mjs";
import * as links from "./controllers/linkAgreggatorController.mjs";
import * as admins from "./controllers/adminsController.mjs";
import * as auth from "./controllers/authController.mjs";
import * as subscriptions from "./controllers/subscriptionsController.mjs";
import * as groupChat from './controllers/groupChatController.mjs';

import mainMenu from "./mainMenu.mjs";

const composer = new Composer();

composer.start(async (ctx) => {
  if(ctx.payload === "packsCustomer"){
    await ctx.scene.enter("buyPacks");
    return;
  }
  
  await auth.authUser(ctx.from, ctx.session.db).then((role) => {
    mainMenu(ctx, role);
  });
});

//Subscriptions
//Admin
composer.action("subscriptions", (ctx) => {
  subscriptions.sendMenu(ctx);
});

composer.action("createSubscriptionPlan", (ctx) => {
  ctx.scene.enter("createSubscriptionPlan");
});

composer.action("viewActiveSubscriptionsPlan", (ctx) => {
  ctx.scene.enter("viewActiveSubscriptionsPlan");
});

// Customer
composer.action("subscriptionsCustomer", async (ctx) => {
  await ctx.scene.enter("buySubscription");
});

// End of Subscriptions

// Packs
// Admin
composer.action("packs", (ctx) => {
  packs.sendMenu(ctx);
});

composer.action("createPack", async (ctx) => {
  await ctx.scene.enter("createPack");
});

composer.action("viewPacks", async (ctx) => {
  await ctx.scene.enter("viewPacks");
});

//Customer
composer.action("packsCustomer", async (ctx) => {
  await ctx.scene.enter("buyPacks");
});
// End of Packs

// Links Agreggator
// Admin
composer.action("links", (ctx) => {
  links.sendMenu(ctx);
});

composer.action("createLink", (ctx) => {
  ctx.scene.enter("createLink");
});

composer.action("viewLinks", (ctx) => {
  ctx.scene.enter("viewLinks");
});

// // links.viewLinks.leave((ctx) => {
// //   setTimeout(() => {
// //     mainMenu(ctx);
// //   }, 2000);
// // });

// Customer
composer.action("linksCustomer", (ctx) => {
  links.sendCustomerLinks(ctx);
});
// End of Link Agreggator

// Create Admin
composer.action("admins", async (ctx) => {
  admins.sendMenu(ctx);
});

composer.action("createAdmin", async (ctx) => {
  ctx.scene.enter("createAdmin");
});

composer.action("viewAdmins", async (ctx) => {
  ctx.scene.enter("viewAdmins");
});

//Define Target Chats
composer.on('channel_post', async (ctx) => {
  switch (ctx.channelPost.text) {
    case "/setVipChat":
      groupChat.setVipChat(ctx);
      break;

    case "/setPreviewChat":
      groupChat.setPreviewChat(ctx);
      break;
  }
});

export default composer;
