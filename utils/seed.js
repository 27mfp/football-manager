const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const data = require("./db.json"); // Make sure this path is correct

function parseDate(dateString) {
  const [day, month, year] = dateString.split("-");
  return new Date(year, month - 1, day);
}

async function main() {
  // Delete all existing data
  await prisma.playerMatch.deleteMany();
  await prisma.match.deleteMany();
  await prisma.player.deleteMany();

  // Create players
  const playerMap = new Map();
  for (const playerData of data.players) {
    const player = await prisma.player.create({
      data: {
        name: playerData.name,
        elo: playerData.rating,
      },
    });
    playerMap.set(playerData.name, player.id);
  }

  // Create matches and player matches
  for (const matchData of data.matches) {
    const matchDate = parseDate(matchData.date);
    const match = await prisma.match.create({
      data: {
        date: matchDate,
        time: "20:00", // Assuming a default time since it's not provided in the JSON
        price: 10, // Assuming a default price since it's not provided in the JSON
        location: matchData.venue,
        result: `${matchData.team1_goals}-${matchData.team2_goals}`,
      },
    });

    // Create player matches for team 1
    for (const player of matchData.team1) {
      await prisma.playerMatch.create({
        data: {
          playerId: playerMap.get(player.name),
          matchId: match.id,
          team: "A",
          paid: false, // Assuming default as false since it's not provided in the JSON
        },
      });
    }

    // Create player matches for team 2
    for (const player of matchData.team2) {
      await prisma.playerMatch.create({
        data: {
          playerId: playerMap.get(player.name),
          matchId: match.id,
          team: "B",
          paid: false, // Assuming default as false since it's not provided in the JSON
        },
      });
    }
  }

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
