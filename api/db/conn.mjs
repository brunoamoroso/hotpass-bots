import mongoose from "mongoose";

async function connectDb() {
  await mongoose.connect(`mongodb+srv://vercel-admin-user:hgIkBWZCz1mkAYKr@cluster0.bc1hsng.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`);
  console.log(`Mongoose connected to db`);
  return;
}


connectDb().catch((err) => console.log(err));

export default mongoose;
