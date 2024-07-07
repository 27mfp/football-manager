import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { gameOver } from "@/utils/eloCalculation";

// Elo calculation function
function calculateEloChange(
  playerElo: number,
  opponentElo: number,
  score: number
): number {
  const expectedScore = 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));
  return Math.round(32 * (score - expectedScore));
}

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
  const { date, time, price, location, result, teamA, teamB, paymentStatus } =
    body;

  try {
    // Fetch the current match to check if the result has changed
    const currentMatch = await prisma.match.findUnique({
      where: { id: Number(params.id) },
      include: {
        players: {
          include: {
            player: true,
          },
        },
      },
    });

    const updatedMatch = await prisma.match.update({
      where: { id: Number(params.id) },
      data: {
        date: new Date(date),
        time,
        price,
        location,
        result,
        players: {
          deleteMany: {},
          create: [
            ...teamA.map((playerId: number) => ({
              playerId,
              team: "A",
              paid: paymentStatus[playerId] || false,
            })),
            ...teamB.map((playerId: number) => ({
              playerId,
              team: "B",
              paid: paymentStatus[playerId] || false,
            })),
          ],
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

    // If the result has changed and is not null, update Elo ratings
    if (result && result !== currentMatch?.result) {
      const [scoreA, scoreB] = result.split("-").map(Number);
      const teamAPlayers = updatedMatch.players
        .filter((pm) => pm.team === "A")
        .map((pm) => ({
          id: pm.player.id,
          name: pm.player.name,
          elo: pm.player.elo,
          matches: pm.player.matches,
          wins: pm.player.wins,
        }));
      const teamBPlayers = updatedMatch.players
        .filter((pm) => pm.team === "B")
        .map((pm) => ({
          id: pm.player.id,
          name: pm.player.name,
          elo: pm.player.elo,
          matches: pm.player.matches,
          wins: pm.player.wins,
        }));

      const [updatedTeamA, updatedTeamB] = gameOver(
        teamAPlayers,
        teamBPlayers,
        scoreA,
        scoreB
      );

      // Update players in the database
      for (const player of [...updatedTeamA, ...updatedTeamB]) {
        await prisma.player.update({
          where: { id: player.id },
          data: {
            elo: player.elo,
            matches: player.matches,
            wins: player.wins,
          },
        });
      }
    }

    return NextResponse.json(updatedMatch);
  } catch (error) {
    console.error("Error updating match:", error);
    return NextResponse.json(
      { error: "Failed to update match" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // First, delete all related PlayerMatch records
    await prisma.playerMatch.deleteMany({
      where: { matchId: Number(params.id) },
    });

    // Then, delete the match
    await prisma.match.delete({
      where: { id: Number(params.id) },
    });

    return NextResponse.json({ message: "Match deleted successfully" });
  } catch (error) {
    console.error("Error deleting match:", error);
    return NextResponse.json(
      { error: "Failed to delete match" },
      { status: 500 }
    );
  }
}
