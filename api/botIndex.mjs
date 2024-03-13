import { Composer } from "telegraf";

//Controllers
import * as packs from "./controllers/packsController.mjs";
import * as links from "./controllers/linkAgreggatorController.mjs";
import * as admins from "./controllers/adminsController.mjs";
import * as auth from "./controllers/authController.mjs";
import * as subscriptions from "./controllers/subscriptionsController.mjs";
import * as groupChat from "./controllers/groupChatController.mjs";

import mainMenu from "./mainMenu.mjs";
import { getModelByTenant } from "./utils/tenantUtils.mjs";
import userSchema from "./schemas/User.mjs";
import botConfigSchema from "./schemas/BotConfig.mjs";
import mongoose from "mongoose";

const composer = new Composer();

composer.start(async (ctx) => {
  const role = await auth.authUser(ctx.from, ctx.session.db);

  const payload = ctx.payload.split("_");
  if (payload[0] === "buyPacks") {
    // it lacks the initialState to show only the specific pack to buy
    await ctx.scene.enter("buyPacks");
    return;
  }

  if(ctx.payload === "viewPacks"){
    await ctx.scene.enter("buyPacks");
    return;
  }

  if(ctx.payload === "viewSubscriptions"){
    await ctx.scene.enter("buySubscription");
    return;
  }

  await mainMenu(ctx, role);
});

//Subscriptions
//Admin
composer.action("subscriptions", async (ctx) => {
  await subscriptions.sendMenu(ctx);
});

composer.action("createSubscriptionPlan", async (ctx) => {
  await ctx.scene.enter("createSubscriptionPlan");
});

composer.action("viewActiveSubscriptionsPlan", async (ctx) => {
  await ctx.scene.enter("viewActiveSubscriptionsPlan");
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

// Customer
composer.action("linksCustomer", (ctx) => {
  links.sendCustomerLinks(ctx);
});
// End of Link Agreggator

//Message Trigger
composer.action("msgTrigger", async (ctx) => {
  await ctx.scene.enter("msgTrigger");
});

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
composer.on("channel_post", async (ctx) => {
  switch (ctx.channelPost.text) {
    case "/setVipChat":
      groupChat.setVipChat(ctx);
      break;

    case "/setPreviewChat":
      groupChat.setPreviewChat(ctx);
      break;
  }
});

composer.on("chat_join_request", async (ctx) => {
  if (ctx.chatJoinRequest) {
    try {
      const requestedUser = ctx.chatJoinRequest.user_chat_id;
      const UserModel = getModelByTenant(ctx.session.db, "User", userSchema);
      const UserHasActiveSubscription = await UserModel.findOne({
        telegram_id: requestedUser,
        subscriptions_bought: { $elemMatch: { status: "active" } },
      });

      if (UserHasActiveSubscription) {
        await ctx.approveChatJoinRequest(UserHasActiveSubscription.telegram_id);
        await ctx.revokeChatInviteLink(
          ctx.chatJoinRequest.chat.id,
          ctx.chatJoinRequest.invite_link.invite_link
        );
        return;
      }

      await ctx.declineChatJoinRequest(
        ctx.chatJoinRequest.chat.id,
        requestedUser
      );
      await ctx.telegram.sendMessage(
        requestedUser,
        "Você não tem uma assinatura ativa para acessar o Grupo VIP"
      );
    } catch (err) {
      console.log(err);
    }
  }
});

composer.command("migrate", async (ctx) => {
  await ctx.scene.enter("migrate");
});

export default composer;
