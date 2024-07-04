import Link from "next/link";

export default function Home() {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-6">Football Manager</h1>
      <div className="space-y-4">
        <Link
          href="/matches"
          className="block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Manage Matches
        </Link>
        <Link
          href="/players"
          className="block bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Manage Players
        </Link>
        <Link
          href="/team-generator"
          className="block bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
        >
          Team Generator
        </Link>
      </div>
    </div>
  );
}
