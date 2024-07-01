import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const match = await prisma.match.findUnique({
    where: { id: Number(params.id) },
    include: { teamA: true, teamB: true },
  });

  if (!match) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 });
  }

  return NextResponse.json(match);
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const { date, time, price, location, result, teamA, teamB } = body;

  const updatedMatch = await prisma.match.update({
    where: { id: Number(params.id) },
    data: {
      date: new Date(date),
      time,
      price,
      location,
      result,
      teamA: {
        set: teamA.map((id: number) => ({ id })),
      },
      teamB: {
        set: teamB.map((id: number) => ({ id })),
      },
    },
    include: { teamA: true, teamB: true },
  });

  return NextResponse.json(updatedMatch);
}
