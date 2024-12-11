"use server";

import { redirect } from "next/navigation";

const RATE_LIMIT = 2; // Max requests per second
const MAX_CONCURRENT_REQUESTS = 1; // Max open requests
let activeRequests = 0; // Tracks active requests
const requestQueue: (() => void)[] = []; // Queue for delayed requests
const TOKEN = "pc5do04ipy8mhc88fmh4zdatze47l7";

// async function getIgdbToken() {
//   const clientId = process.env.IGDB_CLIENT_ID;
//   const clientSecret = process.env.IGDB_CLIENT_SECRET;

//   const url = `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`;

//   try {
//     const res = await fetch(url, { method: "POST" });
//     if (!res.ok) {
//       throw new Error("Error fetching Token from IGDB");
//     }
//     return await res.json();
//   } catch (error: any) {
//     throw new Error("Error fetching Token from IGDB: " + error.message);
//   }
// }

function rateLimitRequest(fn: () => Promise<unknown>) {
  return new Promise((resolve, reject) => {
    const processRequest = async () => {
      activeRequests++;
      try {
        const result = await fn();
        resolve(result);
      } catch (error) {
        reject(error);
      } finally {
        activeRequests--;
        processNextRequest();
      }
    };

    if (activeRequests < MAX_CONCURRENT_REQUESTS) {
      processRequest();
    } else {
      requestQueue.push(processRequest);
    }
  });
}

function processNextRequest() {
  if (requestQueue.length > 0) {
    const nextRequest = requestQueue.shift();
    setTimeout(() => nextRequest?.(), 1000 / RATE_LIMIT); // Space requests
  }
}

export async function getTimeToBeat(appId: number) {
  const search_url = "https://api.igdb.com/v4/websites";
  const igdbres = await rateLimitRequest(() =>
    fetch(search_url, {
      cache: "force-cache",
      method: "POST",
      headers: {
        Accept: "application/json",
        "Client-ID": process.env.IGDB_CLIENT_ID,
        Authorization: `Bearer ${TOKEN}`,
      },
      body: `fields game; where url="https://store.steampowered.com/app/${appId}";`,
    })
  );

  const json2 = await igdbres.json();

  console.log(json2);
  if (json2.length === 0) {
    return;
  }
  const igdbId = json2[0].game;

  const timeToBeatURL = "https://api.igdb.com/v4/game_time_to_beats";
  const igdbres3 = await rateLimitRequest(() =>
    fetch(timeToBeatURL, {
      cache: "force-cache",
      method: "POST",
      headers: {
        Accept: "application/json",
        "Client-ID": process.env.IGDB_CLIENT_ID,
        Authorization: `Bearer ${TOKEN}`,
      },
      body: `fields game_id, normally; where game_id = ${igdbId};`,
    })
  );

  const json3 = await igdbres3.json();

  if (json3.length === 0) {
    return;
  }

  const firstResult = json3[0];

  // Prioritize time to beat values in order of preference
  const timeToBeatOptions = [
    firstResult?.normally,
    firstResult?.hastily,
    firstResult?.completely,
  ];

  // Find the first defined time to beat value
  const ttb = timeToBeatOptions.find((time) => time !== undefined);

  return ttb;
}

export async function getUserGames(steamId: string) {
  // Set up API url
  const url =
    "http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=" +
    process.env.STEAM_KEY +
    "&steamid=" +
    steamId +
    "&format=json&include_appinfo=TRUE";

  const res = await fetch(url, { cache: "force-cache" });
  const json = await res.json();
  const games = await json.response.games;

  const gamesWithTimeToBeat = await Promise.all(
    games.map(async (game: any) => {
      const minutes = game.playtime_forever;
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      const timeString = `${hours}h ${remainingMinutes}m`;
      let timeStringTTB;
      const ttb = await getTimeToBeat(game.appid);
      if (ttb === undefined) {
        timeStringTTB = "-";
      } else {
        const totalSecondsTTB = ttb;
        const hoursTTB = Math.floor(totalSecondsTTB / 3600);
        const remainingMinutesTTB = Math.floor((totalSecondsTTB % 3600) / 60);
        timeStringTTB = `${hoursTTB}h ${remainingMinutesTTB}m`;
      }

      return {
        ...game,
        playtime_forever: timeString,
        img_icon_url: `http://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_icon_url}.jpg`,
        time_to_beat: timeStringTTB,
      };
    })
  );
  return gamesWithTimeToBeat;
}

export async function searchUser(formData: FormData) {
  redirect("/users/" + formData.get("steamId"));
}
