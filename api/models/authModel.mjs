import client from "../db/conn.mjs";

class Auth {
  constructor(user) {
    //user has id, is_bot, first_name, last_name, username, language_code
    this.user = user;
  }

  async saveUser() {
    try {
      await client
        .querySingle(
          `select exists (select Customer filter .telegram_id = <int64>$telegram_id)`,
          { telegram_id: this.user.id }
        )
        .then((existsUser) => {
          if (!existsUser) {
            client.execute(
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
                telegramId: this.user.id,
                firstName: this.user.first_name,
                lastName: this.user.last_name,
                username: this.user.username,
                roleType: "customer",
                interestLevel: "low",
                createdAt: new Date(),
                updatedAt: new Date(),
              }
            );
          }
        });
    } catch (err) {
      console.log(err);
    }
  }
}

export default Auth;
