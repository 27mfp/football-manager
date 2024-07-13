import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const matches = await prisma.match.findMany({
      include: {
        players: {
          include: {
            player: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    const matchesWithPaymentInfo = matches.map((match) => {
      const totalPlayers = match.players.length;
      const pricePerPlayer = totalPlayers > 0 ? match.price / totalPlayers : 0;
      const totalPaid = match.players.reduce(
        (total, pm) => total + (pm.paid ? pricePerPlayer : 0),
        0
      );
      const totalToPay = match.price - totalPaid;

      return {
        ...match,
        pricePerPlayer,
        totalPaid,
        totalToPay,
      };
    });

    return NextResponse.json(matchesWithPaymentInfo);
  } catch (error) {
    console.error("Error fetching matches:", error);
    return NextResponse.json(
      { error: "Failed to fetch matches" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const { date, time, price, location, teamA, teamB } = body;

  const match = await prisma.match.create({
    data: {
      date: new Date(date),
      time,
      price,
      location,
      players: {
        create: [
          ...teamA.map((playerId: number) => ({ playerId, team: "A" })),
          ...teamB.map((playerId: number) => ({ playerId, team: "B" })),
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

  return NextResponse.json(match);
}
