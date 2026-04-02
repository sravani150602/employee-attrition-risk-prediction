import { useRoute } from "wouter";
import { useGetEmployee, getGetEmployeeQueryKey, useGetFeatureImportance } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { RiskBadge } from "@/components/ui/risk-badge";
import { ArrowLeft, User, Briefcase, Wallet, Building, Calendar, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, ReferenceLine
} from "recharts";

export function EmployeeProfile() {
  const [, params] = useRoute("/employees/:id");
  const employeeId = Number(params?.id);

  const { data: employee, isLoading } = useGetEmployee(employeeId, {
    query: {
      enabled: !!employeeId && !isNaN(employeeId),
      queryKey: getGetEmployeeQueryKey(employeeId)
    }
  });

  const { data: features, isLoading: loadingFeatures } = useGetFeatureImportance();

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (!employee) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4 text-muted-foreground">
        <AlertCircle size={48} className="text-muted-foreground/50" />
        <h2 className="text-xl font-medium">Employee Not Found</h2>
        <Link href="/employees">
          <Button variant="outline">Back to Directory</Button>
        </Link>
      </div>
    );
  }

  // Calculate generic top factors for this employee based on overall feature importance
  // In a real app, this might come directly from the employee endpoint 
  const topFactors = features?.slice(0, 5) || [];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Link href="/employees" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-2">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Directory
      </Link>

      {/* Header Profile Card */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden relative">
        {employee.attrited && (
          <div className="absolute top-4 right-4 z-10">
            <Badge variant="destructive" className="uppercase font-mono tracking-wider">Attrited</Badge>
          </div>
        )}
        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5">
            <div className="p-8 md:col-span-2 lg:col-span-3 flex flex-col justify-center border-b md:border-b-0 md:border-r border-border/50">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground text-2xl font-bold flex-shrink-0">
                  {employee.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                </div>
                <div className="space-y-1">
                  <h1 className="text-3xl font-bold tracking-tight">{employee.name}</h1>
                  <p className="text-muted-foreground font-mono">{employee.employeeId} • {employee.jobRole}</p>
                  <div className="pt-2 flex gap-2">
                    <Badge variant="outline">{employee.department}</Badge>
                    <Badge variant="outline">{employee.yearsAtCompany} yrs tenure</Badge>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-8 md:col-span-2 flex items-center justify-center bg-background/30">
              <div className="text-center space-y-2">
                <p className="text-sm font-mono text-muted-foreground uppercase tracking-wider">Attrition Risk</p>
                <div className="flex flex-col items-center justify-center relative w-32 h-32 mx-auto">
                   <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                    <circle
                      cx="50" cy="50" r="45"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      className="text-muted/30"
                    />
                    <circle
                      cx="50" cy="50" r="45"
                      fill="none"
                      stroke={employee.riskLevel === 'High' ? "hsl(var(--destructive))" : employee.riskLevel === 'Medium' ? "hsl(35, 92%, 53%)" : "hsl(142, 70%, 45%)"}
                      strokeWidth="8"
                      strokeDasharray={`${employee.attritionRisk * 283} 283`}
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold font-mono">{(employee.attritionRisk * 100).toFixed(0)}</span>
                  </div>
                </div>
                <RiskBadge level={employee.riskLevel} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Detail Cards */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
                  <Briefcase className="h-4 w-4" /> Professional Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <DetailRow label="Department" value={employee.department} />
                <DetailRow label="Role" value={employee.jobRole} />
                <DetailRow label="Total Working Years" value={employee.totalWorkingYears} />
                <DetailRow label="Years in Current Role" value={employee.yearsInCurrentRole} />
                <DetailRow label="Years Since Promotion" value={employee.yearsSinceLastPromotion} />
                <DetailRow label="Num Companies Worked" value={employee.numCompaniesWorked} />
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
                  <User className="h-4 w-4" /> Personal Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <DetailRow label="Age" value={employee.age} />
                <DetailRow label="Gender" value={employee.gender} />
                <DetailRow label="Marital Status" value={employee.maritalStatus} />
                <DetailRow label="Education Level" value={employee.education} />
                <DetailRow label="Distance From Home" value={`${employee.distanceFromHome} miles`} />
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
                <Wallet className="h-4 w-4" /> Compensation & Satisfaction
              </CardTitle>
            </CardHeader>
            <CardContent>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-mono text-muted-foreground uppercase">Monthly Income</p>
                  <p className="text-xl font-bold font-mono">${employee.monthlyIncome.toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-mono text-muted-foreground uppercase">Stock Option Level</p>
                  <p className="text-xl font-bold font-mono">{employee.stockOptionLevel}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-mono text-muted-foreground uppercase">Over Time</p>
                  <p className="text-xl font-bold font-mono text-primary">{employee.overTime ? "Yes" : "No"}</p>
                </div>
               </div>

               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 mt-6 border-t border-border/50">
                <ScoreMetric label="Job Satisfaction" score={employee.jobSatisfaction} max={4} />
                <ScoreMetric label="Work/Life Balance" score={employee.workLifeBalance} max={4} />
                <ScoreMetric label="Environment" score={employee.environmentSatisfaction} max={4} />
                <ScoreMetric label="Performance" score={employee.performanceRating} max={4} />
               </div>
            </CardContent>
          </Card>
        </div>

        {/* Key Drivers */}
        <div className="lg:col-span-1">
          <Card className="h-full border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Top Risk Factors</CardTitle>
              <CardDescription>Features driving the prediction model</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingFeatures ? (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : (
                <div className="space-y-6">
                  {topFactors.map((factor, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between items-end text-sm">
                        <span className="font-medium">{formatFeatureName(factor.feature)}</span>
                        <span className={factor.direction === 'positive' ? 'text-destructive font-mono' : 'text-green-500 font-mono'}>
                          {factor.direction === 'positive' ? 'Increases Risk' : 'Decreases Risk'}
                        </span>
                      </div>
                      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${factor.direction === 'positive' ? 'bg-destructive' : 'bg-green-500'}`}
                          style={{ width: `${Math.min(factor.importance * 300, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string, value: string | number }) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

function ScoreMetric({ label, score, max }: { label: string, score: number, max: number }) {
  return (
    <div className="space-y-1 text-center">
      <p className="text-xs font-mono text-muted-foreground h-8 flex items-end justify-center">{label}</p>
      <div className="flex items-center justify-center gap-1 pt-1">
        {Array.from({ length: max }).map((_, i) => (
          <div 
            key={i} 
            className={`h-2 w-full rounded-sm ${i < score ? 'bg-primary' : 'bg-secondary'}`} 
          />
        ))}
      </div>
      <p className="text-xs font-bold pt-1">{score} / {max}</p>
    </div>
  );
}

function formatFeatureName(name: string) {
  return name
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-48 w-full" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
           <Skeleton className="h-64 w-full" />
           <Skeleton className="h-64 w-full" />
        </div>
        <Skeleton className="h-[500px] w-full" />
      </div>
    </div>
  );
}

import { Button } from "@/components/ui/button";