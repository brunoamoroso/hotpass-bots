// import client from "../db/conn.mjs";

// export const save = async (plan) => {
//   try {
//     return await client.execute(
//       `
//             insert Subscriptions{
//                 title := <str>$title,
//                 price := <str>$price,
//                 duration := <int16>$duration,
//                 cycle := <str>$cycle,
//                 status := <str>"enabled",
//                 created_at := <datetime>$createdAt,
//                 updated_at := <datetime>$updatedAt,
//             }
//         `,
//       {
//         title: plan.title,
//         price: plan.price,
//         duration: parseInt(plan.duration),
//         cycle: plan.cycle,
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       }
//     );
//   } catch (e) {
//     console.log(e);
//   }
// };

// export const getActivePlansAdmin = async () => {
//   return await client.query(`
//       select Subscriptions {
//         title,
//         price,
//         duration,
//         cycle,
//         subscribers := (select count((select User filter User.subscriptions_bought.title = Subscriptions.title AND User.subscriptions_bought@isActive = true)))
//       };
//     `);
// };

// export const getActivePlansCustomer = async () => {
//   return await client.query(`
//       select Subscriptions {
//         id,
//         title,
//         price,
//         duration,
//         cycle,
//       } filter .status = Status.enabled;
//     `);
// };

// export const getSubscriptionPlanById = async (id) => {
//   return await client.querySingle(`
//       select Subscriptions{
//         title,
//         price,
//         duration,
//         cycle
//       } filter .id = <uuid>$id
//   `, {
//     id: id,
//   });
// }
