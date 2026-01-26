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
      <Card className="border-border/50">
        <CardHeader className="px-3 py-4 sm:px-6 sm:py-6">
          <CardTitle className="text-sm sm:text-base flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <span className="truncate">Budget Execution Overview</span>
            {programCode && (
              <span className="text-xs sm:text-sm font-normal text-muted-foreground">
                {programCode}
              </span>
            )}
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm truncate">
            {programName || "Distribution of authorized budget"}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          <div className="flex items-center justify-center h-48 sm:h-64 text-muted-foreground text-sm">
            No budget data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="px-3 py-4 sm:px-6 sm:py-6">
        <CardTitle className="text-sm sm:text-base flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <span className="truncate">Budget Execution Overview</span>
          <span
            className={`text-xs sm:text-sm font-normal whitespace-nowrap ${
              executionRate > 95
                ? "text-red-600 dark:text-red-400"
                : executionRate > 90
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-green-600 dark:text-green-400"
            }`}
          >
            {executionRate.toFixed(1)}% Executed
          </span>
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm line-clamp-1">
          {programCode
            ? `${programCode} - ${programName || "Program Budget"}`
            : "Distribution of authorized budget"}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-3 pb-4 sm:px-6 sm:pb-6">
        <div className="w-full h-48 sm:h-64 md:h-72">
          <ChartContainer config={chartConfig} className="w-full h-full">
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
                  innerRadius="45%"
                  outerRadius="70%"
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
                              className="fill-foreground text-xl sm:text-2xl md:text-3xl font-bold"
                            >
                              {formatCurrency(totalAE)}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 20}
                              className="fill-muted-foreground text-xs sm:text-sm"
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

        <div className="mt-4 grid grid-cols-2 gap-2 sm:gap-4">
          <div className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full shrink-0"
              style={{ backgroundColor: "#fe9a00" }}
            />
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-medium truncate">Engaged</span>
              <span className="text-xs sm:text-sm font-bold truncate">
                {formatCurrency(totalEngaged)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full shrink-0"
              style={{ backgroundColor: "#1449e6" }}
            />
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-medium truncate">Available</span>
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
