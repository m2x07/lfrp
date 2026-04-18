/*
  Warnings:

  - You are about to drop the column `token` on the `AuthRequest` table. All the data in the column will be lost.
  - Added the required column `otp` to the `AuthRequest` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AuthRequest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "otp" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME NOT NULL,
    CONSTRAINT "AuthRequest_email_fkey" FOREIGN KEY ("email") REFERENCES "User" ("email") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_AuthRequest" ("createdAt", "email", "expiresAt", "id") SELECT "createdAt", "email", "expiresAt", "id" FROM "AuthRequest";
DROP TABLE "AuthRequest";
ALTER TABLE "new_AuthRequest" RENAME TO "AuthRequest";
CREATE UNIQUE INDEX "AuthRequest_email_key" ON "AuthRequest"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
