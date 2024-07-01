import Link from "next/link";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function getPlayers() {
  return await prisma.player.findMany({
    include: {
      teamAMatches: {
        include: {
          teamA: true,
          teamB: true,
        },
      },
      teamBMatches: {
        include: {
          teamA: true,
          teamB: true,
        },
      },
    },
    orderBy: {
      elo: "desc",
    },
  });
}

export default async function Players() {
  const players = await getPlayers();

  return (
    <div>
      <h2 className="text-3xl font-bold mb-4">Players</h2>
      <Link
        href="/players/create"
        className="bg-green-500 dark:bg-green-700 text-white px-4 py-2 rounded inline-block mb-4"
      >
        Create New Player
      </Link>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {players.map((player) => {
          const allMatches = [...player.teamAMatches, ...player.teamBMatches];
          const totalToPay = allMatches.reduce((sum, match) => {
            const totalPlayers = match.teamA.length + match.teamB.length;
            return sum + match.price / totalPlayers;
          }, 0);

          return (
            <div
              key={player.id}
              className="bg-white dark:bg-gray-800 p-4 rounded shadow"
            >
              <h3 className="text-xl font-bold">{player.name}</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Elo Rating: {player.elo.toFixed(0)}
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                Matches played: {allMatches.length}
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                Total to pay: ${totalToPay.toFixed(2)}
              </p>
              <Link
                href={`/players/${player.id}`}
                className="text-blue-500 dark:text-blue-400 mt-2 inline-block"
              >
                Edit Player
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
