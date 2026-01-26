"use client";

import { Label, Pie, PieChart, ResponsiveContainer } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface EngagementPieChartProps {
  totalAE: number;
  totalEngaged: number;
  programCode?: string;
  programName?: string;
}

export function EngagementPieChart({
  totalAE,
  totalEngaged,
  programCode,
  programName,
}: EngagementPieChartProps) {
  const available = Math.max(0, totalAE - totalEngaged);

  const chartData = [
    {
      name: "Engaged",
      value: totalEngaged,
      fill: "#fe9a00",
    },
    {
      name: "Available",
      value: available,
      fill: "#1449e6",
    },
  ];

  const chartConfig: ChartConfig = {
    value: {
      label: "Amount (FCFA)",
    },
    engaged: {
      label: "Engaged",
      color: "#fe9a00",
    },
    available: {
      label: "Available",
      color: "#1449e6",
    },
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("fr-FR", {
      notation: "compact",
      compactDisplay: "short",
      maximumFractionDigits: 1,
    }).format(value);

  const executionRate = totalAE > 0 ? (totalEngaged / totalAE) * 100 : 0;

  if (totalAE === 0) {
    return (
      <Card className="border-border/50 h-full flex flex-col">
        <CardHeader className="px-3 py-3 sm:px-6 sm:py-4 shrink-0">
          <CardTitle className="text-sm sm:text-base flex flex-col gap-1">
            <span className="truncate">Budget Execution Overview</span>
            {programCode && (
              <span className="text-xs font-normal text-muted-foreground truncate">
                {programCode}
              </span>
            )}
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm truncate">
            {programName || "Distribution of authorized budget"}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-3 pb-3 sm:px-6 sm:pb-4 flex-1 flex items-center justify-center">
          <div className="text-center text-muted-foreground text-xs sm:text-sm">
            No budget data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 h-full flex flex-col">
      <CardHeader className="px-3 py-3 sm:px-6 sm:py-4 shrink-0">
        <CardTitle className="text-sm sm:text-base flex flex-col gap-1">
          <div className="flex items-start justify-between gap-2">
            <span className="truncate flex-1">Budget Execution Overview</span>
            <span
              className={`text-xs sm:text-sm font-normal whitespace-nowrap shrink-0 ${
                executionRate > 95
                  ? "text-red-600 dark:text-red-400"
                  : executionRate > 90
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-green-600 dark:text-green-400"
              }`}
            >
              {executionRate.toFixed(1)}%
            </span>
          </div>
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm line-clamp-2">
          {programCode
            ? `${programCode} - ${programName || "Program Budget"}`
            : "Distribution of authorized budget"}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 pb-3 sm:px-6 sm:pb-4 flex-1 flex flex-col min-h-0">
        <div className="w-full flex-1 min-h-0 flex items-center justify-center max-h-87.5">
          <ChartContainer
            config={chartConfig}
            className="w-full h-full max-w-70 sm:max-w-[320px] lg:max-w-87.5"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      hideLabel
                      formatter={(value, name) => (
                        <>
                          <div className="text-xs text-muted-foreground capitalize">
                            {String(name)}
                          </div>
                          <div className="font-bold text-sm">
                            {formatCurrency(Number(value))} FCFA
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {((Number(value) / totalAE) * 100).toFixed(1)}% of
                            total
                          </div>
                        </>
                      )}
                    />
                  }
                />
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="50%"
                  outerRadius="75%"
                  strokeWidth={2}
                  stroke="hsl(var(--background))"
                >
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy}
                              className="fill-foreground font-bold font-mono"
                              style={{ fontSize: "1.5rem" }}
                            >
                              {formatCurrency(totalAE)}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 20}
                              className="fill-muted-foreground"
                              style={{ fontSize: "0.75rem" }}
                            >
                              Total AE
                            </tspan>
                          </text>
                        );
                      }
                    }}
                  />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        <div className="mt-3 sm:mt-4 grid grid-cols-2 gap-2 sm:gap-4 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full shrink-0"
              style={{ backgroundColor: "#fe9a00" }}
            />
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[10px] sm:text-xs font-medium truncate">
                Engaged
              </span>
              <span className="text-xs sm:text-sm font-bold truncate">
                {formatCurrency(totalEngaged)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full shrink-0"
              style={{ backgroundColor: "#1449e6" }}
            />
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[10px] sm:text-xs font-medium truncate">
                Available
              </span>
              <span className="text-xs sm:text-sm font-bold truncate">
                {formatCurrency(available)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
