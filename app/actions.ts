"use server";

import { redirect } from "next/navigation";
// import { Game } from "./types";
const TOKEN = "unrblqgl2eumyjfmd9im794g38hcud";
const RATE_LIMIT = 32;
const MAX_RETRIES = 3;

export async function getTimeToBeat(appId: number) {
  interface IGDBResponse {
    game: number;
    hastily?: number;
    normally?: number;
    completely?: number;
  }

  async function fetchWithRetry(url: string, body: string, retryCount = 0): Promise<IGDBResponse[]> {
    try {
      const igdbres = await fetch(url, {
        cache: "force-cache",
        method: "POST",
        headers: new Headers({
          Accept: "application/json",
          "Client-ID": process.env.IGDB_CLIENT_ID || "",
          Authorization: `Bearer ${TOKEN}`,
        }),
        body: body,
      });

      // Check for rate limiting
      if (igdbres.status === 429) {
        if (retryCount < MAX_RETRIES) {
          // Exponential backoff
          const waitTime = 1000 * Math.pow(2, retryCount);
          console.log(`Rate limit hit for appId ${appId}. Waiting ${waitTime}ms. Retry ${retryCount + 1}`);
          
          await new Promise(resolve => setTimeout(resolve, waitTime));
          
          // Retry the same request
          return fetchWithRetry(url, body, retryCount + 1);
        } else {
          throw new Error(`Max retries exceeded for appId ${appId}`);
        }
      }

      return await igdbres.json();
    } catch (error) {
      if (retryCount < MAX_RETRIES) {
        const waitTime = 1000 * Math.pow(2, retryCount);
        console.log(`Error fetching for appId ${appId}. Waiting ${waitTime}ms. Retry ${retryCount + 1}`);
        
        await new Promise(resolve => setTimeout(resolve, waitTime));
        
        return fetchWithRetry(url, body, retryCount + 1);
      }
      throw error;
    }
  }

  const search_url = "https://api.igdb.com/v4/websites";
  const json2 = await fetchWithRetry(
    search_url, 
    `fields game; where url="https://store.steampowered.com/app/${appId}";`
  );

  console.log(json2)

  if (json2.length === 0) {
    return;
  }
  const igdbId = json2[0].game;

  const timeToBeatURL = "https://api.igdb.com/v4/game_time_to_beats";
  const json3 = await fetchWithRetry(
    timeToBeatURL, 
    `fields game_id, normally; where game_id = ${igdbId};`
  );

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
  return timeToBeatOptions.find((time) => time !== undefined);
}

export async function getUserGames(steamId: string) {
  const res = await fetch(
    "http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=" +
    process.env.STEAM_KEY +
    "&steamid=" +
    steamId +
    "&format=json&include_appinfo=TRUE",
    { cache: "force-cache" }
  );
  const json = await res.json();
  const games = await json.response.games;

  const gamesWithTimeToBeat = [];
  for (let i = 0; i < games.length; i++) {
    const game = games[i];
    
    if (i > 0 && i % RATE_LIMIT === 0) {
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    const minutes = Number(game.playtime_forever);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    const timeString = `${hours}h ${remainingMinutes}m`;
    
    let timeStringTTB = "-";
    try {
      const ttb = await getTimeToBeat(Number(game.appid));
      if (ttb !== undefined) {
        const totalSecondsTTB = ttb;
        const hoursTTB = Math.floor(totalSecondsTTB / 3600);
        const remainingMinutesTTB = Math.floor((totalSecondsTTB % 3600) / 60);
        timeStringTTB = `${hoursTTB}h ${remainingMinutesTTB}m`;
      }
    } catch (error) {
      console.error(`Error fetching time to beat for game ${game.appid}:`, error);
    }

    gamesWithTimeToBeat.push({
      ...game,
      playtime_forever: timeString,
      img_icon_url: `http://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_icon_url}.jpg`,
      time_to_beat: timeStringTTB,
    });
  }

  return gamesWithTimeToBeat;
}

export async function searchUser(formData: FormData) {
  const user = formData.get("user") as string;
  redirect("/users/" + user);
}

export async function getSteamId(user: string) {
  let steamId = "";
  try {
    if (/^([0-9]{17})$/.test(user)) {
      steamId = user;
    } else {
      const url = `http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${process.env.STEAM_KEY}&vanityurl=${user}`;
      const res = await fetch(url);
      const json = await res.json();
      steamId = json.response.steamid;
    }
  } catch (error) {
    throw Error("An error occurred while finding user: " + error);
  }

  return steamId;
}
