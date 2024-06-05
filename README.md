# Steam2csv
View anyone's Steam library and export it to .CSV
Deployed at [steam2csv.xyz](https://steam2csv.xyz)

## Installation guide
> :exclamation: Running this project requires you to register for a Steam Web API Key which you can do over [here](https://steamcommunity.com/dev)

1. Clone the repository
2. Install requirement using `npm i`
3. Add a :gear: .env file and add the following variables
   * PORT
   * STEAM_API_KEY
   * SESSION_KEY
8. Run `nodemon index.js`

> :warning: To enable the `Sign In` flow in development, make sure to change the values of the passport
