-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'STAFF',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Resident" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "unitNumber" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Locker" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lockerNumber" TEXT NOT NULL,
    "qrIdentifier" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "currentPin" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Package" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lockerId" TEXT NOT NULL,
    "residentId" TEXT NOT NULL,
    "pin" TEXT NOT NULL,
    "photoUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pickedUpAt" DATETIME,
    CONSTRAINT "Package_lockerId_fkey" FOREIGN KEY ("lockerId") REFERENCES "Locker" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Package_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES "Resident" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Resident_email_key" ON "Resident"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Locker_lockerNumber_key" ON "Locker"("lockerNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Locker_qrIdentifier_key" ON "Locker"("qrIdentifier");
