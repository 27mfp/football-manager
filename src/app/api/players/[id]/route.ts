import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface PlayerMatch {
  id: number;
  matchId: number;
  playerId: number;
  paid: boolean;
  match: {
    id: number;
    date: Date;
    time: string;
    location: string;
    result: string | null;
    price: number;
    players: {
      id: number;
      matchId: number;
      playerId: number;
    }[];
  };
}

interface Player {
  id: number;
  name: string;
  elo: number;
  matches: number;
  wins: number;
  playerMatches: PlayerMatch[];
}

interface PlayerResponse {
  id: number;
  name: string;
  elo: number;
  totalMatches: number;
  wins: number;
  amountToPay: number;
  matchHistory: {
    id: number;
    date: Date;
    time: string;
    location: string;
    result: string | null;
    paid: boolean;
    playerCount: number;
  }[];
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const player = await prisma.player.findUnique({
    where: { id: Number(params.id) },
    include: {
      playerMatches: {
        include: {
          match: {
            include: {
              players: true,
            },
          },
        },
      },
    },
  });

  if (!player) {
    return NextResponse.json({ error: "Player not found" }, { status: 404 });
  }

  const amountToPay = player.playerMatches.reduce(
    (total: number, pm: PlayerMatch) => {
      if (!pm.paid) {
        const match = pm.match;
        const playersInMatch = match.players.length;
        const pricePerPlayer = match.price / playersInMatch;
        return total + pricePerPlayer;
      }
      return total;
    },
    0
  );

  const playerResponse: PlayerResponse = {
    id: player.id,
    name: player.name,
    elo: player.elo,
    totalMatches: player.matches,
    wins: player.wins,
    amountToPay: Number(amountToPay.toFixed(2)),
    matchHistory: player.playerMatches.map((pm: PlayerMatch) => ({
      id: pm.match.id,
      date: pm.match.date,
      time: pm.match.time,
      location: pm.match.location,
      result: pm.match.result,
      paid: pm.paid,
      playerCount: pm.match.players.length,
    })),
  };

  return NextResponse.json(playerResponse);
}

interface UpdatePlayerBody {
  name: string;
  elo: number;
  matches: number;
  wins: number;
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body: UpdatePlayerBody = await request.json();
    const { name, elo, matches, wins } = body;
    const updatedPlayer = await prisma.player.update({
      where: { id: Number(params.id) },
      data: {
        name,
        elo,
        matches,
        wins,
      },
    });
    return NextResponse.json(updatedPlayer);
  } catch (error) {
    console.error("Error updating player:", error);
    return NextResponse.json(
      { error: "Failed to update player" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.player.delete({
      where: { id: Number(params.id) },
    });
    return NextResponse.json({ message: "Player deleted successfully" });
  } catch (error) {
    console.error("Error deleting player:", error);
    return NextResponse.json(
      { error: "Failed to delete player" },
      { status: 500 }
    );
  }
}
