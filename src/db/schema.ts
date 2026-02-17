import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  foreignKey,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const roleEnum = pgEnum('role', ['admin', 'warden', 'student']);
export const roomStatusEnum = pgEnum('room_status', ['occupied', 'vacant']);
export const feeStatusEnum = pgEnum('fee_status', ['paid', 'pending']);
export const complaintStatusEnum = pgEnum('complaint_status', [
  'pending',
  'resolved',
]);

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: roleEnum('role').notNull().default('student'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ one }) => ({
  student: one(students, {
    fields: [users.id],
    references: [students.userId],
  }),
  warden: one(wardens, {
    fields: [users.id],
    references: [wardens.userId],
  }),
}));

export const floors = pgTable('floors', {
  id: uuid('id').defaultRandom().primaryKey(),
  floorNumber: integer('floor_number').notNull().unique(),
});

export const floorsRelations = relations(floors, ({ many }) => ({
  rooms: many(rooms),
}));

export const rooms = pgTable('rooms', {
  id: uuid('id').defaultRandom().primaryKey(),
  roomNumber: text('room_number').notNull(), // Changed to text to allow alphanumeric (e.g. 101A)
  floorId: uuid('floor_id')
    .references(() => floors.id)
    .notNull(),
  status: roomStatusEnum('status').notNull().default('vacant'),
  capacity: integer('capacity').notNull().default(3), // Added capacity for logic
});

export const roomsRelations = relations(rooms, ({ one, many }) => ({
  floor: one(floors, {
    fields: [rooms.floorId],
    references: [floors.id],
  }),
  students: many(students),
}));

export const wardens = pgTable('wardens', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => users.id)
    .notNull(),
  assignedFloorId: uuid('assigned_floor_id').references(() => floors.id), // Nullable as per "Create & Assign" flow
});

export const wardensRelations = relations(wardens, ({ one }) => ({
  user: one(users, {
    fields: [wardens.userId],
    references: [users.id],
  }),
  assignedFloor: one(floors, {
    fields: [wardens.assignedFloorId],
    references: [floors.id],
  }),
}));

export const students = pgTable('students', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => users.id)
    .notNull(),
  registerNumber: text('register_number').notNull().unique(), // e.g., "22BQ1A05G0"
  roomId: uuid('room_id').references(() => rooms.id),
  feeStatus: feeStatusEnum('fee_status').notNull().default('pending'),
  feeAmount: integer('fee_amount').notNull().default(0),
});

export const studentsRelations = relations(students, ({ one, many }) => ({
  user: one(users, {
    fields: [students.userId],
    references: [users.id],
  }),
  room: one(rooms, {
    fields: [students.roomId],
    references: [rooms.id],
  }),
  complaints: many(complaints),
}));

export const complaints = pgTable('complaints', {
  id: uuid('id').defaultRandom().primaryKey(),
  studentId: uuid('student_id')
    .references(() => students.id)
    .notNull(),
  description: text('description').notNull(),
  status: complaintStatusEnum('status').notNull().default('pending'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  resolvedAt: timestamp('resolved_at'),
});

export const complaintsRelations = relations(complaints, ({ one }) => ({
  student: one(students, {
    fields: [complaints.studentId],
    references: [students.id],
  }),
}));
