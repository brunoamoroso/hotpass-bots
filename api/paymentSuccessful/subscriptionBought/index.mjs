import express from "express";
import subscriptionSchema from "../../schemas/Subscriptions.mjs";
import { getModelByTenant } from "../../utils/tenantUtils.mjs";

const app = express();

app.use((err, req, res, next) => {
  console.log(err.stack);
  res.status(500).send('Error Middleware Handling');
})

//Routes
app.post('/api/paymentSuccessful/subscriptionBought', (req, res) => {
  console.log('Subscription bought');
  console.log(req.body);
  return res.status(200).send('Subscription bought successfully');

  

  //update user with the subscription bought to in the future use as mkt strategies
  const Subscription = getModelByTenant(botdbname, "Subscription", subscriptionSchema);

  try{
    
  }catch(err){
    console.log(err);
  }
});

export default app;
