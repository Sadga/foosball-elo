import { D1Database$ } from 'cfw-bindings-wrangler-bridge';
import { eq, and, desc, asc } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

import { BASE_ELO, calcEloDeltas } from '../libs/elo';
import type {
  User,
  League,
  LeagueInsert,
  NewMatch,
  MatchWithTeamsAndPlayersAndUsers,
  PlayerWithUser,
  TeamWithPlayersAndUsers
} from './types';

interface Env {
  DATABASE: D1Database;
}

interface Event {
  context?: {
    cloudflare?: {
      env?: Env;
    };
  };
}

export function getDB (event: Event = {}) {
  let DB;
  if (event?.context?.cloudflare?.env?.DATABASE) {
    DB = drizzle(event?.context?.cloudflare?.env?.DATABASE, { schema });
  } else {
    DB = drizzle(new D1Database$('foosball') as D1Database, { schema });
  }

  if (!DB) { throw new Error('cannotGetDb'); }

  return DB;
}

export async function getUserByName (event: Event, name: string) {
  const DB = getDB(event);

  return await DB.query.Users.findFirst({ where: eq(schema.Users.name, name) });
}

export async function getUser (event: Event, userId: string, sessionUserId: string) {
  if (userId !== sessionUserId) { throw new Error('invalidUserId'); }
  const DB = getDB(event);

  return await DB.query.Users.findFirst({ where: eq(schema.Users.id, userId) });
}

export async function saveUser (event: Event, user: User, sessionUserId: string) {
  if (user.id !== sessionUserId) { throw new Error('invalidUserId'); }
  const DB = getDB(event);

  await DB.update(schema.Users).set(user).where(eq(schema.Users.id, user.id));
  return DB.query.Users.findFirst({ where: eq(schema.Users.id, user.id) });
}

export async function getLeague (event: Event, leagueId: string, sessionUserId: string) {
  const DB = getDB(event);
  const league = await DB.query.Leagues.findFirst({ where: eq(schema.Leagues.id, leagueId) });

  return league;
}

export async function createLeague (event: Event, league: LeagueInsert, sessionUserId: string) {
  if (!league.name) { throw new Error('invalidLeague'); }
  const DB = getDB(event);

  const newLeague = await DB.insert(schema.Leagues).values(league).returning().then((res) => res[0]);

  await DB.insert(schema.Players).values({ userId: sessionUserId, leagueId: newLeague.id, admin: true });

  return await DB.query.Leagues.findFirst({ where: eq(schema.Leagues.id, newLeague.id) });
}

export async function saveLeague (event: Event, league: League, sessionUserId: string) {
  if (!league.id) { throw new Error('invalidLeague'); }
  const DB = getDB(event);

  const player = await DB.query.Players.findFirst({ where: and(eq(schema.Players.userId, sessionUserId), eq(schema.Players.leagueId, league.id)) });
  if (!player?.admin) { throw new Error('cannotSaveLeague'); }

  await DB.update(schema.Leagues).set(league).where(eq(schema.Leagues.id, league.id));
  return await DB.query.Leagues.findFirst({ where: eq(schema.Leagues.id, league.id) });
}

export async function deleteLeague (event: Event, leagueId: string, sessionUserId: string) {
  const DB = getDB(event);

  const player = await DB.query.Players.findFirst({ where: and(eq(schema.Players.userId, sessionUserId), eq(schema.Players.leagueId, leagueId)) });
  if (!player?.admin) { throw new Error('cannotDeleteLeague'); }

  return await DB.delete(schema.Leagues).where(eq(schema.Leagues.id, leagueId)).returning();
}

export async function joinLeague (event: Event, leagueId: string, sessionUserId: string) {
  const DB = getDB(event);

  const league = await DB.query.Leagues.findFirst({ where: eq(schema.Leagues.id, leagueId) });
  if (!league) { throw new Error('leagueNotFound'); }

  const player = await DB.query.Players.findFirst({ where: and(eq(schema.Players.userId, sessionUserId), eq(schema.Players.leagueId, leagueId)) });
  if (player && player.banned) {
    throw new Error('playerAlreadyInLeague');
  } else if (player) {
    return player;
  }

  return await DB.insert(schema.Players).values({ userId: sessionUserId, leagueId: league.id, eloBack: BASE_ELO, eloFront: BASE_ELO, eloTotal: BASE_ELO, matchesPlayed: 0 }).returning();
}

