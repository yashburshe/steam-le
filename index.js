require('dotenv').config()

var express = require('express');
var app = express();

const axios = require('axios').default;

var path = require("path")
var bodyParser = require("body-parser");

let hltb = require("howlongtobeat");
let hltbService = new hltb.HowLongToBeatService();

let csvContent = ""

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

app.set("view engine", "ejs");
app.set('port', process.env.PORT);


app.get('/', function(req, res) {
    res.render("index")
})

app.get('/download', function(req, res) {
    res.status(200)
        .attachment('steam.csv')
        .send(csvContent)
})

app.get('/games', function(req, res) {
    const key = process.env.KEY;
    var steam64
    var username = req.query.steamuname;
    if (username == "") {
        res.render("error", { message: "Please enter a username", code: 0 })
    }
    let gamesList = []
    let hoursPlayed = []
    let gamebannerPath = []
    let jsonOBJ = []
    var vanityURL = "http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=" + key + "&vanityurl=" + username;



    axios.get(vanityURL)
        .then(response => {
            steam64 = response.data.response.steamid
            var gamesOwnedURL = " http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=" + key + "&steamid=" + steam64 + "&format=json&include_appinfo=TRUE"
            axios.get(gamesOwnedURL)
                .then(response => {
                    let games = response.data.response.games
                    let gameCount = response.data.response.game_count
                    for (x in games) {
                        gamesList.push(games[x].name)
                        hoursPlayed.push(Math.round(games[x].playtime_windows_forever / 60 * 10) / 10)
                        gamebannerPath.push("http://media.steampowered.com/steamcommunity/public/images/apps/" + games[x].appid + "/" + games[x].img_icon_url + ".jpg")
                    }

                    csvContent = "data:text/csv;charset=utf-8\nGame, Hours Played\n";
                    for (var i = 0; i < gamesList.length; i++) {
                        csvContent += "\"" + gamesList[i] + "\"" + "," +
                            hoursPlayed[i]
                        if (i != (gamesList.length - 1)) {
                            csvContent += "\n"
                        }
                    }
                    if (gamesList != 0) {
                        var playerSummaryURL = "http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=" + key + "&steamids=" + steam64
                        axios.get(playerSummaryURL)
                            .then(response => {
                                persona = response.data.response.players[0].personaname
                                avatar = response.data.response.players[0].avatarmedium

                                res.render("games", {
                                    gameCount: gameCount,
                                    hoursPlayed: hoursPlayed,
                                    gamesList: gamesList,
                                    uname: username,
                                    nickname: persona,
                                    profilepic: avatar,
                                    steam64: steam64,
                                    gamebannerPath: gamebannerPath,
                                    csvContent: csvContent
                                })

                            })
                            .catch(error => {
                                res.render("error")
                            })
                    } else {
                        res.render("error", { message: "This profile is either private or has no games", code: 1 })
                    }

                }).catch(error => {
                    res.render("error", { message: "This profile does not exist", code: 2 })
                })
        })
        .catch(error => {
            res.render("error")
        })


});

app.listen(process.env.PORT, () => {
    console.log("Started")
})