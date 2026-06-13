-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "passwordHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "contactName" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Site" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "primaryDomain" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "hostingProvider" TEXT,
    "hostingPlan" TEXT,
    "serverIpOrUrl" TEXT,
    "hostingCostAmount" REAL,
    "hostingCostCurrency" TEXT NOT NULL DEFAULT 'ILS',
    "hostingBillingCycle" TEXT NOT NULL DEFAULT 'monthly',
    "hostingRenewalDate" DATETIME,
    "domainRegistrar" TEXT,
    "domainCostAmount" REAL,
    "domainCurrency" TEXT NOT NULL DEFAULT 'ILS',
    "domainBillingCycle" TEXT NOT NULL DEFAULT 'yearly',
    "domainRenewalDate" DATETIME,
    "framework" TEXT,
    "language" TEXT,
    "dbType" TEXT,
    "dbHostNotes" TEXT,
    "repoUrl" TEXT,
    "clientBillingAmount" REAL,
    "clientBillingCurrency" TEXT NOT NULL DEFAULT 'ILS',
    "clientBillingCycle" TEXT NOT NULL DEFAULT 'monthly',
    "monitorEnabled" BOOLEAN NOT NULL DEFAULT true,
    "lastCheckAt" DATETIME,
    "lastStatusCode" INTEGER,
    "lastUp" BOOLEAN,
    "lastResponseMs" INTEGER,
    "sslValidTo" DATETIME,
    "sslIssuer" TEXT,
    "sslDaysLeft" INTEGER,
    "lastCheckError" TEXT,
    CONSTRAINT "Site_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "siteId" TEXT NOT NULL,
    "serviceName" TEXT NOT NULL,
    "provider" TEXT,
    "costAmount" REAL,
    "currency" TEXT NOT NULL DEFAULT 'ILS',
    "billingCycle" TEXT NOT NULL DEFAULT 'monthly',
    "renewalDate" DATETIME,
    "autoRenew" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Subscription_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Credential" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "siteId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'other',
    "username" TEXT,
    "url" TEXT,
    "secretCipher" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Credential_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SiteCheck" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "siteId" TEXT NOT NULL,
    "checkedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statusCode" INTEGER,
    "up" BOOLEAN NOT NULL DEFAULT false,
    "responseMs" INTEGER,
    "sslValidTo" DATETIME,
    "sslDaysLeft" INTEGER,
    "error" TEXT,
    CONSTRAINT "SiteCheck_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "NotificationLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "refType" TEXT NOT NULL,
    "refId" TEXT NOT NULL,
    "siteId" TEXT,
    "threshold" INTEGER NOT NULL,
    "dueDate" DATETIME NOT NULL,
    "channel" TEXT NOT NULL DEFAULT 'email',
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "sentAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Client_name_idx" ON "Client"("name");

-- CreateIndex
CREATE INDEX "Site_clientId_idx" ON "Site"("clientId");

-- CreateIndex
CREATE INDEX "Site_status_idx" ON "Site"("status");

-- CreateIndex
CREATE INDEX "Subscription_siteId_idx" ON "Subscription"("siteId");

-- CreateIndex
CREATE INDEX "Subscription_renewalDate_idx" ON "Subscription"("renewalDate");

-- CreateIndex
CREATE INDEX "Credential_siteId_idx" ON "Credential"("siteId");

-- CreateIndex
CREATE INDEX "SiteCheck_siteId_checkedAt_idx" ON "SiteCheck"("siteId", "checkedAt");

-- CreateIndex
CREATE INDEX "NotificationLog_siteId_idx" ON "NotificationLog"("siteId");

-- CreateIndex
CREATE INDEX "NotificationLog_sentAt_idx" ON "NotificationLog"("sentAt");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationLog_refType_refId_threshold_channel_dueDate_key" ON "NotificationLog"("refType", "refId", "threshold", "channel", "dueDate");
