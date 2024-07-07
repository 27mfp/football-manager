import Link from "next/link";
import prisma from "@/lib/prisma";

async function getMatch(id: string) {
  return await prisma.match.findUnique({
    where: { id: parseInt(id) },
    include: {
      players: {
        include: {
          player: true,
        },
      },
    },
  });
}

export default async function MatchDetail({
  params,
}: {
  params: { id: string };
}) {
  const match = await getMatch(params.id);

  if (!match) {
    return <div>Match not found</div>;
  }

  const teamA = match.players.filter((pm) => pm.team === "A");
  const teamB = match.players.filter((pm) => pm.team === "B");

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold mb-4">Match Details</h2>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <p>
          <strong>Date:</strong> {new Date(match.date).toLocaleDateString()}
        </p>
        <p>
          <strong>Time:</strong> {match.time}
        </p>
        <p>
          <strong>Location:</strong> {match.location}
        </p>
        <p>
          <strong>Price:</strong> ${match.price.toFixed(2)}
        </p>
        <p>
          <strong>Result:</strong> {match.result || "Not played yet"}
        </p>

        <div className="mt-4">
          <h3 className="text-xl font-semibold mb-2">Team A</h3>
          <ul className="list-disc list-inside">
            {teamA.map((pm) => (
              <li key={pm.id}>
                {pm.player.name} (Elo: {pm.player.elo.toFixed(0)})
                <span
                  className={`ml-2 ${
                    pm.paid ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {pm.paid ? "Paid" : "Unpaid"}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-4">
          <h3 className="text-xl font-semibold mb-2">Team B</h3>
          <ul className="list-disc list-inside">
            {teamB.map((pm) => (
              <li key={pm.id}>
                {pm.player.name} (Elo: {pm.player.elo.toFixed(0)})
                <span
                  className={`ml-2 ${
                    pm.paid ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {pm.paid ? "Paid" : "Unpaid"}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 space-x-4">
          <Link
            href={`/matches/${match.id}/edit`}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            Edit Match
          </Link>
          <Link
            href={`/matches/${match.id}/payments`}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
          >
            Manage Payments
          </Link>
        </div>
      </div>
    </div>
  );
}
