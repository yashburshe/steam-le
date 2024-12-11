import Link from "next/link";
import Search from "./Search";

export default function Navbar() {
  return (
    <nav className="bg-slate-950 ">
      <div className="py-4 px-4 sm:px-0 max-w-xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-lg font-semibold">
            🗞️ Steam2csv
          </Link>
        </div>
        <Search nav={true} />
      </div>
    </nav>
  );
}
