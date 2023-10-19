import mongoose from "../db/conn.mjs";
import { Schema } from "mongoose";

const User = mongoose.model(
  "User",
  new Schema(
    {
      telegram_id: {
        type: Number,
        required: true,
      },
      first_name: {
        type: String,
        required: true,
      },
      last_name: String,
      username: String,
      interest_level: {
        type: String,
        default: "low",
      },
      role_type: {
        type: String,
        default: "customer",
      },
      packs_bought: {
        pack_id: Schema.Types.ObjectId,
        price: {
          type: String,
        },
        date_bought: {
          type: Date,
        },
      },
      subscriptions_bought: {
        isActive: {
          type: Boolean,
        },
        date_bought: {
          type: Date,
        },
      },
    },
    {
      timestamps: true,
    }
  )
);

export default User;

// export const checkUserRole = async (userId) => {
//   try {
//     return await client.querySingle(
//       `
//       select User { role_type } filter .telegram_id = <int64>$telegram_id
//     `,
//       {
//         telegram_id: userId,
//       }
//     );

//   } catch (err) {
//     console.log(err);
//   }
// };

// export const saveUser = async (user) => {
//   try {
//     await client.execute(
//       `
//         insert User{
//           telegram_id := <int64>$telegramId,
//           first_name := <str>$firstName,
//           last_name := <str>$lastName,
//           username := <str>$username,
//           role_type := <str>$roleType,
//           interest_level := <str>$interestLevel,
//           created_at := <datetime>$createdAt,
//           updated_at := <datetime>$updatedAt,
//         };
//       `,
//       {
//         telegramId: user.id,
//         firstName: user.first_name,
//         lastName: user.last_name,
//         username: user.username,
//         roleType: "customer",
//         interestLevel: "low",
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       }
//     );
//   } catch (err) {
//     console.log(err);
//   }
// };

