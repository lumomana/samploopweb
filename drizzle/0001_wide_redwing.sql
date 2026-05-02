CREATE TABLE `audioSamples` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerUserId` int,
	`sourceKind` enum('seeded','user_upload') NOT NULL,
	`libraryStatus` enum('ready','archived','processing','error') NOT NULL DEFAULT 'ready',
	`name` varchar(180) NOT NULL,
	`sortName` varchar(180) NOT NULL,
	`category` varchar(80) NOT NULL,
	`mimeType` varchar(120) NOT NULL,
	`fileKey` varchar(255) NOT NULL,
	`fileUrl` text NOT NULL,
	`waveformPreview` text,
	`dominantColor` varchar(24),
	`bpm` int,
	`durationMs` int NOT NULL,
	`byteSize` int NOT NULL,
	`isLoop` int NOT NULL DEFAULT 1,
	`originalFileName` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `audioSamples_id` PRIMARY KEY(`id`),
	CONSTRAINT `audioSamples_fileKey_unique` UNIQUE(`fileKey`)
);
--> statement-breakpoint
ALTER TABLE `audioSamples` ADD CONSTRAINT `audioSamples_ownerUserId_users_id_fk` FOREIGN KEY (`ownerUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;