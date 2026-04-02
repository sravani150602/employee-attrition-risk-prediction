import { pgTable, serial, text, integer, real, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const employeesTable = pgTable("employees", {
  id: serial("id").primaryKey(),
  employeeId: varchar("employee_id", { length: 20 }).notNull().unique(),
  name: text("name").notNull(),
  age: integer("age").notNull(),
  department: text("department").notNull(),
  jobRole: text("job_role").notNull(),
  gender: text("gender").notNull(),
  maritalStatus: text("marital_status").notNull(),
  education: integer("education").notNull(),
  yearsAtCompany: real("years_at_company").notNull(),
  totalWorkingYears: real("total_working_years").notNull(),
  yearsInCurrentRole: real("years_in_current_role").notNull(),
  yearsSinceLastPromotion: real("years_since_last_promotion").notNull(),
  numCompaniesWorked: integer("num_companies_worked").notNull(),
  monthlyIncome: real("monthly_income").notNull(),
  stockOptionLevel: integer("stock_option_level").notNull(),
  trainingTimesLastYear: integer("training_times_last_year").notNull(),
  distanceFromHome: integer("distance_from_home").notNull(),
  jobSatisfaction: integer("job_satisfaction").notNull(),
  workLifeBalance: integer("work_life_balance").notNull(),
  environmentSatisfaction: integer("environment_satisfaction").notNull(),
  jobInvolvement: integer("job_involvement").notNull(),
  performanceRating: integer("performance_rating").notNull(),
  overTime: boolean("over_time").notNull().default(false),
  attrited: boolean("attrited").notNull().default(false),
  attritionRisk: real("attrition_risk").notNull().default(0),
  riskLevel: text("risk_level").notNull().default("Low"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertEmployeeSchema = createInsertSchema(employeesTable).omit({ id: true, createdAt: true });
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type Employee = typeof employeesTable.$inferSelect;

export const modelMetricsTable = pgTable("model_metrics", {
  id: serial("id").primaryKey(),
  accuracy: real("accuracy").notNull(),
  f1Score: real("f1_score").notNull(),
  rocAuc: real("roc_auc").notNull(),
  precision: real("precision").notNull(),
  recall: real("recall").notNull(),
  cvMean: real("cv_mean").notNull(),
  cvStd: real("cv_std").notNull(),
  trainSize: integer("train_size").notNull(),
  testSize: integer("test_size").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const featureImportanceTable = pgTable("feature_importance", {
  id: serial("id").primaryKey(),
  feature: text("feature").notNull(),
  importance: real("importance").notNull(),
  direction: text("direction").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
