import Link from "next/link";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function getPlayers() {
  return await prisma.player.findMany({
    include: {
      teamAMatches: true,
      teamBMatches: true,
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
        className="bg-green-500 text-white px-4 py-2 rounded inline-block mb-4"
      >
        Create New Player
      </Link>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {players.map((player) => (
          <div key={player.id} className="bg-white p-4 rounded shadow">
            <h3 className="text-xl font-bold">{player.name}</h3>
            <p>
              Matches played:{" "}
              {player.teamAMatches.length + player.teamBMatches.length}
            </p>
            <Link
              href={`/players/${player.id}`}
              className="text-blue-500 mt-2 inline-block"
            >
              Edit Player
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
