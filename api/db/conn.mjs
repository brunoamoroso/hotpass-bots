import mongoose from "mongoose";

export default class Client {
  db = "";

  constructor(db) {
    this.db = db;
  }

  set setDb(botDb) {
    this.db = botDb;
  }

  static async client() {
    try {
      await mongoose.connect(`mongodb://localhost:27017/${this.db}`);
      console.log(`Mongoose connected to the db ${this.db}`);
      return mongoose;
    } catch (err) {
      console.log(err);
    }
  }
}
