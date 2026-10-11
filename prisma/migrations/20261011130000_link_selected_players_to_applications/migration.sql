-- AddForeignKey
ALTER TABLE "ShowcaseSelectedPlayer" ADD CONSTRAINT "ShowcaseSelectedPlayer_matchedApplicationId_fkey" FOREIGN KEY ("matchedApplicationId") REFERENCES "ShowcaseApplication"("id") ON DELETE SET NULL ON UPDATE CASCADE;
