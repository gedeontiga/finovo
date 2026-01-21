import {
  pgTable,
  serial,
  text,
  decimal,
  integer,
  timestamp,
  uniqueIndex,
  boolean,
  index,
} from "drizzle-orm/pg-core";
import { relations, type Relations } from "drizzle-orm";

// --- Fiscal Years (Unchanged) ---
export const fiscalYears = pgTable("fiscal_years", {
  id: serial("id").primaryKey(),
  year: integer("year").notNull().unique(),
  name: text("name").notNull(), // Added name (e.g., "Budget 2024")
  isActive: boolean("is_active").default(true).notNull(),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// --- Programs (Unchanged) ---
export const programs = pgTable(
  "programs",
  {
    id: serial("id").primaryKey(),
    code: text("code").notNull(), // e.g., "116"
    name: text("name").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    codeIdx: uniqueIndex("program_code_idx").on(t.code),
  }),
);

// --- Actions (Unchanged) ---
export const actions = pgTable(
  "actions",
  {
    id: serial("id").primaryKey(),
    programId: integer("program_id")
      .references(() => programs.id, { onDelete: "cascade" })
      .notNull(),
    code: text("code").notNull(), // e.g., "01"
    name: text("name").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    programActionIdx: uniqueIndex("action_prog_code_idx").on(
      t.programId,
      t.code,
    ),
    programIdIdx: index("action_program_id_idx").on(t.programId),
  }),
);

// --- Activities (Unchanged) ---
export const activities = pgTable(
  "activities",
  {
    id: serial("id").primaryKey(),
    actionId: integer("action_id")
      .references(() => actions.id, { onDelete: "cascade" })
      .notNull(),
    code: text("code").notNull(), // e.g., "01" (Activités often have codes in your PDF)
    name: text("name").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    actionActivityIdx: uniqueIndex("activity_action_code_idx").on(
      t.actionId,
      t.code,
    ),
    actionIdIdx: index("activity_action_id_idx").on(t.actionId),
  }),
);

// --- NEW: Tasks (Tâches) ---
export const tasks = pgTable(
  "tasks",
  {
    id: serial("id").primaryKey(),
    activityId: integer("activity_id")
      .references(() => activities.id, { onDelete: "cascade" })
      .notNull(),
    name: text("name").notNull(), // Tasks in your PDF are mostly names, sometimes codes
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    // Unique constraint: A task name shouldn't repeat within the same activity
    activityTaskIdx: uniqueIndex("task_activity_name_idx").on(
      t.activityId,
      t.name,
    ),
    activityIdIdx: index("task_activity_id_idx").on(t.activityId),
  }),
);

// --- Admin Units (Unchanged) ---
export const adminUnits = pgTable(
  "admin_units",
  {
    id: serial("id").primaryKey(),
    code: text("code").notNull(), // e.g., "541127"
    name: text("name").notNull(),
    description: text("description"),
    parentId: integer("parent_id").references((): any => adminUnits.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    codeIdx: uniqueIndex("admin_code_idx").on(t.code),
    parentIdIdx: index("admin_parent_id_idx").on(t.parentId),
  }),
);

// --- Budget Lines (Updated Link) ---
export const budgetLines = pgTable(
  "budget_lines",
  {
    id: serial("id").primaryKey(),
    fiscalYearId: integer("fiscal_year_id")
      .references(() => fiscalYears.id, { onDelete: "restrict" })
      .notNull(),

    // CHANGED: Linked to Task instead of Activity
    taskId: integer("task_id")
      .references(() => tasks.id, { onDelete: "restrict" })
      .notNull(),

    adminUnitId: integer("admin_unit_id").references(() => adminUnits.id, {
      onDelete: "set null",
    }),

    paragraphCode: text("paragraph_code").notNull(), // 6 digits
    paragraphName: text("paragraph_name").notNull(),

    ae: decimal("ae", { precision: 20, scale: 2 }).default("0").notNull(),
    cp: decimal("cp", { precision: 20, scale: 2 }).default("0").notNull(),
    engaged: decimal("engaged", { precision: 20, scale: 2 })
      .default("0")
      .notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    createdBy: text("created_by"),
    updatedBy: text("updated_by"),
    deletedAt: timestamp("deleted_at"),
  },
  (t) => ({
    // Updated unique index to include taskId
    uniqueBudgetLine: uniqueIndex("budget_line_unique_idx").on(
      t.fiscalYearId,
      t.taskId,
      t.paragraphCode,
      t.adminUnitId,
    ),
    fiscalYearIdx: index("budget_fiscal_year_idx").on(t.fiscalYearId),
    taskIdx: index("budget_task_idx").on(t.taskId), // Index on new column
    adminUnitIdx: index("budget_admin_unit_idx").on(t.adminUnitId),
    paragraphIdx: index("budget_paragraph_idx").on(t.paragraphCode),
  }),
);

// --- Updated Relations ---

export const programsRelations = relations(programs, ({ many }) => ({
  actions: many(actions),
}));

export const actionsRelations = relations(actions, ({ one, many }) => ({
  program: one(programs, {
    fields: [actions.programId],
    references: [programs.id],
  }),
  activities: many(activities),
}));

export const activitiesRelations = relations(activities, ({ one, many }) => ({
  action: one(actions, {
    fields: [activities.actionId],
    references: [actions.id],
  }),
  tasks: many(tasks), // Activity has many Tasks
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  activity: one(activities, {
    fields: [tasks.activityId],
    references: [activities.id],
  }),
  budgetLines: many(budgetLines), // Task has many Budget Lines
}));

export const adminUnitsRelations = relations(adminUnits, ({ one, many }) => ({
  parent: one(adminUnits, {
    fields: [adminUnits.parentId],
    references: [adminUnits.id],
  }),
  children: many(adminUnits),
  budgetLines: many(budgetLines),
}));

export const fiscalYearsRelations = relations(fiscalYears, ({ many }) => ({
  budgetLines: many(budgetLines),
}));

export const budgetLinesRelations = relations(budgetLines, ({ one }) => ({
  fiscalYear: one(fiscalYears, {
    fields: [budgetLines.fiscalYearId],
    references: [fiscalYears.id],
  }),
  task: one(tasks, {
    // Renamed from activity to task
    fields: [budgetLines.taskId],
    references: [tasks.id],
  }),
  adminUnit: one(adminUnits, {
    fields: [budgetLines.adminUnitId],
    references: [adminUnits.id],
  }),
}));
