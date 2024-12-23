import Search from "./components/Search";

export default function Home() {
  return (
    <div className="flex flex-col gap-2 justify-center items-center pt-8">
      <div className="w-96 text-justify flex flex-col gap-2 mb-8">
        <p>
          Download your Steam library as a .csv file to easily manage your
          gaming library.
        </p>
      </div>
      <Search nav={false} />
    </div>
  );
}
