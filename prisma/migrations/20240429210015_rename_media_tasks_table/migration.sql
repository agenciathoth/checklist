/*
  Warnings:

  - You are about to drop the `MediaTasks` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "MediaTasks";

-- CreateTable
CREATE TABLE "media_tasks" (
    "taskId" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "media_tasks_pkey" PRIMARY KEY ("taskId","mediaId")
);
