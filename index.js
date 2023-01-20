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
    var gamebannerPaths = [
        'https://cdn.cloudflare.steamstatic.com/steam/apps/10/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/80/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/100/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/300/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/20/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/30/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/40/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/50/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/60/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/70/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/130/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/220/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/340/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/240/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/280/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/360/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/320/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/380/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/4000/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/400/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/420/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/500/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/6020/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/6030/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/32380/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/32390/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/32400/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/20900/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/550/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/55100/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/620/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/105600/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/20920/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/8980/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/729040/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/42680/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/42690/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/72850/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/207610/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/49520/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/219150/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/230410/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/265630/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/203160/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/233450/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/3910/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/252410/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/252950/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/265930/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/271590/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/57300/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/239200/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/274170/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/222880/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/287980/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/6880/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/8190/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/322170/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/307690/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/238320/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/261640/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/21000/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/213330/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/313690/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/730/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/255710/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/367520/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/292030/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/376210/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/413150/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/225540/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/310950/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/431960/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/275850/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/460790/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/379720/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/489830/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/289070/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/7670/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/8850/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/8870/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/409710/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/409720/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/548430/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/601220/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/9480/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/645630/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/218620/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/674940/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/38400/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/760160/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/236870/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/812810/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/638970/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/714010/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/35140/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/200260/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/208650/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/581320/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/450390/header.jpg',
    ]
    res.render("index", { gameBannerPaths: gamebannerPaths })
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
    let gameIconPath = []
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
                        gameIconPath.push("http://media.steampowered.com/steamcommunity/public/images/apps/" + games[x].appid + "/" + games[x].img_icon_url + ".jpg")
                    }
                    csvContent = "Game, Hours Played\n";
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
                                    gameIconPath: gameIconPath,
                                    csvContent: csvContent
                                })

                            })
                            .catch(error => {
                                res.render("error", { code: 3 })
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