export async function banPlayer (event: Event, playerId: string, sessionUserId: string) {
  const DB = getDB(event);

  const banPlayer = await DB.query.Players.findFirst({ where: eq(schema.Players.id, playerId) });
  if (!banPlayer) { throw new Error('playerNotFound'); }

  const player = await DB.query.Players.findFirst({ where: and(eq(schema.Players.userId, sessionUserId), eq(schema.Players.leagueId, banPlayer.leagueId)) });
  if (!player?.admin) { throw new Error('cannotBanPlayer'); }

  await DB.update(schema.Players).set({ banned: true, admin: false }).where(eq(schema.Players.id, banPlayer.id));
  return await DB.query.Players.findFirst({ where: eq(schema.Players.id, banPlayer.id) });
}

export async function unbanPlayer (event: Event, playerId: string, sessionUserId: string) {
  const DB = getDB(event);

  const unbanPlayer = await DB.query.Players.findFirst({ where: eq(schema.Players.id, playerId) });
  if (!unbanPlayer) { throw new Error('playerNotFound'); }

  const player = await DB.query.Players.findFirst({ where: and(eq(schema.Players.userId, sessionUserId), eq(schema.Players.leagueId, unbanPlayer.leagueId)) });
  if (!player?.admin) { throw new Error('cannotUnbanPlayer'); }

  await DB.update(schema.Players).set({ banned: false }).where(eq(schema.Players.id, unbanPlayer.id));
  return await DB.query.Players.findFirst({ where: eq(schema.Players.id, unbanPlayer.id) })
}

export async function addAdminPlayer (event: Event, playerId: string, sessionUserId: string) {
  const DB = getDB(event);

  const adminPlayer = await DB.query.Players.findFirst({ where: eq(schema.Players.id, playerId) });
  if (!adminPlayer) { throw new Error('playerNotFound'); }
  if (adminPlayer.banned) { throw new Error('cannotAddABannedPlayerToAdmins'); }

  const player = await DB.query.Players.findFirst({ where: and(eq(schema.Players.userId, sessionUserId), eq(schema.Players.leagueId, adminPlayer.leagueId)) });
  if (!player?.admin) { throw new Error('cannotAddAdminPlayer'); }

  await DB.update(schema.Players).set({ admin: true }).where(eq(schema.Players.id, adminPlayer.id));
  return await DB.query.Players.findFirst({ where: eq(schema.Players.id, adminPlayer.id) });
}

export async function remAdminPlayer (event: Event, playerId: string, sessionUserId: string) {
  const DB = getDB(event);

  const adminPlayer = await DB.query.Players.findFirst({ where: eq(schema.Players.id, playerId) });
  if (!adminPlayer) { throw new Error('playerNotFound'); }

  const player = await DB.query.Players.findFirst({ where: and(eq(schema.Players.userId, sessionUserId), eq(schema.Players.leagueId, adminPlayer.leagueId)) });
  if (!player?.admin) { throw new Error('cannotRemAdminPlayer'); }

  await DB.update(schema.Players).set({ admin: false }).where(eq(schema.Players.id, adminPlayer.id));
  return await DB.query.Players.findFirst({ where: eq(schema.Players.id, adminPlayer.id) });
}

export async function getUserLeagues (event: Event, userId: string) {
  const DB = getDB(event);

  const players = await DB.query.Players.findMany({ where: eq(schema.Players.userId, userId), with: { league: true } });

  return players.map((player) => player.league);
}

