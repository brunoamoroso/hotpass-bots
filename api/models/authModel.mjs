import client from "../db/conn.mjs";

export const checkUserRole = async (userId) => {
  try {
    const userRole = await client.querySingle(
      `
      select User { role_type } filter .telegram_id = <int64>$telegram_id
    `,
      {
        telegram_id: userId,
      }
    );

    return userRole;
  } catch (err) {
    console.log(err);
  }
};

export const saveUser = async (user) => {
  try {
    await client.execute(
      `
        insert User{
          telegram_id := <int64>$telegramId,
          first_name := <str>$firstName,
          last_name := <str>$lastName,
          username := <str>$username,
          role_type := <str>$roleType,
          interest_level := <str>$interestLevel,
          created_at := <datetime>$createdAt,
          updated_at := <datetime>$updatedAt,
        };
      `,
      {
        telegramId: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        username: user.username,
        roleType: "customer",
        interestLevel: "low",
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    );
  } catch (err) {
    console.log(err);
  }
};
