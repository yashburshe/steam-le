"use server";

import { redirect } from "next/navigation";
import { SteamGame } from "./types";

export async function getUserGames(steamId: string) {
  const res = await fetch(
    "http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=" +
      process.env.STEAM_KEY +
      "&steamid=" +
      steamId +
      "&format=json&include_appinfo=TRUE",
    { cache: "force-cache" },
  );
  const json = await res.json();
  const games = await json.response.games;
  const gameDetails = games.map((game: SteamGame) => {
    const minutes = Number(game.playtime_forever);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    const timeString = hours + "h " + remainingMinutes + "m";

    return {
      appid: game.appid,
      name: game.name,
      icon_url:
        "http://media.steampowered.com/steamcommunity/public/images/apps/" +
        game.appid +
        "/" +
        game.img_icon_url +
        ".jpg",
      playtime: Math.round((game.playtime_forever / 60) * 100) / 100,
      playtime_hr: timeString,
    };
  });

  console.log(gameDetails);

  return gameDetails;
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
