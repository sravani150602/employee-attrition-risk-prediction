import { Router, type IRouter } from "express";
import { sql, eq } from "drizzle-orm";
import { db, employeesTable, modelMetricsTable, featureImportanceTable } from "@workspace/db";
import {
  GetAnalyticsSummaryResponse,
  GetFeatureImportanceResponse,
  GetDepartmentBreakdownResponse,
  GetRiskDistributionResponse,
  GetModelMetricsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/analytics/summary", async (req, res): Promise<void> => {
  const [stats] = await db
    .select({
      totalEmployees: sql<number>`count(*)::int`,
      attritionCount: sql<number>`sum(case when attrited then 1 else 0 end)::int`,
      attritionRate: sql<number>`round(avg(case when attrited then 1.0 else 0.0 end)::numeric, 4)::float`,
      highRiskCount: sql<number>`sum(case when risk_level = 'High' then 1 else 0 end)::int`,
      mediumRiskCount: sql<number>`sum(case when risk_level = 'Medium' then 1 else 0 end)::int`,
      lowRiskCount: sql<number>`sum(case when risk_level = 'Low' then 1 else 0 end)::int`,
      avgAttritionRisk: sql<number>`round(avg(attrition_risk)::numeric, 4)::float`,
      avgMonthlyIncome: sql<number>`round(avg(monthly_income)::numeric, 2)::float`,
      avgYearsAtCompany: sql<number>`round(avg(years_at_company)::numeric, 2)::float`,
    })
    .from(employeesTable);

  res.json(GetAnalyticsSummaryResponse.parse(stats));
});

router.get("/analytics/feature-importance", async (req, res): Promise<void> => {
  const features = await db
    .select({
      feature: featureImportanceTable.feature,
      importance: featureImportanceTable.importance,
      direction: featureImportanceTable.direction,
    })
    .from(featureImportanceTable)
    .orderBy(sql`importance desc`);

  res.json(GetFeatureImportanceResponse.parse(features));
});

router.get("/analytics/department-breakdown", async (req, res): Promise<void> => {
  const breakdown = await db
    .select({
      department: employeesTable.department,
      total: sql<number>`count(*)::int`,
      attrited: sql<number>`sum(case when attrited then 1 else 0 end)::int`,
      highRisk: sql<number>`sum(case when risk_level = 'High' then 1 else 0 end)::int`,
      attritionRate: sql<number>`round(avg(case when attrited then 1.0 else 0.0 end)::numeric, 4)::float`,
      avgRisk: sql<number>`round(avg(attrition_risk)::numeric, 4)::float`,
    })
    .from(employeesTable)
    .groupBy(employeesTable.department)
    .orderBy(sql`round(avg(case when attrited then 1.0 else 0.0 end)::numeric, 4)::float desc`);

  res.json(GetDepartmentBreakdownResponse.parse(breakdown));
});

router.get("/analytics/risk-distribution", async (req, res): Promise<void> => {
  const [totalResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(employeesTable);

  const total = totalResult?.count ?? 0;

  const dist = await db
    .select({
      riskLevel: employeesTable.riskLevel,
      count: sql<number>`count(*)::int`,
    })
    .from(employeesTable)
    .groupBy(employeesTable.riskLevel);

  const result = dist.map((row) => ({
    riskLevel: row.riskLevel,
    count: row.count,
    percentage: total > 0 ? parseFloat(((row.count / total) * 100).toFixed(2)) : 0,
  }));

  res.json(GetRiskDistributionResponse.parse(result));
});

router.get("/analytics/model-metrics", async (req, res): Promise<void> => {
  const [metrics] = await db
    .select()
    .from(modelMetricsTable)
    .orderBy(sql`created_at desc`)
    .limit(1);

  if (!metrics) {
    res.status(404).json({ error: "No model metrics found. Run the ML pipeline first." });
    return;
  }

  res.json(GetModelMetricsResponse.parse({
    accuracy: metrics.accuracy,
    f1Score: metrics.f1Score,
    rocAuc: metrics.rocAuc,
    precision: metrics.precision,
    recall: metrics.recall,
    cvMean: metrics.cvMean,
    cvStd: metrics.cvStd,
    trainSize: metrics.trainSize,
    testSize: metrics.testSize,
  }));
});

export default router;
