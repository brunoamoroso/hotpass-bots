import { Schema } from "mongoose";

const botConfigSchema = new Schema(
  {
    channel_id: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default botConfigSchema;