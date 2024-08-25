import React from "react";

interface Player {
  id: number;
  name: string;
  elo: number;
}

interface TeamSelectorProps {
  players: Player[];
  teamA: number[];
  teamB: number[];
  onTeamsChange: (teamA: number[], teamB: number[]) => void;
}

const TeamSelector: React.FC<TeamSelectorProps> = ({
  players,
  teamA,
  teamB,
  onTeamsChange,
}) => {
  const handlePlayerToggle = (playerId: number) => {
    if (teamA.includes(playerId)) {
      onTeamsChange(
        teamA.filter((id) => id !== playerId),
        [...teamB, playerId]
      );
    } else if (teamB.includes(playerId)) {
      onTeamsChange(
        [...teamA, playerId],
        teamB.filter((id) => id !== playerId)
      );
    } else {
      onTeamsChange([...teamA, playerId], teamB);
    }
  };

  const handleRemovePlayer = (playerId: number) => {
    onTeamsChange(
      teamA.filter((id) => id !== playerId),
      teamB.filter((id) => id !== playerId)
    );
  };

  const getPlayerTeam = (playerId: number) => {
    if (teamA.includes(playerId)) return "A";
    if (teamB.includes(playerId)) return "B";
    return null;
  };

  const PlayerListItem = ({
    player,
    team,
  }: {
    player: Player;
    team: "A" | "B";
  }) => (
    <li
      key={player.id}
      className={`flex items-center justify-between ${
        team === "A"
          ? "bg-blue-100 dark:bg-blue-800"
          : "bg-green-100 dark:bg-green-800"
      } p-2 rounded`}
    >
      <span
        className={
          team === "A"
            ? "text-blue-800 dark:text-blue-200"
            : "text-green-800 dark:text-green-200"
        }
      >
        {player.name}
      </span>
      <div className="space-x-2">
        <button
          onClick={() => handlePlayerToggle(player.id)}
          className={`text-sm ${
            team === "A"
              ? "text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
              : "text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
          }`}
        >
          Switch to {team === "A" ? "B" : "A"}
        </button>
        <button
          onClick={() => handleRemovePlayer(player.id)}
          className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
        >
          Remove
        </button>
      </div>
    </li>
  );

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
        Select Players
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-zinc-700 p-4 rounded-lg shadow">
          <h4 className="text-md font-medium mb-2 text-zinc-800 dark:text-zinc-200">
            Team A
          </h4>
          <ul className="space-y-2">
            {teamA.map((playerId) => {
              const player = players.find((p) => p.id === playerId);
              return player ? (
                <PlayerListItem key={player.id} player={player} team="A" />
              ) : null;
            })}
          </ul>
        </div>
        <div className="bg-white dark:bg-zinc-700 p-4 rounded-lg shadow">
          <h4 className="text-md font-medium mb-2 text-zinc-800 dark:text-zinc-200">
            Team B
          </h4>
          <ul className="space-y-2">
            {teamB.map((playerId) => {
              const player = players.find((p) => p.id === playerId);
              return player ? (
                <PlayerListItem key={player.id} player={player} team="B" />
              ) : null;
            })}
          </ul>
        </div>
      </div>
      <div className="mt-4">
        <h4 className="text-md font-medium mb-2 text-zinc-800 dark:text-zinc-200">
          Available Players
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {players.map((player) => {
            const team = getPlayerTeam(player.id);
            if (team) return null;
            return (
              <button
                key={player.id}
                onClick={() => handlePlayerToggle(player.id)}
                className="bg-zinc-100 dark:bg-zinc-600 hover:bg-zinc-200 dark:hover:bg-zinc-500 text-zinc-800 dark:text-zinc-200 font-medium py-2 px-4 rounded transition-colors duration-200"
              >
                {player.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TeamSelector;
