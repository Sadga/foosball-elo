import {
  Users,
  Leagues,
  Players,
  Teams,
  Matches
} from './schema';

export type User = typeof Users.$inferSelect
export type UserInsert = typeof Users.$inferInsert
export type League = typeof Leagues.$inferSelect
export type LeagueInsert = typeof Leagues.$inferInsert
export type Player = typeof Players.$inferSelect
export type PlayerInsert = typeof Players.$inferInsert
export type Team = typeof Teams.$inferSelect
export type TeamInsert = typeof Teams.$inferInsert
export type Match = typeof Matches.$inferSelect
export type MatchInsert = typeof Matches.$inferInsert

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

export interface LeagueWithAdmins extends League {
  admins: User[];
}
