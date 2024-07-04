import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const match = await prisma.match.findUnique({
    where: { id: Number(params.id) },
    include: {
      players: {
        include: {
          player: true,
        },
      },
    },
  });

  if (!match) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 });
  }

  return NextResponse.json(match);
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const { date, time, price, location, result, teamA, teamB } = body;

  // Fetch the current match data
  const currentMatch = await prisma.match.findUnique({
    where: { id: Number(params.id) },
    include: {
      players: true,
    },
  });

  if (!currentMatch) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 });
  }

  // Prepare the new player data
  const newPlayers = [
    ...teamA.map((playerId: number) => ({ playerId, team: "A" })),
    ...teamB.map((playerId: number) => ({ playerId, team: "B" })),
  ];

  // Update the match
  const updatedMatch = await prisma.match.update({
    where: { id: Number(params.id) },
    data: {
      date: new Date(date),
      time,
      price,
      location,
      result,
      players: {
        deleteMany: {}, // Remove all existing player associations
        create: newPlayers.map((np) => {
          const existingPlayer = currentMatch.players.find(
            (cp) => cp.playerId === np.playerId && cp.team === np.team
          );
          return {
            playerId: np.playerId,
            team: np.team,
            paid: existingPlayer ? existingPlayer.paid : false, // Preserve payment status if player was in the same team
          };
        }),
      },
    },
    include: {
      players: {
        include: {
          player: true,
        },
      },
    },
  });

  // Update Elo ratings if result has changed
  if (result) {
    const [scoreA, scoreB] = result.split("-").map(Number);
    const teamAPlayers = updatedMatch.players
      .filter((pm) => pm.team === "A")
      .map((pm) => pm.player);
    const teamBPlayers = updatedMatch.players
      .filter((pm) => pm.team === "B")
      .map((pm) => pm.player);

    const teamAElo =
      teamAPlayers.reduce((sum, p) => sum + p.elo, 0) / teamAPlayers.length;
    const teamBElo =
      teamBPlayers.reduce((sum, p) => sum + p.elo, 0) / teamBPlayers.length;

    const updateElo = async (
      players: any[],
      teamElo: number,
      opponentElo: number,
      score: number
    ) => {
      for (const player of players) {
        const expectedScore =
          1 / (1 + Math.pow(10, (opponentElo - player.elo) / 400));
        const newElo = player.elo + 32 * (score - expectedScore);
        await prisma.player.update({
          where: { id: player.id },
          data: { elo: newElo },
        });
      }
    };

    if (scoreA > scoreB) {
      await updateElo(teamAPlayers, teamAElo, teamBElo, 1);
      await updateElo(teamBPlayers, teamBElo, teamAElo, 0);
    } else if (scoreB > scoreA) {
      await updateElo(teamAPlayers, teamAElo, teamBElo, 0);
      await updateElo(teamBPlayers, teamBElo, teamAElo, 1);
    } else {
      await updateElo(teamAPlayers, teamAElo, teamBElo, 0.5);
      await updateElo(teamBPlayers, teamBElo, teamAElo, 0.5);
    }
  }

  return NextResponse.json(updatedMatch);
}
