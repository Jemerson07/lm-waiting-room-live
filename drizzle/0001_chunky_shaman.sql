CREATE TABLE `attendances` (
	`id` int AUTO_INCREMENT NOT NULL,
	`licensePlate` varchar(10) NOT NULL,
	`vehicleModel` varchar(100) NOT NULL,
	`customerName` varchar(255),
	`status` enum('arrival','waiting','in_service','completed') NOT NULL DEFAULT 'arrival',
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `attendances_id` PRIMARY KEY(`id`)
);
