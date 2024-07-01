import Link from "next/link";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function getMatches() {
  return await prisma.match.findMany({
    include: {
      teamA: true,
      teamB: true,
    },
    orderBy: {
      date: "desc",
    },
  });
}

export default async function Matches() {
  const matches = await getMatches();

  return (
    <div>
      <h2 className="text-3xl font-bold mb-4">Matches</h2>
      <Link
        href="/matches/create"
        className="bg-green-500 dark:bg-green-700 text-white px-4 py-2 rounded inline-block mb-4"
      >
        Create New Match
      </Link>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {matches.map((match) => {
          const totalPlayers = match.teamA.length + match.teamB.length;
          const pricePerPlayer =
            totalPlayers > 0 ? match.price / totalPlayers : 0;

          return (
            <div
              key={match.id}
              className="bg-white dark:bg-gray-800 p-4 rounded shadow"
            >
              <p className="font-bold">
                {new Date(match.date).toLocaleDateString()} at {match.time}
              </p>
              <p>Location: {match.location}</p>
              <p>Total Price: ${match.price.toFixed(2)}</p>
              <p>Price per Player: ${pricePerPlayer.toFixed(2)}</p>
              <p>Result: {match.result || "Not played yet"}</p>
              <div className="mt-2">
                <p className="font-semibold">Team A:</p>
                <ul className="list-disc list-inside">
                  {match.teamA.map((player) => (
                    <li key={player.id}>{player.name}</li>
                  ))}
                </ul>
              </div>
              <div className="mt-2">
                <p className="font-semibold">Team B:</p>
                <ul className="list-disc list-inside">
                  {match.teamB.map((player) => (
                    <li key={player.id}>{player.name}</li>
                  ))}
                </ul>
              </div>
              <Link
                href={`/matches/${match.id}/edit`}
                className="text-blue-500 dark:text-blue-400 mt-2 inline-block"
              >
                Edit Match
              </Link>
              <div>
                <Link
                  href={`/matches/${match.id}/payments`}
                  className="text-blue-500 dark:text-blue-400 mt-2 inline-block"
                >
                  Manage Payments
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