export async function createMatch (event: Event, leagueId: string, match: NewMatch, sessionUserId: string): Promise<MatchWithTeamsAndPlayersAndUsers> {
  const DB = getDB(event);

  const league = await DB.query.Leagues.findFirst({ where: eq(schema.Leagues.id, leagueId) });
  if (!league) { throw new Error('leagueNotFound'); }

  let team1 = await DB.query.Teams.findFirst({ where: and(eq(schema.Teams.leagueId, leagueId), eq(schema.Teams.frontId, match.team1.frontId), eq(schema.Teams.backId, match.team1.backId)) });
  if (!team1) {
    team1 = await DB.insert(schema.Teams).values({ leagueId, frontId: match.team1.frontId, backId: match.team1.backId, eloTotal: BASE_ELO, matchesPlayed: 0 }).returning().then((res) => res[0]);
  }
  if (!team1) { throw new Error('team1NotFound'); }

  let team2 = await DB.query.Teams.findFirst({ where: and(eq(schema.Teams.leagueId, leagueId), eq(schema.Teams.frontId, match.team2.frontId), eq(schema.Teams.backId, match.team2.backId)) });
  if (!team2) {
    team2 = await DB.insert(schema.Teams).values({ leagueId, frontId: match.team2.frontId, backId: match.team2.backId, eloTotal: BASE_ELO, matchesPlayed: 0 }).returning().then((res) => res[0]);
  }
  if (!team2) { throw new Error('team2NotFound'); }

  const newMatchId = await DB.insert(schema.Matches).values({
    leagueId,
    team1Id: team1.id,
    score1: match.team1.score,
    team2Id: team2.id,
    score2: match.team2.score,
    createdById: sessionUserId,
    team1FrontEloDelta: 0,
    team1BackEloDelta: 0,
    team2FrontEloDelta: 0,
    team2BackEloDelta: 0,
    team1EloDelta: 0,
    team2EloDelta: 0
  }).returning().then((res) => res[0].id);

  const matchEntity = await DB.query.Matches.findFirst({
    where: eq(schema.Matches.id, newMatchId),
    with: {
      team1: { with: { front: { with: { user: true } }, back: { with: { user: true } } } },
      team2: { with: { front: { with: { user: true } }, back: { with: { user: true } } } }
    }
  }) as MatchWithTeamsAndPlayersAndUsers;

  if (!matchEntity) { throw new Error('matchNotFound'); }

  const eloDeltas = calcEloDeltas(matchEntity, { maxPoints: league.maxPoints });

  await Promise.all([
    DB.update(schema.Matches).set({
      team1FrontEloDelta: eloDeltas.players[matchEntity.team1.frontId],
      team1BackEloDelta: eloDeltas.players[matchEntity.team1.backId],
      team2FrontEloDelta: eloDeltas.players[matchEntity.team2.frontId],
      team2BackEloDelta: eloDeltas.players[matchEntity.team2.backId],
      team1EloDelta: eloDeltas.teams[team1.id],
      team2EloDelta: eloDeltas.teams[team2.id]
    }).where(eq(schema.Matches.id, matchEntity.id)),
    DB.update(schema.Players).set({
      matchesPlayed: matchEntity.team1.front.matchesPlayed + 1,
      eloFront: matchEntity.team1.front.eloFront + eloDeltas.players[matchEntity.team1.frontId],
      eloTotal: matchEntity.team1.front.eloTotal + eloDeltas.players[matchEntity.team1.frontId]
    }).where(eq(schema.Players.id, matchEntity.team1.frontId)),
    DB.update(schema.Players).set({
      matchesPlayed: matchEntity.team1.back.matchesPlayed + 1,
      eloBack: matchEntity.team1.back.eloBack + eloDeltas.players[matchEntity.team1.backId],
      eloTotal: matchEntity.team1.back.eloTotal + eloDeltas.players[matchEntity.team1.backId]
    }).where(eq(schema.Players.id, matchEntity.team1.backId)),
    DB.update(schema.Players).set({
      matchesPlayed: matchEntity.team2.front.matchesPlayed + 1,
      eloFront: matchEntity.team2.front.eloFront + eloDeltas.players[matchEntity.team2.frontId],
      eloTotal: matchEntity.team2.front.eloTotal + eloDeltas.players[matchEntity.team2.frontId]
    }).where(eq(schema.Players.id, matchEntity.team2.frontId)),
    DB.update(schema.Players).set({
      matchesPlayed: matchEntity.team2.back.matchesPlayed + 1,
      eloBack: matchEntity.team2.back.eloBack + eloDeltas.players[matchEntity.team2.backId],
      eloTotal: matchEntity.team2.back.eloTotal + eloDeltas.players[matchEntity.team2.backId]
    }).where(eq(schema.Players.id, matchEntity.team2.backId)),
    DB.update(schema.Teams).set({
      matchesPlayed: team1.matchesPlayed + 1,
      eloTotal: team1.eloTotal + eloDeltas.teams[team1.id]
    }).where(eq(schema.Teams.id, team1.id)),
    DB.update(schema.Teams).set({
      matchesPlayed: team2.matchesPlayed + 1,
      eloTotal: team2.eloTotal + eloDeltas.teams[team2.id]
    }).where(eq(schema.Teams.id, team2.id))
  ]);

  return await DB.query.Matches.findFirst({
    where: eq(schema.Matches.id, newMatchId),
    with: {
      team1: { with: { front: { with: { user: true } }, back: { with: { user: true } } } },
      team2: { with: { front: { with: { user: true } }, back: { with: { user: true } } } }
    }
  }) as MatchWithTeamsAndPlayersAndUsers;
}

