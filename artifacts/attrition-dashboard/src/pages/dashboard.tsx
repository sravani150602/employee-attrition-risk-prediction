import { 
  useGetAnalyticsSummary, 
  useGetDepartmentBreakdown, 
  useGetRiskDistribution,
  useGetModelMetrics
} from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, AlertTriangle, TrendingUp, BrainCircuit, Activity } from "lucide-react";
import { 
  PieChart, Pie, Cell, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  LineChart, Line
} from "recharts";

const COLORS = {
  High: "hsl(var(--destructive))",
  Medium: "hsl(35, 92%, 53%)",
  Low: "hsl(142, 70%, 45%)"
};

export function Dashboard() {
  const { data: summary, isLoading: loadingSummary } = useGetAnalyticsSummary();
  const { data: deptBreakdown, isLoading: loadingDepts } = useGetDepartmentBreakdown();
  const { data: riskDist, isLoading: loadingRisk } = useGetRiskDistribution();
  const { data: modelMetrics, isLoading: loadingMetrics } = useGetModelMetrics();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Executive Dashboard</h1>
        <p className="text-muted-foreground font-mono text-sm">Real-time attrition risk telemetry</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard 
          title="Total Employees" 
          value={summary?.totalEmployees} 
          icon={Users} 
          loading={loadingSummary} 
        />
        <KpiCard 
          title="Avg Attrition Risk" 
          value={summary ? `${(summary.avgAttritionRisk * 100).toFixed(1)}%` : undefined} 
          icon={Activity} 
          loading={loadingSummary} 
          trend={summary?.avgAttritionRisk && summary.avgAttritionRisk > 0.3 ? "warning" : "good"}
        />
        <KpiCard 
          title="High Risk Assets" 
          value={summary?.highRiskCount} 
          icon={AlertTriangle} 
          loading={loadingSummary} 
          trend="bad"
          highlight
        />
        <KpiCard 
          title="Historical Attrition" 
          value={summary ? `${(summary.attritionRate * 100).toFixed(1)}%` : undefined} 
          icon={TrendingUp} 
          loading={loadingSummary} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Distribution */}
        <Card className="col-span-1 border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">Risk Distribution</CardTitle>
            <CardDescription>Current workforce risk stratification</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            {loadingRisk ? <Skeleton className="w-full h-full rounded-full" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskDist}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="riskLevel"
                    stroke="none"
                  >
                    {riskDist?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.riskLevel as keyof typeof COLORS] || "hsl(var(--primary))"} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Department Breakdown */}
        <Card className="col-span-1 lg:col-span-2 border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">Department Heatmap</CardTitle>
            <CardDescription>Average risk scores and historical attrition by department</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {loadingDepts ? <Skeleton className="w-full h-full" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptBreakdown} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="department" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="left" orientation="left" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${(val*100).toFixed(0)}%`} />
                  <RechartsTooltip 
                    cursor={{fill: 'hsl(var(--secondary))', opacity: 0.4}}
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
                    formatter={(val: number) => `${(val * 100).toFixed(1)}%`}
                  />
                  <Bar yAxisId="left" dataKey="avgRisk" name="Avg Risk" fill="hsl(35, 92%, 53%)" radius={[4, 4, 0, 0]} maxBarSize={50} />
                  <Bar yAxisId="left" dataKey="attritionRate" name="Historical Attrition" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Model Performance */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-primary" />
              Model Telemetry
            </CardTitle>
            <CardDescription>XGBoost Prediction Model Performance Metrics</CardDescription>
          </div>
          <div className="bg-primary/10 text-primary px-3 py-1 rounded-md text-xs font-mono font-medium">
            LIVE
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 pt-4">
            <Metric loading={loadingMetrics} label="Accuracy" value={modelMetrics?.accuracy} format="percent" />
            <Metric loading={loadingMetrics} label="F1 Score" value={modelMetrics?.f1Score} format="decimal" />
            <Metric loading={loadingMetrics} label="ROC-AUC" value={modelMetrics?.rocAuc} format="decimal" />
            <Metric loading={loadingMetrics} label="Precision" value={modelMetrics?.precision} format="percent" />
            <Metric loading={loadingMetrics} label="Recall" value={modelMetrics?.recall} format="percent" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function KpiCard({ title, value, icon: Icon, loading, highlight, trend }: { title: string, value?: string | number, icon: any, loading?: boolean, highlight?: boolean, trend?: "good" | "bad" | "warning" }) {
  return (
    <Card className={`relative overflow-hidden ${highlight ? 'border-destructive/50 shadow-[0_0_15px_rgba(239,68,68,0.15)]' : 'border-border/50'}`}>
      {highlight && <div className="absolute top-0 left-0 w-full h-1 bg-destructive" />}
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${highlight ? 'text-destructive' : 'text-muted-foreground'}`} />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <div className="text-2xl font-bold font-mono tracking-tight">{value !== undefined ? value : '--'}</div>
        )}
      </CardContent>
    </Card>
  );
}

function Metric({ label, value, format, loading }: { label: string, value?: number, format: "percent" | "decimal", loading?: boolean }) {
  if (loading || value === undefined) {
    return (
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground font-mono">{label}</p>
        <Skeleton className="h-6 w-16" />
      </div>
    );
  }
  
  const formatted = format === "percent" ? `${(value * 100).toFixed(1)}%` : value.toFixed(3);
  
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">{label}</p>
      <p className="text-xl font-bold font-mono text-foreground">{formatted}</p>
    </div>
  );
}