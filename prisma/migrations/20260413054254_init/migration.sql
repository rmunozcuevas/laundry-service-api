-- AlterTable
CREATE SEQUENCE pricingtier_id_seq;
ALTER TABLE "PricingTier" ALTER COLUMN "id" SET DEFAULT nextval('pricingtier_id_seq');
ALTER SEQUENCE pricingtier_id_seq OWNED BY "PricingTier"."id";

-- AlterTable
CREATE SEQUENCE subscriptions_id_seq;
ALTER TABLE "Subscriptions" ALTER COLUMN "id" SET DEFAULT nextval('subscriptions_id_seq');
ALTER SEQUENCE subscriptions_id_seq OWNED BY "Subscriptions"."id";

-- AlterTable
CREATE SEQUENCE user_id_seq;
ALTER TABLE "User" ALTER COLUMN "id" SET DEFAULT nextval('user_id_seq');
ALTER SEQUENCE user_id_seq OWNED BY "User"."id";
