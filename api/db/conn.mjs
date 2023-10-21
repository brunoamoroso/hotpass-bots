import mongoose from "mongoose";
import { configDotenv } from "dotenv";
configDotenv();

async function connectDb() {
  if(process.env.ENVIRONMENT === "production"){
    await mongoose.connect(`mongodb+srv://vercel-admin-user:hgIkBWZCz1mkAYKr@cluster0.bc1hsng.mongodb.net/swbotdb?retryWrites=true&w=majority`);
  }else{
    await mongoose.connect("mongodb://localhost:27017/swbotdb");
    console.log(`Mongoose connected to local db`);
  }
  return;
}


connectDb().catch((err) => console.log(err));

export default mongoose;
