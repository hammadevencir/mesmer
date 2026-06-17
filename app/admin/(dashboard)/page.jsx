"use client";

import React, { useEffect, useState } from "react";
import KPICard from "@/components/dashboard/KPICard";
import { StatisticsChart } from "@/components/dashboard/StatisticsChart";
import { NewUsersTable } from "@/components/dashboard/NewUsersTable";
import {
  UserIDIcon,
  SubscriptionsIcon,
  RevenueIcon,
} from "@/components/icons/icons";

const DashboardPage = () => {
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(null);
  const [totalSubscriptions, setTotalSubscriptions] = useState(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState(null);
  const [chartData, setChartData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchUsers() {
      try {
        const res = await fetch("/api/admin/users", { credentials: "include" });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Failed to load users");
        }
        const data = await res.json();
        if (!cancelled) {
          setUsers(data.users ?? []);
          setTotalUsers(data.total ?? 0);
          setTotalSubscriptions(data.totalSubscriptions ?? 0);
          setMonthlyRevenue(data.monthlyRevenue ?? 0);
          setChartData(data.chartData ?? {});
        }
      } catch (e) {
        if (!cancelled) {
          setError(e.message);
          setUsers([]);
          setTotalUsers(0);
          setTotalSubscriptions(0);
          setMonthlyRevenue(0);
          setChartData({});
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchUsers();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="p-4 md:p-6 space-y-6 bg-[#FDFCFD] min-h-full">
      <div className="flex items-center justify-between">
        <h1
          className="text-2xl font-bold text-[#1A1A1A]"
          style={{ fontFamily: "var(--font-nunito-sans)" }}
        >
          Dashboard
        </h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <KPICard
          title="Total Users"
          value={totalUsers !== null ? String(totalUsers) : "—"}
          percentage="+ 20%"
          icon={UserIDIcon}
          iconBgColor="bg-[#FFF1EE]"
          iconColor="text-[#FF5C35]"
        />
        <KPICard
          title="Total Subscriptions"
          value={totalSubscriptions !== null ? String(totalSubscriptions) : "—"}
          percentage="+ 20%"
          icon={SubscriptionsIcon}
          iconBgColor="bg-[#F6E9FF]"
          iconColor="text-[#8F00FF]"
        />
        <KPICard
          title="Monthly Revenue"
          value={monthlyRevenue !== null ? `$${monthlyRevenue.toFixed(2)}` : "—"}
          percentage="+ 20%"
          icon={RevenueIcon}
          iconBgColor="bg-[#E7F9F8]"
          iconColor="text-[#00B8AC]"
        />
      </div>

      {/* Statistics Chart Section */}
      <StatisticsChart chartData={chartData} />

      {/* New Users Table Section */}
      <NewUsersTable
        users={users}
        loading={loading}
        error={error}
      />
    </div>
  );
};

export default DashboardPage;
