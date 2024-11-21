// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

// import { sql } from "drizzle-orm";
// import {
//   index,
//   integer,
//   pgTableCreator,
//   timestamp,
//   varchar,
// } from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
// export const createTable = pgTableCreator((name) => `getzilla_${name}`);

// export const posts = createTable(
//   "post",
//   {
//     id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
//     name: varchar("name", { length: 256 }),
//     createdAt: timestamp("created_at", { withTimezone: true })
//       .default(sql`CURRENT_TIMESTAMP`)
//       .notNull(),
//     updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
//       () => new Date()
//     ),
//   },
//   (example) => ({
//     nameIndex: index("name_idx").on(example.name),
//   })
// );



import { 
  integer,
  pgEnum,
  pgTableCreator, 
  timestamp,
  varchar,
  text,
  index,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

// Create table creator with prefix
export const createTable = pgTableCreator((name) => `getzilla_${name}`);

// Enums
export const statusEnum = pgEnum("getzilla_status", [
  "Backlog",
  "ToDo",
  "InProgress",
  "Review",
  "Hold",
  "Done",
]);

// Add role enum
export const roleEnum = pgEnum("getzilla_role", [
  "superuser",
  "admin",
  "manager",
  "worker",
  "external_worker",
  "consultant",
  "concierge",
]);

// Tables
export const users = createTable(
  "user",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    clerkId: varchar("clerkId", { length: 256 }).unique().notNull(),
    email: varchar("email", { length: 256 }).unique().notNull(),
    nickname: varchar("nickname", { length: 256 }),
    personalInfo: text("personal_info"),
    role: roleEnum("role").default("worker").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date()
    ),
  },
  (table) => ({
    clerkIdIndex: index("clerkId_idx").on(table.clerkId),
    emailIndex: index("email_idx").on(table.email),
    roleIndex: index("role_idx").on(table.role),
  })
);

export const parentTasks = createTable("parent_task", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  title: varchar("title", { length: 256 }).notNull(),
  description: text("description"),
  status: statusEnum("status").default("Backlog"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date()
  ),
  reporterId: integer("reporter_id").references(() => users.id),
}, (table) => ({
  titleIndex: index("parent_task_title_idx").on(table.title),
  statusIndex: index("parent_task_status_idx").on(table.status),
  reporterIndex: index("parent_task_reporter_idx").on(table.reporterId),
}));

export const tasks = createTable(
  "task",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    title: varchar("title", { length: 256 }).notNull(),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date()
    ),
    startDate: timestamp("start_date", { withTimezone: true }),
    dueDate: timestamp("due_date", { withTimezone: true }),
    status: statusEnum("status").default("Backlog"),
    label: varchar("label", { length: 256 }),
    reporterId: integer("reporter_id").references(() => users.id),
    parentTaskId: integer("parent_task_id").references(() => parentTasks.id),
  },
  (table) => ({
    titleIndex: index("title_idx").on(table.title),
    statusIndex: index("status_idx").on(table.status),
    reporterIndex: index("reporter_idx").on(table.reporterId),
  })
);

export const taskAssignees = createTable(
  "task_assignee",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    taskId: integer("task_id")
      .references(() => tasks.id, { onDelete: "cascade" })
      .notNull(),
    userId: integer("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    assignedAt: timestamp("assigned_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    assignedBy: integer("assigned_by").references(() => users.id),
  },
  (table) => ({
    taskUserIndex: index("task_user_idx").on(table.taskId, table.userId),
  })
);

export const taskAttachments = createTable(
  "task_attachment",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    taskId: integer("task_id")
      .references(() => tasks.id, { onDelete: "cascade" })
      .notNull(),
    name: varchar("name", { length: 256 }).notNull(),
    url: varchar("url", { length: 512 }).notNull(),
    metadata: text("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    taskIndex: index("task_idx").on(table.taskId),
  })
);

// Relations
export const userRelations = relations(users, ({ many }) => ({
  tasksWhereAssignee: many(taskAssignees, { relationName: "assignee" }),
  tasksWhereAssigner: many(taskAssignees, { relationName: "assigner" }),
  reportedTasks: many(tasks, { relationName: "reporter" }),
}));

export const parentTaskRelations = relations(parentTasks, ({ many, one }) => ({
  subtasks: many(tasks),
  reporter: one(users, {
    fields: [parentTasks.reporterId],
    references: [users.id],
  }),
}));

export const taskRelations = relations(tasks, ({ many, one }) => ({
  assignees: many(taskAssignees),
  attachments: many(taskAttachments),
  reporter: one(users, {
    fields: [tasks.reporterId],
    references: [users.id],
    relationName: "reporter",
  }),
  parentTask: one(parentTasks, {
    fields: [tasks.parentTaskId],
    references: [parentTasks.id],
  }),
}));

export const taskAssigneeRelations = relations(taskAssignees, ({ one }) => ({
  task: one(tasks, {
    fields: [taskAssignees.taskId],
    references: [tasks.id],
  }),
  assignee: one(users, {
    fields: [taskAssignees.userId],
    references: [users.id],
    relationName: "assignee",
  }),
  assigner: one(users, {
    fields: [taskAssignees.assignedBy],
    references: [users.id],
    relationName: "assigner",
  }),
}));

export const taskAttachmentRelations = relations(taskAttachments, ({ one }) => ({
  task: one(tasks, {
    fields: [taskAttachments.taskId],
    references: [tasks.id],
  }),
}));