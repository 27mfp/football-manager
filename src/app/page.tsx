import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold mb-8">Football Manager</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/matches"
          className="bg-[var(--primary)] text-white px-6 py-3 rounded-lg text-center"
        >
          Manage Matches
        </Link>
        <Link
          href="/players"
          className="bg-[var(--primary)] text-white px-6 py-3 rounded-lg text-center"
        >
          Manage Players
        </Link>
        <Link
          href="/team-generator"
          className="bg-[var(--primary)] text-white px-6 py-3 rounded-lg text-center"
        >
          Team Generator
        </Link>
        <Link
          href="/leaderboard"
          className="bg-[var(--primary)] text-white px-6 py-3 rounded-lg text-center"
        >
          Leaderboard
        </Link>
      </div>
    </div>
  );
}
