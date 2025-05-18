CREATE TABLE IF NOT EXISTS "__EFMigrationsHistory" (
    "MigrationId" character varying(150) NOT NULL,
    "ProductVersion" character varying(32) NOT NULL,
    CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId")
);

START TRANSACTION;
CREATE TABLE "AspNetRoles" (
    "Id" nvarchar(450) NOT NULL,
    "Name" nvarchar(256),
    "NormalizedName" nvarchar(256),
    "ConcurrencyStamp" nvarchar(max),
    CONSTRAINT "PK_AspNetRoles" PRIMARY KEY ("Id")
);

CREATE TABLE "AspNetUsers" (
    "Id" nvarchar(450) NOT NULL,
    "UserName" nvarchar(256),
    "NormalizedUserName" nvarchar(256),
    "Email" nvarchar(256),
    "NormalizedEmail" nvarchar(256),
    "EmailConfirmed" bit NOT NULL,
    "PasswordHash" nvarchar(max),
    "SecurityStamp" nvarchar(max),
    "ConcurrencyStamp" nvarchar(max),
    "PhoneNumber" nvarchar(max),
    "PhoneNumberConfirmed" bit NOT NULL,
    "TwoFactorEnabled" bit NOT NULL,
    "LockoutEnd" datetimeoffset,
    "LockoutEnabled" bit NOT NULL,
    "AccessFailedCount" int NOT NULL,
    CONSTRAINT "PK_AspNetUsers" PRIMARY KEY ("Id")
);

CREATE TABLE "AspNetRoleClaims" (
    "Id" int NOT NULL,
    "RoleId" nvarchar(450) NOT NULL,
    "ClaimType" nvarchar(max),
    "ClaimValue" nvarchar(max),
    CONSTRAINT "PK_AspNetRoleClaims" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_AspNetRoleClaims_AspNetRoles_RoleId" FOREIGN KEY ("RoleId") REFERENCES "AspNetRoles" ("Id") ON DELETE CASCADE
);

CREATE TABLE "AspNetUserClaims" (
    "Id" int NOT NULL,
    "UserId" nvarchar(450) NOT NULL,
    "ClaimType" nvarchar(max),
    "ClaimValue" nvarchar(max),
    CONSTRAINT "PK_AspNetUserClaims" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_AspNetUserClaims_AspNetUsers_UserId" FOREIGN KEY ("UserId") REFERENCES "AspNetUsers" ("Id") ON DELETE CASCADE
);

CREATE TABLE "AspNetUserLogins" (
    "LoginProvider" nvarchar(450) NOT NULL,
    "ProviderKey" nvarchar(450) NOT NULL,
    "ProviderDisplayName" nvarchar(max),
    "UserId" nvarchar(450) NOT NULL,
    CONSTRAINT "PK_AspNetUserLogins" PRIMARY KEY ("LoginProvider", "ProviderKey"),
    CONSTRAINT "FK_AspNetUserLogins_AspNetUsers_UserId" FOREIGN KEY ("UserId") REFERENCES "AspNetUsers" ("Id") ON DELETE CASCADE
);

CREATE TABLE "AspNetUserRoles" (
    "UserId" nvarchar(450) NOT NULL,
    "RoleId" nvarchar(450) NOT NULL,
    CONSTRAINT "PK_AspNetUserRoles" PRIMARY KEY ("UserId", "RoleId"),
    CONSTRAINT "FK_AspNetUserRoles_AspNetRoles_RoleId" FOREIGN KEY ("RoleId") REFERENCES "AspNetRoles" ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_AspNetUserRoles_AspNetUsers_UserId" FOREIGN KEY ("UserId") REFERENCES "AspNetUsers" ("Id") ON DELETE CASCADE
);

CREATE TABLE "AspNetUserTokens" (
    "UserId" nvarchar(450) NOT NULL,
    "LoginProvider" nvarchar(450) NOT NULL,
    "Name" nvarchar(450) NOT NULL,
    "Value" nvarchar(max),
    CONSTRAINT "PK_AspNetUserTokens" PRIMARY KEY ("UserId", "LoginProvider", "Name"),
    CONSTRAINT "FK_AspNetUserTokens_AspNetUsers_UserId" FOREIGN KEY ("UserId") REFERENCES "AspNetUsers" ("Id") ON DELETE CASCADE
);

CREATE TABLE "Budgets" (
    "Id" int NOT NULL,
    "UserId" nvarchar(450) NOT NULL,
    "Category" varchar(255) NOT NULL,
    "Limit" decimal(10,2) NOT NULL,
    "Day" int NOT NULL,
    CONSTRAINT "PK_Budgets" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_Budgets_AspNetUsers_UserId" FOREIGN KEY ("UserId") REFERENCES "AspNetUsers" ("Id") ON DELETE CASCADE
);

