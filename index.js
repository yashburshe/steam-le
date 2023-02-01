require('dotenv').config()

var express = require('express');
var app = express();

var path = require("path")
var bodyParser = require("body-parser");

let csv = []
let nickname

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

app.set("view engine", "ejs");
app.set('port', process.env.PORT);

app.get('/', function(req, res) {
    res.render("index")
})

app.get('/help', function(req, res) {
    res.render("help")
})

async function getUser(key, username) {
    let vanityURL = "http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=" + key + "&vanityurl=" + username;
    let res = await fetch(vanityURL)
    if (!res == 'ok') {
        console.log("Test")
    }
    return await res.json();
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
    let hoursToBeat = []
    var username = req.query.id;
    nickname = username
    if (username == '') {
        res.render("error", { code: 0, message: 'Please enter a username' });
    } else {
        if (/^([0-9]{17})$/.test(username)) {
            steamid = username;
        } else {
            let user = await getUser(key, username);
            if (user.response.message == 'No match') {
                res.render("error", { code: 1, message: "No match found" })
                return;
            }
            steamid = user.response.steamid;

        }
        let profile = await getProfile(key, steamid);
        if (profile.response.players[0].communityvisibilitystate == 1 || profile.response.players[0].communityvisibilitystate == 2) {
            res.render("error", { code: 2, message: "Profile is private" })
        } else {
            let gamesOwned = await getGames(key, steamid);

            csv = "Game, Hours Played\n";
            for (var i = 0; i < gamesOwned.response.games.length; i++) {
                hoursToBeat.push(gamesOwned.response.games[i].name)
                csv += "\"" + gamesOwned.response.games[i].name + "\"" + "," +
                    gamesOwned.response.games[i].playtime_forever
                if (i != (gamesOwned.response.games.length - 1)) {
                    csv += "\n"
                }
            }

            res.render('games', {
                profilepic: profile.response.players[0].avatarmedium,
                nickname: profile.response.players[0].personaname,
                gamesList: gamesOwned.response.games,
                steamid: steamid
            })
        }
    }
});

app.get('/download', (req, res) => {
    res.status(200)
        .attachment(nickname + '_steam.csv')
        .send(csv)
})

app.listen(process.env.PORT, () => {
    console.log("Started")
})