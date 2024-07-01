import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const body = await request.json();
  const { name, elo } = body;

  const player = await prisma.player.create({
    data: {
      name,
      elo,
    },
  });

  return NextResponse.json(player);
}

export async function GET() {
  const players = await prisma.player.findMany();
  return NextResponse.json(players);
}