-- CreateEnum
CREATE TYPE "CustomerRole" AS ENUM ('user', 'client', 'employeer');
CREATE TYPE "ImageType" AS ENUM ('camera', 'face');

CREATE TABLE "tb_role" (
    "id"   SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "tb_user" (
    "id"   SERIAL PRIMARY KEY,
    "role_id" INTEGER NOT NULL,
    "user_name" VARCHAR(10) NOT NULL UNIQUE,
    "password" VARCHAR(100) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT True,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tb_user_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "tb_role"("id")
);

CREATE TABLE "tb_customer" (
    "id"   SERIAL PRIMARY KEY,
    "role" "CustomerRole" NOT NULL DEFAULT 'user',
    "name" TEXT NOT NULL,
    "detail_info" TEXT,
    "last_seen_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "tb_session" (
    "id"   SERIAL PRIMARY KEY,
    "customer_id" INT NOT NULL,
    "day_session" TEXT NOT NULL,
    "session_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tb_session_user_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "tb_customer"("id")
);

CREATE INDEX "tb_session_customer_id_idx" ON "tb_session"("customer_id");
CREATE INDEX "tb_session_day_session_idx" ON "tb_session"("day_session");
CREATE INDEX "tb_session_session_date_idx" ON "tb_session"("session_date");

CREATE TABLE "tb_camera" (
    "id"   SERIAL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "sub_title" TEXT NOT NULL,
    "floor_num" INTEGER NOT NULL,
    "floor_sub_num" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "tb_camera_title_idx" ON "tb_camera"("title");
CREATE INDEX "tb_camera_sub_title_idx" ON "tb_camera"("sub_title");
CREATE INDEX "tb_camera_floor_num_idx" ON "tb_camera"("floor_num");
CREATE INDEX "tb_camera_floor_sub_num_idx" ON "tb_camera"("floor_sub_num");

CREATE TABLE "tb_history" (
    "id"   SERIAL PRIMARY KEY,
    "customer_id" INTEGER NOT NULL,
    "camera_id" INTEGER NOT NULL,
    "seen_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tb_history_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "tb_customer"("id"),
    CONSTRAINT "tb_history_camera_id_fkey" FOREIGN KEY ("camera_id") REFERENCES "tb_camera"("id")
);

CREATE INDEX "tb_history_customer_id_idx" ON "tb_history"("customer_id");
CREATE INDEX "tb_history_camera_id_idx" ON "tb_history"("camera_id");
CREATE INDEX "tb_history_seen_at_idx" ON "tb_history"("seen_at");

CREATE TABLE "tb_image" (
    "id"   SERIAL PRIMARY KEY,
    "customer_id" INT,
    "camera_id" INTEGER,
    "history_id" INT,
    "image_type" "ImageType" NOT NULL DEFAULT 'camera',
    "url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tb_image_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "tb_customer"("id"),
    CONSTRAINT "tb_image_camera_id_fkey" FOREIGN KEY ("camera_id") REFERENCES "tb_camera"("id"),
    CONSTRAINT "tb_image_history_id_fkey" FOREIGN KEY ("history_id") REFERENCES "tb_history"("id")
);

CREATE INDEX "tb_image_customer_id_idx" ON "tb_image"("customer_id");
CREATE INDEX "tb_image_camera_id_idx" ON "tb_image"("camera_id");
CREATE INDEX "tb_image_history_id_idx" ON "tb_image"("history_id");
CREATE INDEX "tb_image_image_type_idx" ON "tb_image"("image_type");

CREATE TABLE "tb_constant" (
    "id"   SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
