-- CreateEnum
CREATE TYPE "RequestType" AS ENUM ('hire', 'consult');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('open', 'in_progress', 'done', 'canceled');

-- CreateEnum
CREATE TYPE "SpecialistStatus" AS ENUM ('new', 'contacted', 'scheduled', 'interviewed', 'hired', 'rejected', 'consult_scheduled', 'consult_done');

-- CreateEnum
CREATE TYPE "MessageSender" AS ENUM ('owner', 'specialist');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('sent', 'delivered', 'read');

-- CreateEnum
CREATE TYPE "CallStatus" AS ENUM ('scheduled', 'canceled', 'completed');

-- CreateTable
CREATE TABLE "Request" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "type" "RequestType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priceKopecks" INTEGER,
    "status" "RequestStatus" NOT NULL DEFAULT 'open',
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Specialist" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "exp" TEXT,
    "matchScore" INTEGER,
    "matchReason" TEXT,
    "location" TEXT,
    "salary" TEXT,
    "source" TEXT,
    "status" "SpecialistStatus" NOT NULL DEFAULT 'new',
    "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "about" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "portfolioUrl" TEXT,
    "availability" TEXT,
    "timezone" TEXT,
    "resumeKey" TEXT,
    "avatarKey" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Specialist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StatusChange" (
    "id" TEXT NOT NULL,
    "specialistId" TEXT NOT NULL,
    "fromStatus" "SpecialistStatus" NOT NULL,
    "toStatus" "SpecialistStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StatusChange_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpecialistAccessToken" (
    "id" TEXT NOT NULL,
    "specialistId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SpecialistAccessToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "specialistId" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "sender" "MessageSender" NOT NULL,
    "text" TEXT NOT NULL,
    "status" "MessageStatus" NOT NULL DEFAULT 'sent',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduledCall" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "specialistId" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "link" TEXT,
    "status" "CallStatus" NOT NULL DEFAULT 'scheduled',
    "resultNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduledCall_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Request_companyId_status_idx" ON "Request"("companyId", "status");

-- CreateIndex
CREATE INDEX "Specialist_companyId_status_idx" ON "Specialist"("companyId", "status");

-- CreateIndex
CREATE INDEX "Specialist_requestId_idx" ON "Specialist"("requestId");

-- CreateIndex
CREATE INDEX "StatusChange_specialistId_createdAt_idx" ON "StatusChange"("specialistId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SpecialistAccessToken_token_key" ON "SpecialistAccessToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_specialistId_key" ON "Conversation"("specialistId");

-- CreateIndex
CREATE INDEX "Message_conversationId_createdAt_idx" ON "Message"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "ScheduledCall_companyId_scheduledAt_idx" ON "ScheduledCall"("companyId", "scheduledAt");

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Specialist" ADD CONSTRAINT "Specialist_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Specialist" ADD CONSTRAINT "Specialist_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StatusChange" ADD CONSTRAINT "StatusChange_specialistId_fkey" FOREIGN KEY ("specialistId") REFERENCES "Specialist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpecialistAccessToken" ADD CONSTRAINT "SpecialistAccessToken_specialistId_fkey" FOREIGN KEY ("specialistId") REFERENCES "Specialist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_specialistId_fkey" FOREIGN KEY ("specialistId") REFERENCES "Specialist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledCall" ADD CONSTRAINT "ScheduledCall_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledCall" ADD CONSTRAINT "ScheduledCall_specialistId_fkey" FOREIGN KEY ("specialistId") REFERENCES "Specialist"("id") ON DELETE CASCADE ON UPDATE CASCADE;
