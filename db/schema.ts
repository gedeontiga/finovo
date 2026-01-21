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

// ============================================================================
// IMPROVED SCHEMA FOR 3NF COMPLIANCE AND ACID PRINCIPLES
// ============================================================================

/**
 * Fiscal Years - Master table for budget periods
 * Each fiscal year represents a distinct budget cycle
 */
export const fiscalYears = pgTable("fiscal_years", {
  id: serial("id").primaryKey(),
  year: integer("year").notNull().unique(),
  name: text("name").notNull(), // e.g., "Budget Initial 2024"
  isActive: boolean("is_active").default(true).notNull(),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Programs - Top level of budget hierarchy
 * Unique by code within the entire system
 */
export const programs = pgTable(
  "programs",
  {
    id: serial("id").primaryKey(),
    code: text("code").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    codeIdx: uniqueIndex("program_code_idx").on(t.code),
  }),
);

/**
 * Actions - Second level of budget hierarchy
 * Unique by (programId, code) combination
 */
export const actions = pgTable(
  "actions",
  {
    id: serial("id").primaryKey(),
    programId: integer("program_id")
      .references(() => programs.id, { onDelete: "cascade" })
      .notNull(),
    code: text("code").notNull(),
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

/**
 * Activities - Third level of budget hierarchy
 * Unique by (actionId, code) combination
 */
export const activities = pgTable(
  "activities",
  {
    id: serial("id").primaryKey(),
    actionId: integer("action_id")
      .references(() => actions.id, { onDelete: "cascade" })
      .notNull(),
    code: text("code").notNull(),
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

/**
 * Administrative Units - Organizational units managing budgets
 * Unique by code
 */
export const adminUnits = pgTable(
  "admin_units",
  {
    id: serial("id").primaryKey(),
    code: text("code").notNull(),
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

/**
 * Budget Lines - Detailed budget allocations
 * Core transactional table with ACID compliance
 *
 * ACID Compliance:
 * - Atomicity: All inserts/updates are transactional
 * - Consistency: Foreign keys + constraints ensure data integrity
 * - Isolation: Handled by database transaction levels
 * - Durability: PostgreSQL ensures committed data is persistent
 */
export const budgetLines = pgTable(
  "budget_lines",
  {
    id: serial("id").primaryKey(),

    // Foreign Keys - Required for 3NF
    fiscalYearId: integer("fiscal_year_id")
      .references(() => fiscalYears.id, { onDelete: "restrict" })
      .notNull(), // Made NOT NULL for data integrity
    activityId: integer("activity_id")
      .references(() => activities.id, { onDelete: "restrict" })
      .notNull(),
    adminUnitId: integer("admin_unit_id").references(() => adminUnits.id, {
      onDelete: "set null",
    }),

    // Budget classification
    paragraphCode: text("paragraph_code").notNull(),
    paragraphName: text("paragraph_name").notNull(),

    // Financial amounts - Using DECIMAL for precision
    ae: decimal("ae", { precision: 20, scale: 2 }).default("0").notNull(),
    cp: decimal("cp", { precision: 20, scale: 2 }).default("0").notNull(),
    engaged: decimal("engaged", { precision: 20, scale: 2 })
      .default("0")
      .notNull(),

    // Audit fields
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    createdBy: text("created_by"),
    updatedBy: text("updated_by"),

    // Soft delete support
    deletedAt: timestamp("deleted_at"),
  },
  (t) => ({
    // Composite unique constraint for business logic
    // One budget line per fiscal year + activity + paragraph + admin unit
    uniqueBudgetLine: uniqueIndex("budget_line_unique_idx").on(
      t.fiscalYearId,
      t.activityId,
      t.paragraphCode,
      t.adminUnitId,
    ),

    // Indexes for query performance
    fiscalYearIdx: index("budget_fiscal_year_idx").on(t.fiscalYearId),
    activityIdx: index("budget_activity_idx").on(t.activityId),
    adminUnitIdx: index("budget_admin_unit_idx").on(t.adminUnitId),
    paragraphIdx: index("budget_paragraph_idx").on(t.paragraphCode),

    // Index for soft delete queries
    deletedAtIdx: index("budget_deleted_at_idx").on(t.deletedAt),
  }),
);

// ============================================================================
// RELATIONS FOR ORM QUERYING
// ============================================================================

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
  budgetLines: many(budgetLines),
}));

export const adminUnitsRelations: Relations<any, any> = relations(
  adminUnits,
  ({ one, many }) => ({
    parent: one(adminUnits, {
      fields: [adminUnits.parentId],
      references: [adminUnits.id],
    }),
    children: many(adminUnits),
    budgetLines: many(budgetLines),
  }),
);

export const fiscalYearsRelations = relations(fiscalYears, ({ many }) => ({
  budgetLines: many(budgetLines),
}));

export const budgetLinesRelations = relations(budgetLines, ({ one }) => ({
  fiscalYear: one(fiscalYears, {
    fields: [budgetLines.fiscalYearId],
    references: [fiscalYears.id],
  }),
  activity: one(activities, {
    fields: [budgetLines.activityId],
    references: [activities.id],
  }),
  adminUnit: one(adminUnits, {
    fields: [budgetLines.adminUnitId],
    references: [adminUnits.id],
  }),
}));
