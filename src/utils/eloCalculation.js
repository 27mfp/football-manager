// utils/eloCalculation.js

const K_VALUE = 32;

function expectResult(team1, team2) {
  const team1Values = team1.map((player) => ({
    name: player.name,
    win_exp: 1 / (1 + Math.pow(10, (averageElo(team2) - player.elo) / 400)),
  }));

  const team2Values = team2.map((player) => ({
    name: player.name,
    win_exp: 1 / (1 + Math.pow(10, (averageElo(team1) - player.elo) / 400)),
  }));

  return [team1Values, team2Values];
}

function averageElo(team) {
  return team.reduce((sum, player) => sum + player.elo, 0) / team.length;
}

function gameOver(team1, team2, team1Goals, team2Goals) {
  const goalDifference = parseInt(team1Goals) - parseInt(team2Goals);
  const [team1Values, team2Values] = expectResult(team1, team2);
  const allValues = [...team1Values, ...team2Values];

  const winner = goalDifference > 0 ? team1 : goalDifference < 0 ? team2 : null;

  const updatePlayerRating = (player, isWinner) => {
    const playerExpectation = allValues.find(
      (item) => item.name === player.name
    ).win_exp;
    const actualResult = isWinner ? 1 : 0;
    player.elo = Math.round(
      player.elo + K_VALUE * (actualResult - playerExpectation)
    );
    player.matches++;
    if (isWinner) player.wins++;
    return player;
  };

  const updatedTeam1 = team1.map((player) =>
    updatePlayerRating(player, winner === team1)
  );
  const updatedTeam2 = team2.map((player) =>
    updatePlayerRating(player, winner === team2)
  );

  return [updatedTeam1, updatedTeam2];
}

module.exports = { gameOver };
