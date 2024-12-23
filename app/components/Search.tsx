import { searchUser } from "../actions";

export default function Search({ nav }: { nav: boolean }) {
  return (
    <form className="" action={searchUser}>
      {nav ? (
        ""
      ) : (
        <label
          htmlFor="steamId"
          className="flex flex-col col-span-2 text-white/80"
        >
          Find your profile
        </label>
      )}

      <div className="flex items-center">
        <input
          className={` ${
            nav ? "text-sm p-1 px-2" : "text-lg p-3 w-80"
          }  rounded-l-sm focus:ring-2 focus:ring-blue-600 text-slate-800`}
          type="text"
          name="user"
          placeholder="SteamID/Custom URL"
        />
        <button
          type="submit"
          className={` ${
            nav ? "p-0.5" : "p-3 border-2 border-blue-400"
          } rounded-r-sm bg-blue-400   hover:border-blue-600 hover:bg-blue-600`}
        >
          <svg
            className={`${nav ? "p-1" : "p-0"}`}
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
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
      </div>
    </form>
  );
}
