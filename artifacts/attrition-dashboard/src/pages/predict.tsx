import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRunPrediction } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { RiskBadge } from "@/components/ui/risk-badge";
import { Calculator, ArrowRight, Loader2, RefreshCcw } from "lucide-react";

// Schema matching the API's PredictionInput
const formSchema = z.object({
  age: z.coerce.number().min(18).max(100),
  monthlyIncome: z.coerce.number().min(1000),
  yearsAtCompany: z.coerce.number().min(0).max(50),
  jobSatisfaction: z.coerce.number().min(1).max(4),
  workLifeBalance: z.coerce.number().min(1).max(4),
  overTime: z.boolean().default(false),
  distanceFromHome: z.coerce.number().min(1).max(100),
  numCompaniesWorked: z.coerce.number().min(0).max(20),
  totalWorkingYears: z.coerce.number().min(0).max(50),
  yearsInCurrentRole: z.coerce.number().min(0).max(50),
  yearsSinceLastPromotion: z.coerce.number().min(0).max(50),
  environmentSatisfaction: z.coerce.number().min(1).max(4),
  jobInvolvement: z.coerce.number().min(1).max(4),
  performanceRating: z.coerce.number().min(1).max(4),
  stockOptionLevel: z.coerce.number().min(0).max(3),
  trainingTimesLastYear: z.coerce.number().min(0).max(10)
});

type FormValues = z.infer<typeof formSchema>;

