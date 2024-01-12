import { Markup, Scenes } from "telegraf";
import subscriptionSchema from "../schemas/Subscriptions.mjs";
import cycleFormat from "../utils/cycleFormat.mjs";
import { getModelByTenant } from "../utils/tenantUtils.mjs";
import { ApiError, PlansController } from "@pagarme/pagarme-nodejs-sdk";
import client from "../utils/pgmeClient.mjs";
import { configDotenv } from "dotenv";
import base64 from "base-64";

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

      // const body = {
      //   name: planData.title,
      //   description: "Assinatura de Plano",
      //   shippable: false,
      //   paymentMethods: ["credit_card"],
      //   intervalCount: planData.duration,
      //   interval: intervalPlan,
      //   currency: "BRL",
      //   statementDescriptor: "HSPLANO",
      //   minimum_price: pricePgme,
      //   billingType: "prepaid",
      //   billingDays: [],
      //   installments: [1],
      //   shippable: false,
      //   items: [{
      //     id: (Math.random()).toString(),
      //     name: planData.title,
      //     quantity: 1,
      //     description: "Assinatura de Plano",
      //     pricingScheme: {
      //       schemeType: "unit",
      //       price: pricePgme,
      //       minimumPrice: pricePgme,
      //     }
      //   }],
      //   quantity: 1,
      //   pricingScheme: {
      //     schemeType: "unit",
      //     price: pricePgme,
      //     minimumPrice: pricePgme,
      //   },
      //   metadata: {
      //     botId: ctx.botInfo.id.toString(),
      //   },
      // };

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

      console.log(responseCreatePlan);
      //create a Plan on pagar.me
      // const newPlan = new PlansController(client);
      // const { result } = await newPlan.createPlan(body);

      //register subscription on our database
      //   const newSubscription = new Subscription({
      //     title: planData.title,
      //     price: planData.price,
      //     duration: planData.duration,
      //     cycle: planData.cycle,
      //   });
      //   await newSubscription.save();
      ctx.reply("Plano salvo!");
      return ctx.scene.leave();
      // } catch (err) {
      //   console.log(err);
      //   return ctx.scene.leave();
      // }
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

  // const Subscription = getModelByTenant(ctx.session.db, "Subscription", subscriptionSchema);
  // const subscriptions = await Subscription.find({ status: "enabled" }).lean();
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
});

