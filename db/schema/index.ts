import { text, integer, sqliteTable, primaryKey, index } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { randomUUID } from 'crypto';

export const Users = sqliteTable(
  'user',
  {
    id: text('id').primaryKey().$defaultFn(() => randomUUID()),
    name: text('name'),
    email: text('email').notNull().unique(),
    emailVerified: integer('emailVerified', { mode: 'timestamp_ms' }),
    image: text('image')
  }
);

export const Accounts = sqliteTable(
  'account',
  {
    userId: text('userId')
      .notNull()
      .references(() => Users.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('providerAccountId').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state')
  },
  (account) => ({
    compoundKey: primaryKey({ columns: [account.provider, account.providerAccountId] }),
    userIdIdx: index('Account_userId_index').on(account.userId)
  })
);

export const Sessions = sqliteTable(
  'session',
  {
    id: text('id').primaryKey().$defaultFn(() => randomUUID()),
    sessionToken: text('sessionToken').notNull().unique(),
    userId: text('userId')
      .notNull()
      .references(() => Users.id, { onDelete: 'cascade' }),
    expires: integer('expires', { mode: 'timestamp_ms' }).notNull()
  },
  (session) => ({
    userIdIdx: index('Session_userId_index').on(session.userId)
  })
);

export const VerificationTokens = sqliteTable(
  'verificationToken',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull().unique(),
    expires: integer('expires', { mode: 'timestamp_ms' }).notNull()
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] })
  })
);

export const Leagues = sqliteTable(
  'league',
  {
    id: text('id').primaryKey().$defaultFn(() => randomUUID()),
    name: text('name').notNull(),
    maxPoints: integer('maxPoints').notNull().default(10),
    team1Color: text('team1Color').notNull().default('#3b82f6'),
    team2Color: text('team2Color').notNull().default('#dc2626')
  }
);

export const Players = sqliteTable(
  'player',
  {
    id: text('id').primaryKey().$defaultFn(() => randomUUID()),
    userId: text('userId')
      .notNull()
      .references(() => Users.id, { onDelete: 'cascade' }),
    leagueId: text('leagueId')
      .notNull()
      .references(() => Leagues.id, { onDelete: 'cascade' }),
    admin: integer('admin', { mode: 'boolean' }).notNull().default(false),
    banned: integer('banned', { mode: 'boolean' }).notNull().default(false),
    matchesPlayed: integer('matchesPlayed').notNull().default(0),
    eloFront: integer('eloFront').notNull().default(1000),
    eloBack: integer('eloBack').notNull().default(1000),
    eloTotal: integer('eloTotal').notNull().default(1000)
  },
  (player) => ({
    userIdLeagueIdIdx: index('Player_userId_leagueId_index').on(player.userId, player.leagueId)
  })
);

export const Teams = sqliteTable(
  'team',
  {
    id: text('id').primaryKey().$defaultFn(() => randomUUID()),
    leagueId: text('leagueId')
      .notNull()
      .references(() => Leagues.id, { onDelete: 'cascade' }),
    frontId: text('frontId')
      .notNull()
      .references(() => Players.id, { onDelete: 'cascade' }),
    backId: text('backId')
      .notNull()
      .references(() => Players.id, { onDelete: 'cascade' }),
    matchesPlayed: integer('matchesPlayed').notNull().default(0),
    eloTotal: integer('eloTotal').notNull().default(1000)
  },
  (team) => ({
    leagueIdFrontIdBackIdIdx: index('Team_leagueId_frontId_backId_index').on(team.leagueId, team.frontId, team.backId)
  })
);

export const Matches = sqliteTable(
  'match',
  {
    id: text('id').primaryKey().$defaultFn(() => randomUUID()),
    leagueId: text('leagueId')
      .notNull()
      .references(() => Leagues.id, { onDelete: 'cascade' }),
    team1Id: text('team1Id')
      .notNull()
      .references(() => Teams.id, { onDelete: 'cascade' }),
    team2Id: text('team2Id')
      .notNull()
      .references(() => Teams.id, { onDelete: 'cascade' }),
    score1: integer('score1').notNull().default(0),
    score2: integer('score2').notNull().default(0),
    date: integer('date', { mode: 'timestamp_ms' }).$defaultFn(() => new Date()),
    createdById: text('createdById')
      .notNull()
      .references(() => Users.id, { onDelete: 'cascade' }),
    team1FrontEloDelta: integer('team1FrontEloDelta'),
    team1BackEloDelta: integer('team1BackEloDelta'),
    team2FrontEloDelta: integer('team2FrontEloDelta'),
    team2BackEloDelta: integer('team2BackEloDelta'),
    team1EloDelta: integer('team1EloDelta'),
    team2EloDelta: integer('team2EloDelta')
  }
);

export const AccountsRelations = relations(Accounts, ({ one }) => ({
  user: one(Users, { fields: [Accounts.userId], references: [Users.id] })
}));

export const SessionsRelations = relations(Sessions, ({ one }) => ({
  user: one(Users, { fields: [Sessions.userId], references: [Users.id] })
}));

export const LeaguesRelations = relations(Leagues, ({ many }) => ({
  players: many(Players, { relationName: 'league' }),
  teams: many(Teams, { relationName: 'league' }),
  matches: many(Matches, { relationName: 'league' })
}));

export const PlayersRelations = relations(Players, ({ one, many }) => ({
  user: one(Users, { fields: [Players.userId], references: [Users.id] }),
  league: one(Leagues, { fields: [Players.leagueId], references: [Leagues.id] }),
  teamsFront: many(Teams, { relationName: 'front' }),
  teamsBack: many(Teams, { relationName: 'back' })
}));

export const TeamsRelations = relations(Teams, ({ one, many }) => ({
  league: one(Leagues, { fields: [Teams.leagueId], references: [Leagues.id] }),
  front: one(Players, { fields: [Teams.frontId], references: [Players.id] }),
  back: one(Players, { fields: [Teams.backId], references: [Players.id] }),
  matchesTeam1: many(Matches, { relationName: 'team1' }),
  matchesTeam2: many(Matches, { relationName: 'team2' })
}));

export const MatchesRelations = relations(Matches, ({ one }) => ({
  league: one(Leagues, { fields: [Matches.leagueId], references: [Leagues.id] }),
  team1: one(Teams, { fields: [Matches.team1Id], references: [Teams.id] }),
  team2: one(Teams, { fields: [Matches.team2Id], references: [Teams.id] }),
  createdBy: one(Users, { fields: [Matches.createdById], references: [Users.id] })
}));

export const UsersRelations = relations(Users, ({ one, many }) => ({
  account: one(Accounts, { fields: [Users.id], references: [Accounts.userId] }),
  sessions: many(Sessions, { relationName: 'user' }),
  players: many(Players, { relationName: 'user' }),
  matchesCreated: many(Matches, { relationName: 'createdBy' })
}));
