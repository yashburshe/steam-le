require("dotenv").config();
var express = require("express");
var app = express();
var path = require("path");
var bodyParser = require("body-parser");

//Passport
var passport = require("passport");
var util = require("util");
var session = require("express-session");
var SteamStrategy = require("passport-steam").Strategy;

// Development variables
// GReturnURL = "http://localhost:" + process.env.PORT + "/auth/steam/return";
// GRealm = "http://localhost:" + process.env.PORT;

GReturnURL = "https://steam2csv.yashburshe.com/auth/steam/return";
GRealm = "https://steam2csv.yashburshe.com/";

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (obj, done) {
  done(null, obj);
});

passport.use(
  new SteamStrategy(
    {
      returnURL: GReturnURL,
      realm: GRealm,
      apiKey: process.env.KEY,
    },
    function (identifier, profile, done) {
      process.nextTick(function () {
        profile.identifier = identifier;
        return done(null, profile);
      });
    }
  )
);

//Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.use(
  session({
    secret: process.env.SESSION_KEY,
    name: "steam_auth",
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 }, //7 day expiry for cookies
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.set("view engine", "ejs");
app.set("port", process.env.PORT);

let csv = [];
let nickname;

//Get Functions
async function getUser(key, username) {
  let vanityURL =
    "http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=" +
    key +
    "&vanityurl=" +
    username;
  let res = await fetch(vanityURL);
  if (!res == "ok") {
    console.log("Test");
  }
  return await res.json();
}

async function getGames(key, steamid) {
  let gamesURL =
    "http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=" +
    key +
    "&steamid=" +
    steamid +
    "&format=json&include_appinfo=TRUE";
  try {
    let res = await fetch(gamesURL);
    return await res.json();
  } catch (error) {
    console.log(error);
  }
}

async function getProfile(key, steamid) {
  let profileURL =
    "http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=" +
    key +
    "&steamids=" +
    steamid;
  try {
    let res = await fetch(profileURL);
    return await res.json();
  } catch (error) {
    console.log(error);
  }
}

//Auth Related Endpoints
app.get(
  "/auth/steam",
  passport.authenticate("steam", { failureRedirect: "/" }),
  function (req, res) {
    res.redirect("/");
  }
);

app.get(
  "/auth/steam/return",
  passport.authenticate("steam", { failureRedirect: "/" }),
  function (req, res) {
    res.redirect("/");
  }
);

app.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
}

//Endpoints
app.get("/", function (req, res) {
  res.render("index", { user: req.user });
});

app.get("/help", function (req, res) {
  res.render("help");
});

app.get("/account", async function (req, res) {
  if (!req.user) {
    res.redirect("/");
  }
  if (req.user) {
    console.log(process.env.key);
    let steamid = req.user.id;
    console.log(steamid);
    async function getGames(key, steamid) {
      let gamesURL =
        "http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=" +
        key +
        "&steamid=" +
        steamid +
        "&format=json&include_appinfo=TRUE";
      try {
        let res = await fetch(gamesURL);
        let gamesList = await res.json();
        res.render("account", {
          user: req.user,
          gamesList: gamesList.response.games,
        });
      } catch (error) {
        console.log(error);
        res.render("error", {
          code: 4,
          message: "Something went wrong",
          user: req.user,
        });
      }
    }
  }
});

app.get("/download", (req, res) => {
  res
    .status(200)
    .attachment(nickname + "_steam.csv")
    .send(csv);
});

app.get("/games", async (req, res) => {
  const key = process.env.KEY;
  let steamid;
  hoursToBeat = [];
  var username = req.query.id;
  nickname = username;
  if (username == "") {
    res.render("error", {
      code: 0,
      message: "Please enter a username",
      user: req.user,
    });
  } else {
    if (/^([0-9]{17})$/.test(username)) {
      steamid = username;
    } else {
      let user = await getUser(key, username);
      if (user.response.message == "No match") {
        res.render("error", {
          code: 1,
          message: "No match found",
          user: req.user,
        });
        return;
      }
      steamid = user.response.steamid;
    }
    let profile = await getProfile(key, steamid);
    if (
      profile.response.players[0].communityvisibilitystate == 1 ||
      profile.response.players[0].communityvisibilitystate == 2
    ) {
      res.render("error", {
        code: 2,
        message: "Profile is private",
        user: req.user,
      });
    } else {
      let gamesOwned = await getGames(key, steamid);

      csv = "Game, Hours Played\n";

      if (!gamesOwned.response.games) {
        res.render("error", {
          code: 1,
          message: "No match found",
          user: req.user,
        });
      } else {
        for (var i = 0; i < gamesOwned.response.games.length; i++) {
          hoursToBeat.push(gamesOwned.response.games[i].name);
          csv +=
            '"' +
            gamesOwned.response.games[i].name +
            '"' +
            "," +
            gamesOwned.response.games[i].playtime_forever;
          if (i != gamesOwned.response.games.length - 1) {
            csv += "\n";
          }
        }

        res.render("games", {
          profilepic: profile.response.players[0].avatarmedium,
          nickname: profile.response.players[0].personaname,
          gamesList: gamesOwned.response.games,
          steamid: steamid,
          user: req.user,
        });
      }
    }
  }
});

app.listen(process.env.PORT, () => {
  console.log("Started on port", process.env.PORT);
});
