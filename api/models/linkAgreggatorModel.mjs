// import client from "../db/conn.mjs";

// export const saveLink = async (linkData) => {
//   try {
//     await client.execute(
//       `insert Links{
//                 name := <str>$name,
//                 url := <str>$url
//             }`,
//       {
//         name: linkData.name,
//         url: linkData.url,
//       }
//     );

//     return { message: "Link Salvo!", status: 200 };
//   } catch (err) {
//     return { message: "Tivemos um problema", status: 500 };
//   }
// };

// export const getLinks = async () => {
//   try {
//     const links = await client.query(`
//                 select Links {*};
//             `);

//     return links;
//   } catch (err) {
//     console.log(err);
//   }
// };

// export const deleteLink = async (linkId) => {
//   try {
//     await client.execute(
//       `
//                 delete Links filter .id = <uuid>$id
//             `,
//       {
//         id: linkId,
//       }
//     );

//     return { message: "Link Excluído!", status: 200 };
//   } catch (err) {
//     return { message: "Tivemos um problema!", status: 500 };
//     console.log(err);
//   }
// };