export async function deleteMatch (event: Event, matchId: string, sessionUserId: string) {
  const DB = getDB(event);

  const match = await DB.query.Matches.findFirst({
    where: eq(schema.Matches.id, matchId),
    with: {
      team1: { with: { front: { with: { user: true } }, back: { with: { user: true } } } },
      team2: { with: { front: { with: { user: true } }, back: { with: { user: true } } } }
    }
  }) as MatchWithTeamsAndPlayersAndUsers;

  const lastLeagueMatch = await DB.query.Matches.findFirst({ where: eq(schema.Matches.leagueId, match.leagueId), orderBy: [desc(schema.Matches.date)] });
  // For now it's only possible to delete the last match played in the league
  if (!match || match?.id !== lastLeagueMatch?.id) { throw new Error('cannotDeleteMatch'); }

  const player = await DB.query.Players.findFirst({ where: and(eq(schema.Players.userId, sessionUserId), eq(schema.Players.leagueId, match.leagueId)) });
  if (!player?.admin) { throw new Error('cannotDeleteMatch'); }

  await Promise.all([
    DB.delete(schema.Matches).where(eq(schema.Matches.id, match.id)),
    DB.update(schema.Players).set({
      matchesPlayed: match.team1.front.matchesPlayed - 1,
      eloFront: match.team1.front.eloFront - (match?.team1FrontEloDelta || 0),
      eloTotal: match.team1.front.eloTotal - (match?.team1FrontEloDelta || 0)
    }).where(eq(schema.Players.id, match.team1.frontId)),
    DB.update(schema.Players).set({
      matchesPlayed: match.team1.back.matchesPlayed - 1,
      eloBack: match.team1.back.eloBack - (match?.team1BackEloDelta || 0),
      eloTotal: match.team1.back.eloTotal - (match?.team1BackEloDelta || 0)
    }).where(eq(schema.Players.id, match.team1.backId)),
    DB.update(schema.Players).set({
      matchesPlayed: match.team2.front.matchesPlayed - 1,
      eloFront: match.team2.front.eloFront - (match?.team2FrontEloDelta || 0),
      eloTotal: match.team2.front.eloTotal - (match?.team2FrontEloDelta || 0)
    }).where(eq(schema.Players.id, match.team2.frontId)),
    DB.update(schema.Players).set({
      matchesPlayed: match.team2.back.matchesPlayed - 1,
      eloBack: match.team2.back.eloBack - (match?.team2BackEloDelta || 0),
      eloTotal: match.team2.back.eloTotal - (match?.team2BackEloDelta || 0)
    }).where(eq(schema.Players.id, match.team2.backId)),
    DB.update(schema.Teams).set({
      matchesPlayed: match.team1.matchesPlayed - 1,
      eloTotal: match.team1.eloTotal - (match?.team1EloDelta || 0)
    }).where(eq(schema.Teams.id, match.team1Id)),
    DB.update(schema.Teams).set({
      matchesPlayed: match.team2.matchesPlayed - 1,
      eloTotal: match.team2.eloTotal - (match?.team2EloDelta || 0)
    }).where(eq(schema.Teams.id, match.team2Id))
  ]);
}

export async function getLeagueMatches (event: Event, leagueId: string): Promise<MatchWithTeamsAndPlayersAndUsers[]> {
  const DB = getDB(event);

  return await DB.query.Matches.findMany({
    where: eq(schema.Matches.leagueId, leagueId),
    orderBy: [asc(schema.Matches.date)],
    with: {
      team1: { with: { front: { with: { user: true } }, back: { with: { user: true } } } },
      team2: { with: { front: { with: { user: true } }, back: { with: { user: true } } } }
    }
  });
}

export async function getLeaguePlayers (event: Event, leagueId: string): Promise<PlayerWithUser[]> {
  const DB = getDB(event);

  return await DB.query.Players.findMany({
    where: eq(schema.Players.leagueId, leagueId),
    with: {
      user: {
        orderBy: [desc(schema.Users.name)]
      }
    }
  });
}

export async function getLeagueTeams (event: Event, leagueId: string): Promise<TeamWithPlayersAndUsers[]> {
  const DB = getDB(event);

  return await DB.query.Teams.findMany({
    where: eq(schema.Teams.leagueId, leagueId),
    orderBy: [desc(schema.Teams.eloTotal)],
    with: {
      front: { with: { user: true } },
      back: { with: { user: true } }
    }
  });
}
