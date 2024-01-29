# Setting up a Bot

## Inside the project
First you need to create a file for the bot. It's highly recommended to use the name of the person that will be the owner.

Then you should set its path for webhooks, its database name that'll be used along the service.

## Set the telegram webhook
After pushing the last changes to the remote branch its time to set the webhook on the telegram server
https://api.telegram.org/bot{ADD TOKEN HERE}/setWebhook?url={OUR SERVER PATH}

## Set split rules and BotConfigs
Get the owner and the representant bank accounts, register them as receivers at Pagar.me. Set the preview chat and the VIP chat to create a collection named BotConfigs where you are going to set the split rules (copy from other bot);