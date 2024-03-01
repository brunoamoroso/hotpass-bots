import { Markup, Scenes } from "telegraf";
import subscriptionSchema from "../schemas/Subscriptions.mjs";
import cycleFormat from "../utils/cycleFormat.mjs";
import { getModelByTenant } from "../utils/tenantUtils.mjs";
import { ApiError, PlansController, SubscriptionsController } from "@pagarme/pagarme-nodejs-sdk";
import client from "../utils/pgmeClient.mjs";
import { configDotenv } from "dotenv";
import base64 from "base-64";
import botConfigSchema from "../schemas/BotConfig.mjs";
import userSchema from "../schemas/User.mjs";
import mongoose from "mongoose";

configDotenv();

export const sendMenu = (ctx) => {
  ctx.reply("O que você quer fazer nas assinaturas?", {
    ...Markup.inlineKeyboard([
      [Markup.button.callback("Criar um Plano", "createSubscriptionPlan")],
      [
        Markup.button.callback(
          "Ver Planos Ativos",
          "viewActiveSubscriptionsPlan"
        ),
      ],
    ]).oneTime(),
  });
};

export const createSubscriptionPlan = new Scenes.WizardScene(
  "createSubscriptionPlan",
  (ctx) => {
    ctx.scene.session.planData = {};
    ctx.reply("Certo, comece me enviando qual será o nome do seu plano");
    ctx.wizard.next();
  },
  (ctx) => {
    ctx.scene.session.planData.title = ctx.message.text;
    ctx.reply("Agora me fale quanto vai custar o plano de assinatura");
    ctx.wizard.next();
  },
  (ctx) => {
    ctx.scene.session.planData.price = ctx.message.text;
    ctx.reply(
      "O plano será cobrado dos assinates a cada X Semanas ou X Meses?",
      {
        ...Markup.inlineKeyboard([
          [Markup.button.callback("Semanas", "weekly")],
          [Markup.button.callback("Meses", "monthly")],
        ]),
      }
    );
    ctx.wizard.next();
  },
  (ctx) => {
    ctx.scene.session.planData.cycle = ctx.callbackQuery.data;
    const chosenOpt = ctx.callbackQuery.data === "weekly" ? "Semanas" : "Meses";
    ctx.reply(
      `\*Você escolheu:  ${chosenOpt}*\n\nAgora digite após quantos\\(as\\) ${chosenOpt} será cobrado o pagamento para continuar acessando o plano\\. \n\nEx: 2 para 2 ${chosenOpt}`,
      {
        parse_mode: "MarkdownV2",
      }
    );

    ctx.wizard.next();
  },
  async (ctx) => {
    try {
      ctx.scene.session.planData.duration = ctx.message.text;
      const planData = ctx.scene.session.planData;
      const Subscription = getModelByTenant(
        ctx.session.db,
        "Subscription",
        subscriptionSchema
      );

      const intervalPlan = planData.cycle === "weekly" ? "week" : "month";

      if (!planData.price.includes(".") && !planData.price.includes(",")) {
        //if the price doesn't have any . or , it multiples  by 100 to turn in cents so a 100 wouldn't 1,00
        planData.price = planData.price * 100;
      } else if (planData.price.includes(".") || planData.price.includes(",")) {
        planData.price = planData.price.replace(",", "").replace(".", "");
      }

      const pricePgme = Number.parseInt(planData.price);

      const bodyCreatePlan = {
        name: planData.title,
        description: "Assinatura de plano",
        shippable: false,
        payment_methods: ["credit_card"],
        installments: [1],
        minimum_price: pricePgme,
        statement_descriptor: "HSPLANO",
        currency: "BRL",
        interval: intervalPlan,
        interval_count: planData.duration,
        billing_type: "prepaid",
        items: [
          {
            name: planData.title,
            description: "Assinatura de Plano",
            quantity: 1,
            pricing_scheme: {
              scheme_type: "unit",
              price: pricePgme,
              minimum_price: pricePgme,
            },
            cycles: 12,
          },
        ],
        metadata: {
          botId: ctx.botInfo.id.toString(),
        },
      };

      const user = process.env.PGMSK;
      const password = "";

      const responseCreatePlan = await fetch(
        "https://api.pagar.me/core/v5/plans",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${base64.encode(`${user}:${password}`)}`,
          },
          body: JSON.stringify(bodyCreatePlan),
        }
      ).then((resp) => {
        if (!resp.ok) {
          throw new Error(resp.statusText);
        }
        return resp.json();
      });

      ctx.reply("Plano salvo!");
      return ctx.scene.leave();

    } catch (err) {
      ctx.scene.leave();
      if (err instanceof ApiError) {
        console.log(err);
      }
      throw new Error(err);
    }
  }
);

export const viewActiveSubscriptionsPlan = new Scenes.WizardScene(
  "viewActiveSubscriptionsPlan",
  async (ctx) => {
    const plansController = new PlansController(client);
    const { result } = await plansController.getPlans();
    const filteredPlans = result.data.filter(
      (plan) => plan.metadata.botId === ctx.botInfo.id.toString()
    );
    const plans = filteredPlans;

    for (let i = 0; i < plans.length; i++) {
      const plan = plans[i];

      const priceFormat = new Intl.NumberFormat("pt-br", {
        style: "currency",
        currency: "BRL",
      });

      const planPrice = plan.items[0].pricingScheme.price;

      await ctx.reply(
        "*_Nome do Plano:_*\n" +
          plan.name +
          "\n\n*_Preço do Plano:_*\n" +
          priceFormat.format(planPrice / 100).replace(".", "\\.") +
          "\n\n*_Ciclo de cobrança do Plano:_*\n" +
          plan.intervalCount +
          " " +
          cycleFormat(plan.intervalCount, plan.interval) +
          "\n\n*_Assinantes Ativos:_*\n" +
          "Teste",
        {
          parse_mode: "MarkdownV2",
        }
      );
    }
    return ctx.scene.leave();
  }
);

export const buySubscription = new Scenes.BaseScene("buySubscription");

buySubscription.enter(async (ctx) => {
  try{
    const UserModel = getModelByTenant(ctx.session.db, "User", userSchema);
    const userHasSubscriptionActive = await UserModel.findOne({telegram_id: ctx.chat.id, subscriptions_bought: { $elemMatch: {status: "active"}}});
    
    if(userHasSubscriptionActive){
      const BotConfig = getModelByTenant(ctx.session.db, "BotConfig", botConfigSchema);
      const vipChat = await BotConfig.findOne().lean();

      const chatInviteLink = await ctx.telegram.createChatInviteLink(
        vipChat.vip_chat_id,
        { chat_id: vipChat.vip_chat_id, creates_join_request: true }
      );
      await ctx.telegram.sendMessage(
        ctx.chat.id,
        "Sua assinatura ainda está ativa. Vem aproveitar tudo de mim aqui no grupo VIP",
        {
          chat_id: ctx.chat.id,
          ...Markup.inlineKeyboard([
            Markup.button.url(
              "Acesso ao grupo VIP",
              chatInviteLink.invite_link
            ),
          ]),
        }
      );

      return;
    }

    const plansController = new PlansController(client);
    const { result } = await plansController.getPlans();
    const filteredPlans = result.data.filter(
      (plan) => plan.metadata?.botId === ctx.botInfo.id.toString()
    );
    const plans = filteredPlans;
  
    const priceFormat = new Intl.NumberFormat("pt-br", {
      style: "currency",
      currency: "BRL",
    });
  
    let keyboardBtns = [];
    plans.forEach((plan) => {
      const planPrice = plan.items[0].pricingScheme.price;
      const btnText =
        plan.name +
        " - " +
        plan.intervalCount +
        " " +
        cycleFormat(plan.intervalCount, plan.interval) +
        " - " +
        priceFormat.format(planPrice / 100).replace(".", "\\.");
  
      keyboardBtns.push([
        Markup.button.url(
          btnText,
          process.env.CHECKOUT_DOMAIN + ctx.session.botName + "/" + ctx.from.id + "/" + plan.id
        ),
      ]);
    });
  
    await ctx.reply(
      "Tá quase tendo o privilégio de poucos amor. Escolhe por quanto tempo você quer ter acesso a mim 😏",
      {
        ...Markup.inlineKeyboard(keyboardBtns),
      }
    );
  }catch(err){
    console.log(err);
  }
});

export const subscriptionBought = async (bot, botName, customer_chat_id, subscription_id) => {
    try {
      const BotConfig = getModelByTenant(botName+"db", "BotConfig", botConfigSchema);
      const vipChat = await BotConfig.findOne().lean();

      //from pagar.me

      const user = process.env.PGMSK;
      const password = "";

      const subscriptionData = await fetch(
        `https://api.pagar.me/core/v5/subscriptions/${subscription_id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${base64.encode(`${user}:${password}`)}`,
          },
        }
      ).then((resp) => {
        if (!resp.ok) {
          throw new Error(resp.statusText);
        }
        return resp.json();
      });

      const subscriptionBought = {
        _id: new mongoose.Types.ObjectId().toString(),
        subscription_id: subscription_id,
        plan_id: subscriptionData.plan.id,
        name: subscriptionData.plan.name,
        interval: subscriptionData.plan.interval,
        intervalCount: subscriptionData.plan.interval_count,
        price: subscriptionData.plan.minimum_price,
        status: "active",
        date_bought: new Date(),
        date_exp: new Date(subscriptionData.next_billing_at),
      }

      // update user with subscription bought for future marketing strategies
      const UserModel = getModelByTenant(botName+"db", "User", userSchema);
      await UserModel.findOneAndUpdate({telegram_id: customer_chat_id}, {
        $set: {customer_pgme_id: subscriptionData.customer.id, interest_level: "high"},
        $push: {subscriptions_bought: subscriptionBought}});

      const chatInviteLink = await bot.telegram.createChatInviteLink(
        vipChat.vip_chat_id,
        { chat_id: vipChat.vip_chat_id, creates_join_request: true }
      );
      await bot.telegram.sendMessage(
        customer_chat_id,
        "✅ Pagamento confirmado"
      );
      await bot.telegram.sendMessage(
        customer_chat_id,
        "Bem vindo ao Grupo VIP",
        {
          chat_id: customer_chat_id,
          ...Markup.inlineKeyboard([
            Markup.button.url(
              "Acesso ao grupo VIP",
              chatInviteLink.invite_link
            ),
          ]),
        }
      );
    } catch (err) {
      console.log(err);
    }
};

