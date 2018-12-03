BEGIN TRANSACTION;
--DROP TABLE IF EXISTS `person`;
CREATE TABLE IF NOT EXISTS `person` (
	`id`	INTEGER NOT NULL,
	`name`	TEXT NOT NULL,
	`dateOfBirth`	DATETIME,
	`clergyStatus`	TEXT NOT NULL,
	`district`	TEXT,
    `gender` TEXT NOT NULL,
	PRIMARY KEY(`id`),
	CONSTRAINT `unique_person` UNIQUE ('name', 'dateOfBirth')
);
COMMIT;
BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS `assesment` (
	`id`	INTEGER NOT NULL,
    `personId` INTEGER,
	`date` DATETIME,
    `inconsistencyIndex`  INTEGER,
    `positiveImpression`  INTEGER,
    `negativeImpression`  INTEGER,
    `item133Response`  INTEGER,
    `totalEmotionalIntelligence`  INTEGER,
    `selfPerceptionComposite`  INTEGER,
    `selfRegard`  INTEGER,
    `selfActualization`  INTEGER,
    `emotionalSelfAwareness`  INTEGER,
    `selfExpressionComposite`  INTEGER,
    `emotionalExpression`  INTEGER,
    `assertiveness`  INTEGER,
    `independence`  INTEGER,
    `interpersonalComposite`  INTEGER,
    `interpersonalRelationships`  INTEGER,
    `empathy`  INTEGER,
    `socialResponsibility`  INTEGER,
    `decisionMakingComposite`  INTEGER,
    `problemSolving`  INTEGER,
    `realityTesting`  INTEGER,
    `impulseControl`  INTEGER,
    `stressManagementComposite`  INTEGER,
    `flexibility`  INTEGER,
    `stressTolerance`  INTEGER,
    `optimism` INTEGER,
    `wellBeingIndicator`  INTEGER,
	PRIMARY KEY(`id`),
	FOREIGN KEY(`personId`) REFERENCES person(`id`)
);
COMMIT;
