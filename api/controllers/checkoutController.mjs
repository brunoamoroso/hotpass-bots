import {
  ApiError,
  CustomersController,
  PlansController,
} from "@pagarme/pagarme-nodejs-sdk";
import client from "../utils/pgmeClient.mjs";
import { validationResult } from "express-validator";

export default class CheckoutController {
  static async identify(req, res) {

    //remember to change planId to itemId and then verify if it's a pack or a plan that'll be bought
    const userId = req.params.id;
    const planId = req.params.planId;

    try {
      const plansController = new PlansController(client);
      const { result } = await plansController.getPlan(planId);

      const priceFormat = new Intl.NumberFormat("pt-br", {
        style: "currency",
        currency: "BRL",
      });

      const plan = {
        name: result.name,
        price: priceFormat.format(result.items[0].pricingScheme.price / 100),
      };

      req.session.userId = userId;
      req.session.plan = plan;
      res.render("checkout/identify", { plan });
    } catch (err) {
      if (err instanceof ApiError) {
        console.log(err);
      }
      throw new Error(err);
    }
  }

  static async identifyPost(req, res) {
    const errors = validationResult(req);
    const result = validationResult(req).mapped();
    const { fullname, email, cpf, cellphone } = req.body;
    let fieldErrors = {};
    const plan = req.session.plan;

    // validated the fields and then render if necessary
    if (!errors.isEmpty()) {
      for (const error in result) {
        if (result.hasOwnProperty(error)) {
          fieldErrors[error] = true;
        }
      }
      res.render("checkout/identify", { result, fieldErrors, plan });
      return;
    }

    //register the user if it doesn't exist

    const ddd = cellphone.slice(0, 2);
    const phone = cellphone.slice(2, 11);

    const bodyCustomer = {
      code: req.session.userId,
      name: fullname,
      email: email,
      document: cpf,
      document_type: "CPF",
      type: "individual",
      phones: {
        mobile_phone: {
          country_code: "55",
          area_code: ddd,
          number: phone,
        },
      },
      address: {},
      metadata: {},
    };

    req.session.customer = bodyCustomer;

    res.render("checkout/address", { plan });
  }

  
  static async addressPost(req, res){
    const { zipcode, city, uf, neighborhood, street, number, complement } = req.body;
    let customer = req.session.customer;
    customer.address = {
      line1: street.concat(', ', neighborhood, ', ', number),
      line2: complement,
      street: street,
      number: number,
      neighborhood: neighborhood,
      complement: complement,
      zipCode: zipcode,
      city: city,
      state: uf,
      country: 'BR',
      metadata: {}
    }

    try{
      const customerController = new CustomersController(client);
      const { result, ...httpResponse } = await customerController.createCustomer(customer);

      if(httpResponse.statusCode === 200 || httpResponse.statusCode === 201){
        req.session.customer = customer;
        res.render('checkout/payment', {plan: req.session.plan});
      }
    }catch (err) {
      if (err instanceof ApiError) {
        console.log(err);
      }
      throw new Error(err);
    }
  }
}