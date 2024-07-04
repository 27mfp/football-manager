import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const players = await prisma.player.findMany({
    orderBy: {
      elo: "desc",
    },
  });
  return NextResponse.json(players);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { name, elo = 1500 } = body;

  const player = await prisma.player.create({
    data: {
      name,
      elo,
    },
  });

  return NextResponse.json(player);
}
