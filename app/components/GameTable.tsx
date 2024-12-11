"use client";

import { getUserGames } from "@/app/actions";
import Image from "next/image";
import { useEffect, useState } from "react";
import { CSVLink } from "react-csv";

export default function GameTable({
  persona,
  steamId,
}: {
  persona: string;
  steamId: string;
}) {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [csvData, setCsvData] = useState<any>([]);

  interface Game {
    appid: string;
    img_icon_url: string;
    time_to_beat: string;
    name: string;
    playtime_forever: string;
  }

  useEffect(() => {
    async function fetchGames() {
      try {
        const fetchedGames = await getUserGames(steamId);
        const csvGameData = fetchedGames.map((game) => {
          return {
            Game: game.name,
            "Time to beat": game.time_to_beat,
            "Hours Played": game.playtime_forever,
          };
        });
        setCsvData(csvGameData);
        setGames(fetchedGames);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch games:", error);
        setIsLoading(false);
      }
    }

    fetchGames();
  }, [steamId]);

  return isLoading ? (
    <div className="flex flex-col justify-center items-center p-8 gap-2">
      <svg
        className="animate-spin h-8 w-8 mr-3 ..."
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="12" y1="2" x2="12" y2="6" />
        <line x1="12" y1="18" x2="12" y2="22" />
        <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
        <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
        <line x1="2" y1="12" x2="6" y2="12" />
        <line x1="18" y1="12" x2="22" y2="12" />
        <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
        <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
      </svg>
      <p>Your games are being loaaadeddd.</p>
    </div>
  ) : (
    <div className="bg-[#171c26] flex flex-col justify-center">
      <div className="bg-slate-700 p-6 sm:p-4 md:p-2 flex flex-col transition-colors hover:bg-blue-800 hover:cursor-pointer">
        <p className="text-xs">{persona}_games.csv</p>
        <CSVLink
          data={csvData}
          asyncOnClick={true}
          filename={`${persona}_games.csv`}
          className="flex gap-2 items-center"
        >
          Download
          <svg
            className="w-4 h-4"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </CSVLink>
      </div>
      <table className="w-full">
        <thead>
          <tr className="text-xs border-b-slate-900 bg-slate-800">
            <td className="p-1 text-center">Icon</td>
            <td className="p-1 text-center">Game</td>
            <td className="p-1 text-center">Hours to beat</td>
            <td className="p-1 text-center">Hours played</td>
          </tr>
        </thead>
        <tbody>
          {games.map((game: Game) => (
            <tr
              key={game.appid}
              className="border-b border-b-slate-800 bg-slate-700"
            >
              <td className="p-1">
                <Image
                  src={game.img_icon_url}
                  width={32}
                  height={32}
                  alt={`Icon for game` + game.name}
                />
              </td>
              <td className="p-1">{game.name}</td>
              <td className="p-1 text-center">
                {game.time_to_beat === undefined ? "-" : game.time_to_beat}
              </td>
              <td className="p-1 text-center">
                {game.playtime_forever === "0h 0m"
                  ? "-"
                  : game.playtime_forever}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
