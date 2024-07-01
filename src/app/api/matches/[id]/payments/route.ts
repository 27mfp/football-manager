import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { players } = body;

    // Update the payment status for each player
    const updatePromises = players.map((player) =>
      prisma.player.update({
        where: { id: player.id },
        data: {
          paid: player.paid,
        },
      })
    );
    await Promise.all(updatePromises);

    // Fetch the updated players from the database
    const updatedPlayers = await prisma.player.findMany({
      where: {
        id: {
          in: players.map((player) => player.id),
        },
      },
    });

    return NextResponse.json({
      message: "Payments updated successfully",
      players: updatedPlayers,
    });
  } catch (error) {
    console.error("Error updating payments:", error); // Log any errors
    return NextResponse.json(
      { error: "Failed to update payments" },
      { status: 500 }
    );
  }
}
