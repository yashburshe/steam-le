import { getSteamId } from "@/app/actions";
import GameTable from "@/app/components/GameTable";
import Image from "next/image";
import Link from "next/link";

export default async function User({
  params,
}: {
  params: Promise<{ user: string }>;
}) {
  const username = (await params).user;
  const steamId = await getSteamId(username);

  const profileURL =
    "http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=" +
    process.env.STEAM_KEY +
    "&steamids=" +
    steamId;
  const res = await fetch(profileURL);
  const json = await res.json();
  const player = json.response.players[0];
  const lastLogOff = new Date(player.lastlogoff * 1000).toDateString();
  const dateCreated = new Date(player.timecreated * 1000).toDateString();

  return (
    <div className="pb-12 flex flex-col md:max-w-xl w-screen md:mx-auto md:my-8">
      <div className="bg-gray-900 p-8">
        <div className="flex flex-col">
          <div className="flex items-center gap-4">
            <Image
              className="rounded-full"
              width={32}
              height={32}
              src={player.avatarfull}
              alt="avatar"
            />
            <Link
              href={player.profileurl}
              target="_blank"
              className="text-xl underline flex items-start gap-1"
            >
              {player.personaname}{" "}
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
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </Link>
          </div>

          <div>
            <div className="mt-4 grid grid-cols-2 gap-1">
              <div className="bg-slate-700 p-2 flex flex-col">
                <p className="text-xs">Steam ID</p>
                <span>{player.steamid}</span>
              </div>
              <div className="bg-slate-700 p-2 flex flex-col">
                <p className="text-xs">Last log off</p>
                <span> {lastLogOff}</span>
              </div>
              <div className="bg-slate-700 p-2 flex flex-col">
                <p className="text-xs">Date account created </p>
                <span>{dateCreated}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <GameTable persona={player.personaname} steamId={steamId} />
    </div>
  );
}
