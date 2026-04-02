import { Router, type IRouter } from "express";
import { eq, ilike, and, sql, desc, or } from "drizzle-orm";
import { db, employeesTable } from "@workspace/db";
import {
  ListEmployeesQueryParams,
  GetEmployeeParams,
  ListEmployeesResponse,
  GetEmployeeResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/employees", async (req, res): Promise<void> => {
  const parsed = ListEmployeesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { page, pageSize, department, riskLevel, search } = parsed.data;
  const safePage = Math.max(1, page ?? 1);
  const safePageSize = Math.min(100, Math.max(1, pageSize ?? 20));
  const offset = (safePage - 1) * safePageSize;

  const conditions = [];

  if (department) {
    conditions.push(eq(employeesTable.department, department));
  }
  if (riskLevel) {
    conditions.push(eq(employeesTable.riskLevel, riskLevel));
  }
  if (search) {
    conditions.push(
      or(
        ilike(employeesTable.name, `%${search}%`),
        ilike(employeesTable.employeeId, `%${search}%`),
        ilike(employeesTable.jobRole, `%${search}%`),
      )
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [employees, countResult] = await Promise.all([
    db
      .select({
        id: employeesTable.id,
        employeeId: employeesTable.employeeId,
        name: employeesTable.name,
        age: employeesTable.age,
        department: employeesTable.department,
        jobRole: employeesTable.jobRole,
        yearsAtCompany: employeesTable.yearsAtCompany,
        monthlyIncome: employeesTable.monthlyIncome,
        attritionRisk: employeesTable.attritionRisk,
        riskLevel: employeesTable.riskLevel,
        attrited: employeesTable.attrited,
        jobSatisfaction: employeesTable.jobSatisfaction,
        workLifeBalance: employeesTable.workLifeBalance,
        overTime: employeesTable.overTime,
      })
      .from(employeesTable)
      .where(whereClause)
      .orderBy(desc(employeesTable.attritionRisk))
      .limit(safePageSize)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(employeesTable)
      .where(whereClause),
  ]);

  const total = countResult[0]?.count ?? 0;
  const totalPages = Math.ceil(total / safePageSize);

  const response = ListEmployeesResponse.parse({
    employees,
    total,
    page: safePage,
    pageSize: safePageSize,
    totalPages,
  });

  res.json(response);
});

router.get("/employees/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);

  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid employee id" });
    return;
  }

  const [employee] = await db
    .select()
    .from(employeesTable)
    .where(eq(employeesTable.id, id));

  if (!employee) {
    res.status(404).json({ error: "Employee not found" });
    return;
  }

  res.json(GetEmployeeResponse.parse(employee));
});

export default router;
