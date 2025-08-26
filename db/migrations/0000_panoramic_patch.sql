CREATE TABLE `account` (
	`userId` text NOT NULL,
	`type` text NOT NULL,
	`provider` text NOT NULL,
	`providerAccountId` text NOT NULL,
	`refresh_token` text,
	`access_token` text,
	`expires_at` integer,
	`token_type` text,
	`scope` text,
	`id_token` text,
	`session_state` text,
	PRIMARY KEY(`provider`, `providerAccountId`),
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `league` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`maxPoints` integer DEFAULT 10 NOT NULL,
	`team1Color` text DEFAULT '#3b82f6' NOT NULL,
	`team2Color` text DEFAULT '#dc2626' NOT NULL
);

CREATE TABLE `match` (
	`id` text PRIMARY KEY NOT NULL,
	`leagueId` text NOT NULL,
	`team1Id` text NOT NULL,
	`team2Id` text NOT NULL,
	`score1` integer DEFAULT 0 NOT NULL,
	`score2` integer DEFAULT 0 NOT NULL,
	`date` integer,
	`createdById` text NOT NULL,
	`team1FrontEloDelta` integer,
	`team1BackEloDelta` integer,
	`team2FrontEloDelta` integer,
	`team2BackEloDelta` integer,
	`team1EloDelta` integer,
	`team2EloDelta` integer,
	FOREIGN KEY (`leagueId`) REFERENCES `league`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`team1Id`) REFERENCES `team`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`team2Id`) REFERENCES `team`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`createdById`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `player` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`leagueId` text NOT NULL,
	`admin` integer DEFAULT false NOT NULL,
	`banned` integer DEFAULT false NOT NULL,
	`matchesPlayed` integer DEFAULT 0 NOT NULL,
	`eloFront` integer DEFAULT 1000 NOT NULL,
	`eloBack` integer DEFAULT 1000 NOT NULL,
	`eloTotal` integer DEFAULT 1000 NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`leagueId`) REFERENCES `league`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`sessionToken` text NOT NULL,
	`userId` text NOT NULL,
	`expires` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `team` (
	`id` text PRIMARY KEY NOT NULL,
	`leagueId` text NOT NULL,
	`frontId` text NOT NULL,
	`backId` text NOT NULL,
	`matchesPlayed` integer DEFAULT 0 NOT NULL,
	`eloTotal` integer DEFAULT 1000 NOT NULL,
	FOREIGN KEY (`leagueId`) REFERENCES `league`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`frontId`) REFERENCES `player`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`backId`) REFERENCES `player`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`email` text NOT NULL,
	`emailVerified` integer,
	`image` text
);

CREATE TABLE `verificationToken` (
	`identifier` text NOT NULL,
	`token` text NOT NULL,
	`expires` integer NOT NULL,
	PRIMARY KEY(`identifier`, `token`)
);

CREATE INDEX `Account_userId_index` ON `account` (`userId`);
CREATE INDEX `Player_userId_leagueId_index` ON `player` (`userId`,`leagueId`);
CREATE UNIQUE INDEX `session_sessionToken_unique` ON `session` (`sessionToken`);
CREATE INDEX `Session_userId_index` ON `session` (`userId`);
CREATE INDEX `Team_leagueId_frontId_backId_index` ON `team` (`leagueId`,`frontId`,`backId`);
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);
CREATE UNIQUE INDEX `verificationToken_token_unique` ON `verificationToken` (`token`);