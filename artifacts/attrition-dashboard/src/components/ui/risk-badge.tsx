import { Badge } from "@/components/ui/badge";

export function RiskBadge({ level, score }: { level: string; score?: number }) {
  let variant: "default" | "destructive" | "secondary" | "outline" = "default";
  let classes = "";
  
  const normalizedLevel = level.toLowerCase();

  if (normalizedLevel === "high") {
    variant = "destructive";
    classes = "bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20";
  } else if (normalizedLevel === "medium") {
    variant = "secondary";
    classes = "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20";
  } else if (normalizedLevel === "low") {
    variant = "outline";
    classes = "bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20";
  }

  return (
    <Badge variant={variant} className={`font-mono uppercase tracking-wider text-[10px] px-2 py-0.5 ${classes}`}>
      {level} {score !== undefined && `(${(score * 100).toFixed(0)}%)`}
    </Badge>
  );
}