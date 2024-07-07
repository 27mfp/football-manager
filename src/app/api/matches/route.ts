import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { gameOver } from "@/utils/eloCalculation";

export async function GET() {
  const matches = await prisma.match.findMany({
    include: {
      players: {
        include: {
          player: true,
        },
      },
    },
  });
  return NextResponse.json(matches);
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
