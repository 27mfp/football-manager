import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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

  // Calculate the amount to pay
  const amountToPay = player.playerMatches.reduce((total, pm) => {
    if (!pm.paid) {
      const match = pm.match;
      const playersInMatch = match.players.length;
      const pricePerPlayer = match.price / playersInMatch;
      return total + pricePerPlayer;
    }
    return total;
  }, 0);

  // Prepare the response object
  const playerResponse = {
    ...player,
    amountToPay: Number(amountToPay.toFixed(2)),
    matches: player.playerMatches.map((pm) => ({
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

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
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

    console.log("Player updated:", updatedPlayer);
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
  await prisma.player.delete({
    where: { id: Number(params.id) },
  });

  return NextResponse.json({ message: "Player deleted successfully" });
}
