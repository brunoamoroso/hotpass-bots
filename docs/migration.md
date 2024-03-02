# Migration

## Requisitions
 - The owner of the chat needs to be the creator, or at least the admin;
 - The creator needs to add us as an admin;
 - We need to add our bot as an admin;

 ---

 ## Disclaimer
 Our process of migration was designed so the creators won't need to create another channel or group. We will handle everything on our side by executing scripts on the telegram web so we can take every chat member its telegram id, add on our database and set a basic subscription that will last for 1 month. After this if they don't renew their subscriptions they will be removed from the chat;
 
 ---

 ## Scripts
 We can find our scripts to get the telegram ids based on these gists https://gist.github.com/brunoamoroso/360f9a965f24bf884c7501954ed97853

 1. Open the developer tools;
 2. Open the chat members;
 3. Execute the first script about getting all the ids;
 4. Open the chat admins;
 5. Get id by id and add onto the other script;
 6. Run the other script so it'll remove the chatAdmins from the members Chat;
 7. Use the returned array to create the migration for this bot;