import Link from "next/link";

export default function Home() {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-4">Welcome to Football Manager</h2>
      <div className="space-x-4">
        <Link
          href="/matches"
          className="bg-blue-500 text-white px-4 py-2 rounded inline-block"
        >
          View Matches
        </Link>
        <Link
          href="/players"
          className="bg-green-500 text-white px-4 py-2 rounded inline-block"
        >
          View Players
        </Link>
      </div>
    </div>
  );
}
