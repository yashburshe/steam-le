require('dotenv').config()

var express = require('express');
var app = express();

var path = require("path")
var bodyParser = require("body-parser");

let hltb = require("howlongtobeat");
let hltbService = new hltb.HowLongToBeatService();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

app.set("view engine", "ejs");
app.set('port', process.env.PORT);

app.get('/', function(req, res) {
    res.render("index")
})

async function getUser(key, username) {
    let vanityURL = "http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=" + key + "&vanityurl=" + username;
    try {
        let res = await fetch(vanityURL);
        return await res.json();
    } catch (error) {
        console.log(error);
        return error
    }
}

async function getGames(key, steamid) {
    let gamesURL = "http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=" + key + "&steamid=" + steamid + "&format=json&include_appinfo=TRUE"
    try {
        let res = await fetch(gamesURL);
        return await res.json();
    } catch (error) {
        console.log(error);
    }
}

async function getProfile(key, steamid) {
    let profileURL = "http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=" + key + "&steamids=" + steamid
    try {
        let res = await fetch(profileURL);
        return await res.json();
    } catch (error) {
        console.log(error);
    }
}

app.get('/games', async (req, res) => {
    const key = process.env.KEY;
    let steamid;

    var username = req.query.id;

    if (username == '') {
        res.render("error", { code: 0, message: 'Please enter a username' });
    } else {
        if (/^([0-9]{17})$/.test(username)) {
            steamid = username;
        } else {
            let user = await getUser(key, username);
            steamid = user.response.steamid;
        }
        let gamesOwned = await getGames(key, steamid);
        let profile = await getProfile(key, steamid);
        res.render('games', {
            profilepic: profile.response.players[0].avatarmedium,
            nickname: profile.response.players[0].personaname,
            gamesList: gamesOwned.response.games,
            steamid: steamid
        })
    }
});

app.listen(process.env.PORT, () => {
    console.log("Started")
})