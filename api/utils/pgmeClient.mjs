import { Client } from "@pagarme/pagarme-nodejs-sdk";

const client = new Client({
  basicAuthUserName: process.env.PGMSK,
  basicAuthPassword: "",
});

export default client;
