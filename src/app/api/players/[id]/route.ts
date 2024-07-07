import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const player = await prisma.player.findUnique({
    where: { id: Number(params.id) },
    include: {
      matches: {
        include: {
          match: true,
        },
      },
    },
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
  const { name, elo } = body;

  const updatedPlayer = await prisma.player.update({
    where: { id: Number(params.id) },
    data: {
      name,
      elo,
    },
  });

  return NextResponse.json(updatedPlayer);
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
