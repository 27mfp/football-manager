import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const player = await prisma.player.findUnique({
    where: { id: Number(params.id) },
  });

  if (!player) {
    return NextResponse.json({ error: "Player not found" }, { status: 404 });
  }

  return NextResponse.json(player);
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const { name } = body;

  const updatedPlayer = await prisma.player.update({
    where: { id: Number(params.id) },
    data: { name },
  });

  return NextResponse.json(updatedPlayer);
}
