"use client";

import React, { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";

const chartConfig = {
  users: {
    label: "New Users",
    color: "#FF5C35",
  },
  earnings: {
    label: "Earnings",
    color: "#8F00FF",
  },
};

const yTicks = [0, 50, 100, 500, 1000];
const mapValue = (val) => {
  if (val <= 0) return 0;
  if (val <= 50) return (val / 50) * 1;
  if (val <= 100) return 1 + ((val - 50) / 50) * 1;
  if (val <= 500) return 2 + ((val - 100) / 400) * 1;
  if (val <= 1000) return 3 + ((val - 500) / 500) * 1;
  return 4; // Caps out mapping for huge values
};

const CustomTooltip = ({ active, payload, label, selectedYear }) => {
  if (active && payload && payload.length) {
    const monthNames = [
      "January", "February", "March", "April", "May", "June", 
      "July", "August", "September", "October", "November", "December"
    ];
    const monthIdx = parseInt(label) - 1;
    const monthName = monthNames[monthIdx] || "March";
    const originalPayload = payload[0].payload;

    return (
      <div className="bg-[#1A1C1E] text-white p-3 rounded-[12px] shadow-xl border-none text-xs z-50">
        <p className="font-semibold mb-2">{monthName} {selectedYear}</p>
        <div className="flex flex-col gap-1 text-[11px]">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-[2px] bg-[#FF5C35]" />
            <span className="text-[12px]">New Users:</span>
            <span className="font-medium text-[12px]">{originalPayload.users}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-[2px] bg-[#8F00FF]" />
            <span className="text-[12px]">Earnings:</span>
            <span className="font-medium text-[12px]">
              ${originalPayload.earnings.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export function StatisticsChart({ chartData }) {
  const currentYearNum = new Date().getFullYear();
  const currentYear = currentYearNum.toString();
  
  // Get all available years from the data, but ensure at least current and 3 previous years are shown
  const availableYears = useMemo(() => {
    const yearsSet = new Set();
    
    // Add current and 3 previous years
    for (let i = 0; i < 4; i++) {
      yearsSet.add((currentYearNum - i).toString());
    }

    if (chartData) {
      Object.keys(chartData).forEach(y => yearsSet.add(y));
    }
    
    return Array.from(yearsSet).sort((a, b) => Number(b) - Number(a)); // Descending order
  }, [chartData, currentYearNum]);

  const [selectedYear, setSelectedYear] = useState(() => {
    if (availableYears.includes(currentYear)) return currentYear;
    return availableYears[0];
  });

  // Extract and transform data for selected year
  const rawYearData = useMemo(() => {
    if (chartData && chartData[selectedYear]) {
      return chartData[selectedYear];
    }
    // Empty default data
    return Array.from({ length: 12 }, (_, i) => ({
      month: String(i + 1).padStart(2, "0"),
      users: 0,
      earnings: 0,
    }));
  }, [chartData, selectedYear]);

  const transformedData = useMemo(() => {
    return rawYearData.map((d) => ({
      ...d,
      usersMapped: mapValue(d.users),
      earningsMapped: mapValue(d.earnings),
    }));
  }, [rawYearData]);

  // Handle when availableYears changes (e.g. data loaded late)
  React.useEffect(() => {
    if (availableYears.length > 0 && !availableYears.includes(selectedYear)) {
      setSelectedYear(availableYears[0]);
    }
  }, [availableYears, selectedYear]);

  return (
    <div className="bg-white p-4 rounded-[16px] border border-[#EED9FF] w-full h-[377px] flex flex-col gap-[16px]">
      <div className="flex justify-between items-center">
        <h3
          className="text-[20px] font-semibold text-[#1A1A1A]"
          style={{ fontFamily: "var(--font-nunito-sans)" }}
        >
          My Statistics
        </h3>
        
        {/* Dynamic Year Dropdown */}
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-[125px] h-[38px] border-2 border-[#EFEFEF] rounded-[10px] px-4 py-2 flex items-center justify-between gap-2 text-[#757575] font-medium hover:bg-gray-50 transition-colors focus:ring-0 focus:ring-offset-0 shadow-none text-sm">
            <SelectValue placeholder="Select Year" />
          </SelectTrigger>
          <SelectContent className="bg-white rounded-[10px] border-[#EFEFEF] shadow-lg">
            {availableYears.map(y => (
              <SelectItem key={y} value={y} className="cursor-pointer">
                Year {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 w-full min-h-0">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={transformedData}
              margin={{ top: 25, right: 10, left: -25, bottom: 0 }}
            >
              <CartesianGrid
                vertical={false}
                stroke="#F2F2F2"
                strokeDasharray="0"
              />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#A0A0A0", fontSize: 12 }}
                tickMargin={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#A0A0A0", fontSize: 12, textAnchor: "start" }}
                ticks={[0, 1, 2, 3, 4]}
                tickFormatter={(v) => yTicks[v]}
                domain={[0, 4]}
                interval={0}
                dx={0}
              />
              <ChartTooltip content={<CustomTooltip selectedYear={selectedYear} />} cursor={{ stroke: "#e0e0e0", strokeWidth: 1, strokeDasharray: "3 3" }} />
              <Line
                type="monotone"
                dataKey="usersMapped"
                stroke="var(--color-users)"
                strokeWidth={3}
                dot={false}
                activeDot={{
                  r: 6,
                  fill: "#1A1C1E",
                  strokeWidth: 2,
                  stroke: "#fff",
                }}
              />
              <Line
                type="monotone"
                dataKey="earningsMapped"
                stroke="var(--color-earnings)"
                strokeWidth={3}
                dot={false}
                activeDot={{
                  r: 6,
                  fill: "#1A1C1E",
                  strokeWidth: 2,
                  stroke: "#fff",
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  );
}