export function Predictor() {
  const predictMutation = useRunPrediction();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: 35,
      monthlyIncome: 6500,
      yearsAtCompany: 5,
      jobSatisfaction: 3,
      workLifeBalance: 3,
      overTime: false,
      distanceFromHome: 10,
      numCompaniesWorked: 2,
      totalWorkingYears: 10,
      yearsInCurrentRole: 3,
      yearsSinceLastPromotion: 1,
      environmentSatisfaction: 3,
      jobInvolvement: 3,
      performanceRating: 3,
      stockOptionLevel: 1,
      trainingTimesLastYear: 2
    },
  });

  const onSubmit = (data: FormValues) => {
    predictMutation.mutate({ data });
  };

  const handleReset = () => {
    form.reset();
    predictMutation.reset();
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Risk Predictor</h1>
        <p className="text-muted-foreground font-mono text-sm">Run live inference on hypothetical or candidate profiles</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-primary" />
                Input Parameters
              </CardTitle>
              <CardDescription>
                Configure the feature vectors to run against the XGBoost model.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  
                  {/* Demographics & Compensation */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b border-border pb-2">Profile & Compensation</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField control={form.control} name="age" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Age</FormLabel>
                          <FormControl><Input type="number" {...field} className="bg-background" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="monthlyIncome" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Monthly Income ($)</FormLabel>
                          <FormControl><Input type="number" {...field} className="bg-background" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="distanceFromHome" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Distance From Home (miles)</FormLabel>
                          <FormControl><Input type="number" {...field} className="bg-background" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="stockOptionLevel" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Stock Option Level (0-3)</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                            <FormControl><SelectTrigger className="bg-background"><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                              {[0,1,2,3].map(v => <SelectItem key={v} value={String(v)}>{v}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                  </div>

                  {/* Tenure & Experience */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b border-border pb-2">Tenure & Experience</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField control={form.control} name="totalWorkingYears" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Total Experience</FormLabel>
                          <FormControl><Input type="number" {...field} className="bg-background" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="yearsAtCompany" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Years at Company</FormLabel>
                          <FormControl><Input type="number" {...field} className="bg-background" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="numCompaniesWorked" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prior Companies</FormLabel>
                          <FormControl><Input type="number" {...field} className="bg-background" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="yearsInCurrentRole" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Years in Role</FormLabel>
                          <FormControl><Input type="number" {...field} className="bg-background" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="yearsSinceLastPromotion" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Years Since Promo</FormLabel>
                          <FormControl><Input type="number" {...field} className="bg-background" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="trainingTimesLastYear" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Training (Last Yr)</FormLabel>
                          <FormControl><Input type="number" {...field} className="bg-background" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                  </div>

                  {/* Satisfaction & Work Style */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b border-border pb-2">Satisfaction & Work Style</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField control={form.control} name="jobSatisfaction" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Job Satisfaction (1-4)</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                            <FormControl><SelectTrigger className="bg-background"><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                              {[1,2,3,4].map(v => <SelectItem key={v} value={String(v)}>{v}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="environmentSatisfaction" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Environment Satisfaction (1-4)</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                            <FormControl><SelectTrigger className="bg-background"><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                              {[1,2,3,4].map(v => <SelectItem key={v} value={String(v)}>{v}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="workLifeBalance" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Work/Life Balance (1-4)</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                            <FormControl><SelectTrigger className="bg-background"><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                              {[1,2,3,4].map(v => <SelectItem key={v} value={String(v)}>{v}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                       <FormField control={form.control} name="performanceRating" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Performance Rating (1-4)</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                            <FormControl><SelectTrigger className="bg-background"><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                              {[1,2,3,4].map(v => <SelectItem key={v} value={String(v)}>{v}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="jobInvolvement" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Job Involvement (1-4)</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                            <FormControl><SelectTrigger className="bg-background"><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                              {[1,2,3,4].map(v => <SelectItem key={v} value={String(v)}>{v}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="overTime" render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-3 shadow-sm bg-background">
                          <div className="space-y-0.5">
                            <FormLabel>OverTime</FormLabel>
                            <FormDescription className="text-xs">Regularly works overtime</FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )} />
                    </div>
                  </div>

                  <div className="flex justify-end gap-4 pt-4 border-t border-border">
                    <Button type="button" variant="ghost" onClick={handleReset}>
                      <RefreshCcw className="w-4 h-4 mr-2" /> Reset
                    </Button>
                    <Button type="submit" disabled={predictMutation.isPending} className="bg-primary text-primary-foreground hover:bg-primary/90">
                      {predictMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Calculator className="w-4 h-4 mr-2" />}
                      Run Prediction
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-8 space-y-6">
            <Card className={`border-border/50 transition-all duration-500 ${predictMutation.isSuccess ? 'shadow-[0_0_20px_rgba(239,68,68,0.1)] border-primary/50 bg-card/80' : 'bg-card/30'}`}>
              <CardHeader>
                <CardTitle>Inference Result</CardTitle>
              </CardHeader>
              <CardContent>
                {!predictMutation.isSuccess ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground border border-dashed border-border rounded-lg">
                    <ArrowRight className="w-8 h-8 mb-2 opacity-50" />
                    <p className="text-sm">Submit parameters to<br/>generate prediction</p>
                  </div>
                ) : (
                  <div className="space-y-6 animate-in zoom-in-95 duration-300">
                    <div className="text-center space-y-2 pb-6 border-b border-border">
                      <p className="text-sm font-mono text-muted-foreground uppercase tracking-wider">Calculated Risk Score</p>
                      <div className="text-6xl font-bold font-mono tracking-tighter">
                        {(predictMutation.data.attritionRisk * 100).toFixed(1)}<span className="text-2xl text-muted-foreground">%</span>
                      </div>
                      <div className="pt-2">
                        <RiskBadge level={predictMutation.data.riskLevel} />
                      </div>
                    </div>

                    <div className="space-y-4 pt-2">
                      <h4 className="text-sm font-medium">Primary Drivers</h4>
                      <div className="space-y-3">
                        {predictMutation.data.topFactors.slice(0, 4).map((factor, i) => (
                          <div key={i} className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{factor.feature.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim()}</span>
                            <span className={`font-mono ${factor.direction === 'positive' ? 'text-destructive' : 'text-green-500'}`}>
                              {factor.direction === 'positive' ? '+' : '-'}{(factor.importance * 100).toFixed(1)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}