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
  const payload = ctx.payload.split("_");
  if (payload[0] === "buyPacks") {
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
composer.on("channel_post", async (ctx) => {
  switch (ctx.channelPost.text) {
    case "/setVipChat":
      groupChat.setVipChat(ctx);
      break;

    case "/setPreviewChat":
      groupChat.setPreviewChat(ctx);
      break;

    case "/migrate":
      await migrate(ctx);
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