CREATE TABLE "Items" (
    "Id" int NOT NULL,
    "UserId" nvarchar(450) NOT NULL,
    "PlaidItemId" varchar(150) NOT NULL,
    "AccessToken" varchar(100) NOT NULL,
    "Cursor" varchar(255),
    "LastFetched" datetimeoffset,
    "InstitutionName" varchar(255) NOT NULL,
    "InstitutionId" nvarchar(max) NOT NULL,
    CONSTRAINT "PK_Items" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_Items_AspNetUsers_UserId" FOREIGN KEY ("UserId") REFERENCES "AspNetUsers" ("Id") ON DELETE CASCADE
);

CREATE TABLE "Accounts" (
    "Id" int NOT NULL,
    "ItemId" int NOT NULL,
    "UserId" nvarchar(450),
    "PlaidAccountId" varchar(100) NOT NULL,
    "CurrentBalance" decimal(18,2) NOT NULL,
    "AvailableBalance" decimal(18,2) NOT NULL,
    "Mask" varchar(50),
    "Name" varchar(255) NOT NULL,
    "OfficialName" varchar(255),
    "Type" varchar(255) NOT NULL,
    "Subtype" varchar(255),
    CONSTRAINT "PK_Accounts" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_Accounts_AspNetUsers_UserId" FOREIGN KEY ("UserId") REFERENCES "AspNetUsers" ("Id"),
    CONSTRAINT "FK_Accounts_Items_ItemId" FOREIGN KEY ("ItemId") REFERENCES "Items" ("Id") ON DELETE CASCADE
);

CREATE TABLE "Transactions" (
    "Id" int NOT NULL,
    "Name" varchar(255) NOT NULL,
    "Date" date NOT NULL,
    "PlaidTransactionId" varchar(100) NOT NULL,
    "AccountId" int NOT NULL,
    "UserId" nvarchar(450),
    "Amount" decimal(18,2) NOT NULL,
    "IsoCurrencyCode" varchar(255),
    "UnofficialCurrencyCode" varchar(255),
    "MerchantName" varchar(255),
    "LogoUrl" varchar(255),
    "Website" varchar(255),
    "Datetime" datetimeoffset,
    "PaymentChannel" varchar(255),
    "Category" varchar(255) NOT NULL,
    "TransactionCode" varchar(255),
    "CategoryIconUrl" varchar(255),
    CONSTRAINT "PK_Transactions" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_Transactions_Accounts_AccountId" FOREIGN KEY ("AccountId") REFERENCES "Accounts" ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_Transactions_AspNetUsers_UserId" FOREIGN KEY ("UserId") REFERENCES "AspNetUsers" ("Id")
);

CREATE INDEX "IX_Accounts_ItemId" ON "Accounts" ("ItemId");

CREATE INDEX "IX_Accounts_UserId" ON "Accounts" ("UserId");

CREATE INDEX "IX_AspNetRoleClaims_RoleId" ON "AspNetRoleClaims" ("RoleId");

CREATE UNIQUE INDEX "RoleNameIndex" ON "AspNetRoles" ("NormalizedName") WHERE [NormalizedName] IS NOT NULL;

CREATE INDEX "IX_AspNetUserClaims_UserId" ON "AspNetUserClaims" ("UserId");

CREATE INDEX "IX_AspNetUserLogins_UserId" ON "AspNetUserLogins" ("UserId");

CREATE INDEX "IX_AspNetUserRoles_RoleId" ON "AspNetUserRoles" ("RoleId");

CREATE INDEX "EmailIndex" ON "AspNetUsers" ("NormalizedEmail");

CREATE UNIQUE INDEX "UserNameIndex" ON "AspNetUsers" ("NormalizedUserName") WHERE [NormalizedUserName] IS NOT NULL;

CREATE INDEX "IX_Budgets_UserId" ON "Budgets" ("UserId");

CREATE INDEX "IX_Items_UserId" ON "Items" ("UserId");

CREATE INDEX "IX_Transactions_AccountId" ON "Transactions" ("AccountId");

CREATE UNIQUE INDEX "IX_Transactions_Amount_Id" ON "Transactions" ("Amount", "Id");

CREATE INDEX "IX_Transactions_Category" ON "Transactions" ("Category");

CREATE INDEX "IX_Transactions_Date_Id" ON "Transactions" ("Date" DESC, "Id" DESC);

CREATE INDEX "IX_Transactions_Name" ON "Transactions" ("Name");

CREATE INDEX "IX_Transactions_UserId" ON "Transactions" ("UserId");

INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20250421000116_Initial', '9.0.5');

COMMIT;