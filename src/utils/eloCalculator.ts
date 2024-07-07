const K_FACTOR = 50;

export function calculateEloChange(
  playerElo: number,
  opponentElo: number,
  score: number
): number {
  const expectedScore = 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));
  return K_FACTOR * (score - expectedScore);
}

export function calculateTeamElo(teamPlayers: { elo: number }[]): number {
  const totalElo = teamPlayers.reduce((sum, player) => sum + player.elo, 0);
  return totalElo / teamPlayers.length;
}
