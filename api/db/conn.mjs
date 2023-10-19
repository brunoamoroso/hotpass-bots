import mongoose from "mongoose";

async function connectDb() {
  await mongoose.connect(`mongodb://localhost:27017/swbotdb`);
  console.log(`Mongoose connected to db`);
  return;
}


connectDb().catch((err) => console.log(err));

export default mongoose;
