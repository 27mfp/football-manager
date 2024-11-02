import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface PlayerMatch {
  id: number;
  matchId: number;
  playerId: number;
  paid: boolean;
}

interface Player {
  id: number;
  name: string;
  elo: number;
  matches: number;
  wins: number;
  playerMatches: PlayerMatch[];
}

interface PlayerStats {
  id: number;
  name: string;
  elo: number;
  matches: number;
  wins: number;
}

export async function GET() {
  try {
    const players = await prisma.player.findMany({
      include: {
        playerMatches: true,
      },
    });

    const playersWithStats = players.map(
      (player: Player): PlayerStats => ({
        id: player.id,
        name: player.name,
        elo: player.elo,
        matches: player.playerMatches.length,
        wins: player.wins,
      })
    );

    return NextResponse.json(playersWithStats);
  } catch (error) {
    console.error("Error fetching players:", error);
    return NextResponse.json(
      { error: "Failed to fetch players" },
      { status: 500 }
    );
  }
}

interface CreatePlayerBody {
  name: string;
  elo: number;
  matches: number;
  wins: number;
}

export async function POST(request: Request) {
  try {
    const body: CreatePlayerBody = await request.json();
    const { name, elo, matches, wins } = body;

    const newPlayer = await prisma.player.create({
      data: {
        name,
        elo,
        matches,
        wins,
      },
    });

    return NextResponse.json(newPlayer);
  } catch (error) {
    console.error("Error creating player:", error);
    return NextResponse.json(
      { error: "Failed to create player" },
      { status: 500 }
    );
  }
}
