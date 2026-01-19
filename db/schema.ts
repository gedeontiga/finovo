import {
  pgTable,
  serial,
  text,
  decimal,
  integer,
  timestamp,
  uniqueIndex,
  boolean,
} from "drizzle-orm/pg-core";

// 1. Fiscal Year
export const fiscalYears = pgTable("fiscal_years", {
  id: serial("id").primaryKey(),
  year: integer("year").notNull().unique(), // e.g. 2023
  name: text("name"), // e.g. "Budget Initial"
  isActive: boolean("is_active").default(true),
});

// 2. Programs
export const programs = pgTable(
  "programs",
  {
    id: serial("id").primaryKey(),
    code: text("code").notNull(),
    name: text("name").notNull(),
  },
  (t) => ({
    unq: uniqueIndex("program_code_idx").on(t.code),
  }),
);

// 3. Actions
export const actions = pgTable(
  "actions",
  {
    id: serial("id").primaryKey(),
    programId: integer("program_id")
      .references(() => programs.id)
      .notNull(),
    code: text("code").notNull(),
    name: text("name").notNull(),
  },
  (t) => ({
    unq: uniqueIndex("action_prog_code_idx").on(t.programId, t.code),
  }),
);

// 4. Activities
export const activities = pgTable(
  "activities",
  {
    id: serial("id").primaryKey(),
    actionId: integer("action_id")
      .references(() => actions.id)
      .notNull(),
    code: text("code").notNull(),
    name: text("name").notNull(),
  },
  (t) => ({
    unq: uniqueIndex("activity_action_code_idx").on(t.actionId, t.code),
  }),
);

// 5. Admin Units
export const adminUnits = pgTable(
  "admin_units",
  {
    id: serial("id").primaryKey(),
    code: text("code").notNull(),
    name: text("name").notNull(),
  },
  (t) => ({
    unq: uniqueIndex("admin_code_idx").on(t.code),
  }),
);

// 6. Budget Lines
export const budgetLines = pgTable("budget_lines", {
  id: serial("id").primaryKey(),

  // Link to Fiscal Year (NEW)
  fiscalYearId: integer("fiscal_year_id").references(() => fiscalYears.id),

  activityId: integer("activity_id")
    .references(() => activities.id)
    .notNull(),
  adminUnitId: integer("admin_unit_id").references(() => adminUnits.id),

  paragraphCode: text("paragraph_code").notNull(),
  paragraphName: text("paragraph_name").notNull(),

  ae: decimal("ae", { precision: 20, scale: 2 }).default("0"),
  cp: decimal("cp", { precision: 20, scale: 2 }).default("0"),
  engaged: decimal("engaged", { precision: 20, scale: 2 }).default("0"),

  createdAt: timestamp("created_at").defaultNow(),
});
