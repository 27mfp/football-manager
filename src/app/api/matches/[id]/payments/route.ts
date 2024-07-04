import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const { playerMatches } = body;

  const updatedPlayerMatches = await Promise.all(
    playerMatches.map(async (pm: any) => {
      return prisma.playerMatch.update({
        where: { id: pm.id },
        data: { paid: pm.paid },
      });
    })
  );

  return NextResponse.json(updatedPlayerMatches);
}
