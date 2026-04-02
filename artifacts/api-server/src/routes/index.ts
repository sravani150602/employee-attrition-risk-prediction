import { Router, type IRouter } from "express";
import healthRouter from "./health";
import employeesRouter from "./employees";
import analyticsRouter from "./analytics";
import predictionsRouter from "./predictions";

const router: IRouter = Router();

router.use(healthRouter);
router.use(employeesRouter);
router.use(analyticsRouter);
router.use(predictionsRouter);

export default router;
