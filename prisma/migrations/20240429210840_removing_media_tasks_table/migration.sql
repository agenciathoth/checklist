/*
  Warnings:

  - You are about to drop the `media_tasks` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `order` to the `medias` table without a default value. This is not possible if the table is not empty.
  - Added the required column `task_id` to the `medias` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "medias" ADD COLUMN     "order" INTEGER NOT NULL,
ADD COLUMN     "task_id" TEXT NOT NULL;

-- DropTable
DROP TABLE "media_tasks";

-- AddForeignKey
ALTER TABLE "medias" ADD CONSTRAINT "medias_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
