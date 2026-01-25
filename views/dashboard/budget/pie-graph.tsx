"use client";

import { Label, Pie, PieChart } from "recharts";
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

  // FIX 1: Use direct color values instead of CSS variables
  const chartData = [
    {
      name: "Engaged",
      value: totalEngaged,
      fill: "#fe9a00", // Orange/Amber color
    },
    {
      name: "Available",
      value: available,
      fill: "#1449e6", // Blue color
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

  // FIX 2: Don't render if there's no data
  if (totalAE === 0) {
    return (
      <Card className="@container/card border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Budget Execution Overview</span>
            {programCode && (
              <span className="text-sm font-normal text-muted-foreground">
                {programCode}
              </span>
            )}
          </CardTitle>
          <CardDescription>
            {programName || "Distribution of authorized budget"}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            No budget data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="@container/card border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Budget Execution Overview</span>
          <span
            className={`text-sm font-normal ${
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
        <CardDescription>
          {programCode
            ? `${programCode} - ${programName || "Program Budget"}`
            : "Distribution of authorized budget"}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square h-62.5"
        >
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
                      <div className="font-bold">
                        {formatCurrency(Number(value))} FCFA
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {((Number(value) / totalAE) * 100).toFixed(1)}% of total
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
              innerRadius={60}
              outerRadius={80}
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
                          className="fill-foreground text-3xl font-bold"
                        >
                          {formatCurrency(totalAE)}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground text-sm"
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
        </ChartContainer>

        {/* Legend with correct colors */}
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: "#fe9a00" }}
            />
            <div className="flex flex-col">
              <span className="text-xs font-medium">Engaged</span>
              <span className="text-sm font-bold">
                {formatCurrency(totalEngaged)} FCFA
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: "#1449e6" }}
            />
            <div className="flex flex-col">
              <span className="text-xs font-medium">Available</span>
              <span className="text-sm font-bold">
                {formatCurrency(available)} FCFA
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
