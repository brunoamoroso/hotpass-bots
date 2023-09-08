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
                insert Customer{
                    telegram_id := <int64>$telegram_id,
                    first_name := <str>$first_name,
                    last_name := <str>$last_name,
                    username := <str>$username,
                    interest_level := <str>$interest_level,
                    created_at := <datetime>$created_at,
                    updated_at := <datetime>$updated_at,
                };
            `,
              {
                telegram_id: this.user.id,
                first_name: this.user.first_name,
                last_name: this.user.last_name,
                username: this.user.username,
                interest_level: "low",
                created_at: new Date(),
                updated_at: new Date(),
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
