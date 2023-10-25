import { Schema } from "mongoose";

const subscriptionSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
      required: true,
    },
    cycle: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "enabled",
    },
  },
  { timestamps: true }
);

export default subscriptionSchema;
