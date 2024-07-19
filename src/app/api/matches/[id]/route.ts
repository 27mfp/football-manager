import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import eloSystem from "@/lib/eloSystem";

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
  const {
    date,
    time,
    price,
    location,
    result,
    teamA,
    teamB,
    paymentStatus,
    scoreA,
    scoreB,
  } = body;

  try {
    const currentMatch = await prisma.match.findUnique({
      where: { id: Number(params.id) },
      include: { players: { include: { player: true } } },
    });

    if (result && result !== currentMatch?.result) {
      const allPlayers = await prisma.player.findMany({
        where: { id: { in: [...teamA, ...teamB] } },
      });

      const teamAPlayers = allPlayers.filter((p) => teamA.includes(p.id));
      const teamBPlayers = allPlayers.filter((p) => teamB.includes(p.id));

      const [updatedTeamA, updatedTeamB] = eloSystem.updateMatchRatings(
        teamAPlayers,
        teamBPlayers,
        scoreA,
        scoreB
      );

      const updatedPlayers: any[] = [];

      for (const player of [...updatedTeamA, ...updatedTeamB]) {
        const originalPlayer = allPlayers.find((p) => p.id === player.id);
        if (!originalPlayer) {
          console.error(`Player with id ${player.id} not found`);
          continue;
        }

        await prisma.player.update({
          where: { id: player.id },
          data: {
            elo: Math.round(player.elo),
            matches: { increment: 1 },
            wins:
              player.wins > originalPlayer.wins ? { increment: 1 } : undefined,
          },
        });

        updatedPlayers.push({
          playerId: player.id,
          team: teamA.includes(player.id) ? "A" : "B",
          paid: paymentStatus[player.id] || false,
          eloBefore: originalPlayer.elo,
          eloAfter: Math.round(player.elo),
        });
      }

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
            create: updatedPlayers,
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

      return NextResponse.json(updatedMatch);
    } else {
      // If result hasn't changed, just update other fields
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

      return NextResponse.json(updatedMatch);
    }
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
    const matchId = Number(params.id);

    // First, fetch the match to get player information
    const match = await prisma.match.findUnique({
      where: { id: matchId },
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

    // Parse the result safely
    const [scoreA, scoreB] = match.result?.split("-").map(Number) ?? [0, 0];
    const winningTeam = scoreA > scoreB ? "A" : scoreB > scoreA ? "B" : null;

    // Revert ELO changes for each player
    for (const playerMatch of match.players) {
      await prisma.player.update({
        where: { id: playerMatch.player.id },
        data: {
          elo: playerMatch.eloBefore ?? undefined,
          matches: { decrement: 1 },
          wins:
            winningTeam && playerMatch.team === winningTeam
              ? { decrement: 1 }
              : undefined,
        },
      });
    }

    // Delete all PlayerMatch records associated with this match
    await prisma.playerMatch.deleteMany({
      where: { matchId: matchId },
    });

    // Now delete the match
    await prisma.match.delete({
      where: { id: matchId },
    });

    return NextResponse.json({
      message: "Match and associated records deleted, ELO changes reverted",
    });
  } catch (error) {
    console.error("Error deleting match:", error);
    return NextResponse.json(
      { error: "Failed to delete match" },
      { status: 500 }
    );
  }
}
