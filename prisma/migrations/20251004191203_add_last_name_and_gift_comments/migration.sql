-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "last_name" TEXT;

-- CreateTable
CREATE TABLE "public"."GiftComment" (
    "id" SERIAL NOT NULL,
    "gift_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GiftComment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."GiftComment" ADD CONSTRAINT "GiftComment_gift_id_fkey" FOREIGN KEY ("gift_id") REFERENCES "public"."Gift"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GiftComment" ADD CONSTRAINT "GiftComment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
