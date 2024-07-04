/*
  Warnings:

  - You are about to drop the `_TeamA` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_TeamB` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `paid` on the `Player` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "_TeamA_B_index";

-- DropIndex
DROP INDEX "_TeamA_AB_unique";

-- DropIndex
DROP INDEX "_TeamB_B_index";

-- DropIndex
DROP INDEX "_TeamB_AB_unique";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_TeamA";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_TeamB";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "PlayerMatch" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "playerId" INTEGER NOT NULL,
    "matchId" INTEGER NOT NULL,
    "team" TEXT NOT NULL,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "PlayerMatch_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PlayerMatch_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Player" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "elo" REAL NOT NULL DEFAULT 1500
);
INSERT INTO "new_Player" ("elo", "id", "name") SELECT "elo", "id", "name" FROM "Player";
DROP TABLE "Player";
ALTER TABLE "new_Player" RENAME TO "Player";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "PlayerMatch_playerId_matchId_key" ON "PlayerMatch"("playerId", "matchId");
