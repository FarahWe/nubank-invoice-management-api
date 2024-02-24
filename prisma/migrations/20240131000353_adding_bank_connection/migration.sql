-- CreateTable
CREATE TABLE "bank_connections" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "access_token" TEXT,
    "refresh_token" TEXT,
    "cert" BLOB,
    "account_id" TEXT NOT NULL,
    CONSTRAINT "bank_connections_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "bank-connection-idx" ON "bank_connections"("account_id");
