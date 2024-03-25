import type { Match, Player, Team, User } from '@prisma/client';

export type * from '@prisma/client';

export interface PlayerWithUser extends Player {
  user: User;
}

export interface TeamWithPlayers extends Team {
  front: Player;
  back: Player;
}

export interface MatchWithTeamsAndPlayers extends Match {
  team1: TeamWithPlayers;
  team2: TeamWithPlayers;
}

export interface TeamWithPlayersAndUsers extends Team {
  front: PlayerWithUser;
  back: PlayerWithUser;
}

export interface MatchWithTeamsAndPlayersAndUsers extends Match {
  team1: TeamWithPlayersAndUsers;
  team2: TeamWithPlayersAndUsers;
}

export interface NewMatch {
  team1: { backId: string, frontId: string, score: number },
  team2: { backId: string, frontId: string, score: number }
}
