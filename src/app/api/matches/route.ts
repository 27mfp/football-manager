import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const body = await request.json();
  const { date, time, price, location } = body;

  const match = await prisma.match.create({
    data: {
      date: new Date(date),
      time,
      price,
      location,
    },
  });

  return NextResponse.json(match);
}
