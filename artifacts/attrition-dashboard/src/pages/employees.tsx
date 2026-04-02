import { useState } from "react";
import { Link } from "wouter";
import { useListEmployees } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { RiskBadge } from "@/components/ui/risk-badge";
import { Search, ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";

export function Employees() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState<string>("all");
  const [riskLevel, setRiskLevel] = useState<string>("all");

  const { data, isLoading } = useListEmployees({
    page,
    pageSize: 10,
    search: search || undefined,
    department: department !== "all" ? department : undefined,
    riskLevel: riskLevel !== "all" ? riskLevel : undefined,
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Employee Directory</h1>
          <p className="text-muted-foreground font-mono text-sm">Monitor and manage workforce risk</p>
        </div>
      </div>

      <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name or ID..." 
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9 bg-background"
            />
          </div>
          
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <Select value={department} onValueChange={(val) => { setDepartment(val); setPage(1); }}>
              <SelectTrigger className="w-full sm:w-[180px] bg-background">
                <SlidersHorizontal className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="Sales">Sales</SelectItem>
                <SelectItem value="Research & Development">Research & Development</SelectItem>
                <SelectItem value="Human Resources">Human Resources</SelectItem>
              </SelectContent>
            </Select>

            <Select value={riskLevel} onValueChange={(val) => { setRiskLevel(val); setPage(1); }}>
              <SelectTrigger className="w-full sm:w-[150px] bg-background">
                <SelectValue placeholder="Risk Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risks</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="border border-border rounded-md overflow-hidden bg-background">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Tenure</TableHead>
                <TableHead>Risk Score</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-10 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : data?.employees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    No employees found matching criteria.
                  </TableCell>
                </TableRow>
              ) : (
                data?.employees.map((emp) => (
                  <TableRow key={emp.id} className="group hover:bg-muted/20">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{emp.name}</span>
                        <span className="text-xs text-muted-foreground font-mono">{emp.employeeId}</span>
                      </div>
                    </TableCell>
                    <TableCell>{emp.department}</TableCell>
                    <TableCell>{emp.jobRole}</TableCell>
                    <TableCell>{emp.yearsAtCompany} yrs</TableCell>
                    <TableCell>
                      <RiskBadge level={emp.riskLevel} score={emp.attritionRisk} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/employees/${emp.id}`} className="inline-flex">
                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          View Profile
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between text-sm text-muted-foreground pt-2">
            <div>
              Showing {((data.page - 1) * data.pageSize) + 1} to {Math.min(data.page * data.pageSize, data.total)} of {data.total} entries
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || isLoading}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <div className="font-mono px-2">
                Page {page} of {data.totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                disabled={page === data.totalPages || isLoading}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}