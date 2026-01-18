import {
  pgTable,
  serial,
  text,
  decimal,
  integer,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// --- TABLES ---

export const fiscalYears = pgTable("fiscal_years", {
  id: serial("id").primaryKey(),
  year: integer("year").notNull().unique(),
  isActive: boolean("is_active").default(true),
});

export const programs = pgTable("programs", {
  id: serial("id").primaryKey(),
  code: text("code").notNull(),
  name: text("name").notNull(),
  fiscalYearId: integer("fiscal_year_id").references(() => fiscalYears.id),
});

export const actions = pgTable("actions", {
  id: serial("id").primaryKey(),
  programId: integer("program_id").references(() => programs.id),
  code: text("code"),
  name: text("name").notNull(),
});

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  actionId: integer("action_id").references(() => actions.id),
  code: text("code"),
  name: text("name").notNull(),
  administrativeUnit: text("admin_unit"),
});

export const budgetLines = pgTable("budget_lines", {
  id: serial("id").primaryKey(),
  activityId: integer("activity_id").references(() => activities.id),
  paragraphCode: text("paragraph_code").notNull(),
  paragraphName: text("paragraph_name").notNull(),
  ae: decimal("ae", { precision: 20, scale: 2 }).default("0"),
  cp: decimal("cp", { precision: 20, scale: 2 }).default("0"),
  committed: decimal("committed", { precision: 20, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow(),
});

// --- RELATIONS (Fixed) ---

export const programsRelations = relations(programs, ({ many }) => ({
  actions: many(actions),
}));

export const actionsRelations = relations(actions, ({ one, many }) => ({
  // FIX: Destructure 'one' and 'many' from the callback argument
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

export const budgetLinesRelations = relations(budgetLines, ({ one }) => ({
  activity: one(activities, {
    fields: [budgetLines.activityId],
    references: [activities.id],
  }),
}));
