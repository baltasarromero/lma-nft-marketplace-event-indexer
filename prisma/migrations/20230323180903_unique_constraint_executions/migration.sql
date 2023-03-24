/*
  Warnings:

  - A unique constraint covering the columns `[lastBlockNumber,event]` on the table `Execution` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Execution_lastBlockNumber_event_key" ON "Execution"("lastBlockNumber", "event");
