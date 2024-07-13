import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const players = await prisma.player.findMany({
      include: {
        playerMatches: true,
      },
    });

    const playersWithStats = players.map((player) => ({
      id: player.id,
      name: player.name,
      elo: player.elo,
      matches: player.playerMatches.length,
      wins: player.wins,
    }));

    return NextResponse.json(playersWithStats);
  } catch (error) {
    console.error("Error fetching players:", error);
    return NextResponse.json(
      { error: "Failed to fetch players" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
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
