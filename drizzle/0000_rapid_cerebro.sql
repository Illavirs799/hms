CREATE TYPE "public"."complaint_status" AS ENUM('pending', 'resolved');--> statement-breakpoint
CREATE TYPE "public"."fee_status" AS ENUM('paid', 'pending');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('admin', 'warden', 'student');--> statement-breakpoint
CREATE TYPE "public"."room_status" AS ENUM('occupied', 'vacant');--> statement-breakpoint
CREATE TABLE "complaints" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"description" text NOT NULL,
	"status" "complaint_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"resolved_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "floors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"floor_number" integer NOT NULL,
	CONSTRAINT "floors_floor_number_unique" UNIQUE("floor_number")
);
--> statement-breakpoint
CREATE TABLE "rooms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"room_number" text NOT NULL,
	"floor_id" uuid NOT NULL,
	"status" "room_status" DEFAULT 'vacant' NOT NULL,
	"capacity" integer DEFAULT 3 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "students" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"register_number" text NOT NULL,
	"room_id" uuid,
	"fee_status" "fee_status" DEFAULT 'pending' NOT NULL,
	"fee_amount" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "students_register_number_unique" UNIQUE("register_number")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" "role" DEFAULT 'student' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "wardens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"assigned_floor_id" uuid
);
--> statement-breakpoint
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_floor_id_floors_id_fk" FOREIGN KEY ("floor_id") REFERENCES "public"."floors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wardens" ADD CONSTRAINT "wardens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wardens" ADD CONSTRAINT "wardens_assigned_floor_id_floors_id_fk" FOREIGN KEY ("assigned_floor_id") REFERENCES "public"."floors"("id") ON DELETE no action ON UPDATE no action;