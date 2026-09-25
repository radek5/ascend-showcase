CREATE TYPE "ShowcaseSockSize" AS ENUM ('S', 'M', 'L');

CREATE TYPE "ShowcaseShoeSizeSystem" AS ENUM ('UK', 'EU', 'US');

ALTER TABLE "ShowcaseApplication"
ADD COLUMN "shirtSize" "ShowcaseKitSize",
ADD COLUMN "shortsSize" "ShowcaseKitSize",
ADD COLUMN "sockSize" "ShowcaseSockSize",
ADD COLUMN "shoeSizeSystem" "ShowcaseShoeSizeSystem",
ADD COLUMN "shoeSize" TEXT;
