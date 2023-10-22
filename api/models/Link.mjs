import mongoose from "../db/conn.mjs";
import { Schema } from "mongoose";

const Link = mongoose.model(
  "Link",
  new Schema(
    {
        name: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true,
        }
    },
    {
      timestamps: true,
    }
  )
);

export default Link;

