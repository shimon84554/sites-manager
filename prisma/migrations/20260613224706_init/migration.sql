-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contactName" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Site" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "primaryDomain" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "hostingProvider" TEXT,
    "hostingPlan" TEXT,
    "serverIpOrUrl" TEXT,
    "hostingCostAmount" DOUBLE PRECISION,
    "hostingCostCurrency" TEXT NOT NULL DEFAULT 'ILS',
    "hostingBillingCycle" TEXT NOT NULL DEFAULT 'monthly',
    "hostingRenewalDate" TIMESTAMP(3),
    "domainRegistrar" TEXT,
    "domainCostAmount" DOUBLE PRECISION,
    "domainCurrency" TEXT NOT NULL DEFAULT 'ILS',
    "domainBillingCycle" TEXT NOT NULL DEFAULT 'yearly',
    "domainRenewalDate" TIMESTAMP(3),
    "framework" TEXT,
    "language" TEXT,
    "dbType" TEXT,
    "dbHostNotes" TEXT,
    "repoUrl" TEXT,
    "clientBillingAmount" DOUBLE PRECISION,
    "clientBillingCurrency" TEXT NOT NULL DEFAULT 'ILS',
    "clientBillingCycle" TEXT NOT NULL DEFAULT 'monthly',
    "monitorEnabled" BOOLEAN NOT NULL DEFAULT true,
    "lastCheckAt" TIMESTAMP(3),
    "lastStatusCode" INTEGER,
    "lastUp" BOOLEAN,
    "lastResponseMs" INTEGER,
    "sslValidTo" TIMESTAMP(3),
    "sslIssuer" TEXT,
    "sslDaysLeft" INTEGER,
    "lastCheckError" TEXT,

    CONSTRAINT "Site_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "serviceName" TEXT NOT NULL,
    "provider" TEXT,
    "costAmount" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'ILS',
    "billingCycle" TEXT NOT NULL DEFAULT 'monthly',
    "renewalDate" TIMESTAMP(3),
    "autoRenew" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Credential" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'other',
    "username" TEXT,
    "url" TEXT,
    "secretCipher" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Credential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteCheck" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statusCode" INTEGER,
    "up" BOOLEAN NOT NULL DEFAULT false,
    "responseMs" INTEGER,
    "sslValidTo" TIMESTAMP(3),
    "sslDaysLeft" INTEGER,
    "error" TEXT,

    CONSTRAINT "SiteCheck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationLog" (
    "id" TEXT NOT NULL,
    "refType" TEXT NOT NULL,
    "refId" TEXT NOT NULL,
    "siteId" TEXT,
    "threshold" INTEGER NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "channel" TEXT NOT NULL DEFAULT 'email',
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotificationLog_pkey" PRIMARY KEY ("id")
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

-- AddForeignKey
ALTER TABLE "Site" ADD CONSTRAINT "Site_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Credential" ADD CONSTRAINT "Credential_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteCheck" ADD CONSTRAINT "SiteCheck_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE CASCADE;
