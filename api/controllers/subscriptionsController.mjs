import { Markup, Scenes } from "telegraf";
import subscriptionSchema from "../schemas/Subscriptions.mjs";
import cycleFormat from "../utils/cycleFormat.mjs";
import { getModelByTenant } from "../utils/tenantUtils.mjs";
import Stripe from "stripe";

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
      const Subscription = getModelByTenant(ctx.session.db, "Subscription", subscriptionSchema);
      //try to create the tier of the product first on stripe
      const stripe = new Stripe(ctx.session.stripe);

      const intervalPlan = (planData.cycle === "weekly") ? "week" : "month";

      const subscriptionParams = {
        currency: 'brl',
        product: ctx.session.productId.replace("\"", ""),
        unit_amount: planData.price.replace(".", "").replace(",", ""),
        nickname: planData.title,
        recurring: {
          interval: intervalPlan,
          interval_count: planData.duration,
        }
      }
      
      //create on stripe
      await stripe.prices.create(subscriptionParams);

      //register subscription on our database
      const newSubscription = new Subscription({
        title: planData.title,
        price: planData.price,
        duration: planData.duration,
        cycle: planData.cycle,
      });
      await newSubscription.save();
      ctx.reply("Plano salvo!");
      return ctx.scene.leave();
    } catch (err) {
      console.log(err);
      return ctx.scene.leave();
    }
  }
);

export const viewActiveSubscriptionsPlan = new Scenes.WizardScene(
  "viewActiveSubscriptionsPlan",
  async (ctx) => {
    // const plans = await Subscription.find({ status: "enabled" }).lean();
    const stripe = new Stripe(ctx.session.stripe);
    const productId = "\""+ctx.session.productId+"\"";
    const resultStripe = await stripe.prices.search({
      query: `product:${productId} AND active:\"true\"`
    });
    
    const plans = resultStripe.data;


    for (let i = 0; i < plans.length; i++) {
      const plan = plans[i];
      plan.cycle = plan.cycle === "weekly" ? "Semanas" : "Meses";

      const priceFormat = new Intl.NumberFormat('pt-br', {
        style: 'currency',
        currency: 'BRL'
      });

      await ctx.reply(
        "*_Nome do Plano:_*\n" +
          plan.nickname +
          "\n\n*_Preço do Plano:_*\n" +
          priceFormat.format((plan.unit_amount/100)).replace(".", "\\.")+
          "\n\n*_Ciclo de cobrança do Plano:_*\n" +
          plan.recurring.interval_count +
          " " +
          cycleFormat(plan.recurring.interval_count, plan.recurring.interval)+
          "\n\n*_Assinantes Ativos:_*\n" +
          plan.subscribers,
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
    // const plans = await Subscription.find({ status: "enabled" }).lean();
    const stripe = new Stripe(ctx.session.stripe);
    const productId = "\""+ctx.session.productId+"\"";
    const resultStripe = await stripe.prices.search({
      query: `product:${productId} AND active:\"true\"`
    });

    const plans = resultStripe.data;

    const priceFormat = new Intl.NumberFormat('pt-br', {
      style: 'currency',
      currency: 'BRL'
    });

  // const Subscription = getModelByTenant(ctx.session.db, "Subscription", subscriptionSchema);
  // const subscriptions = await Subscription.find({ status: "enabled" }).lean();
  let keyboardBtns = [];
  plans.forEach((plan) => {
    const btnText =
      plan.nickname +
      " - " +
      plan.recurring.interval_count +
      " " +
      cycleFormat(plan.recurring.interval_count, plan.recurring.interval) + 
      " - " + 
      priceFormat.format((plan.unit_amount/100)).replace(".", "\\.");
    keyboardBtns.push([Markup.button.callback(btnText, `${plan.nickname}`)]);
  });

  await ctx.reply(
    "Tá quase tendo o privilégio de poucos amor. Escolhe por quanto tempo você quer acesso a mim 😏",
    {
      ...Markup.inlineKeyboard(keyboardBtns),
    }
  );

  return ctx.scene.leave();
});
