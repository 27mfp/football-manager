import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const players = await prisma.player.findMany({
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

    const playersWithDetails = players.map((player) => {
      const matchesPlayed = player.playerMatches.length;
      const amountToPay = player.playerMatches.reduce((total, pm) => {
        if (!pm.paid) {
          const match = pm.match;
          const playersInMatch = match.players.length;
          const pricePerPlayer = match.price / playersInMatch;
          return total + pricePerPlayer;
        }
        return total;
      }, 0);

      return {
        id: player.id,
        name: player.name,
        elo: player.elo,
        matches: player.matches || 0,
        wins: player.wins || 0,
        matchesPlayed,
        amountToPay: Number(amountToPay.toFixed(2)),
      };
    });

    return NextResponse.json(playersWithDetails);
  } catch (error) {
    console.error("Error fetching players:", error);
    return NextResponse.json(
      { error: "Failed to fetch players" },
      { status: 500 }
    );
  }
}
