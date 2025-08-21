import { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Database,
  Activity,
  Users, 
  CheckCircle,
  TrendingUp
} from "lucide-react";

import DashboardLayout from "../layouts/dashboard-layout";
import { useSelector } from "react-redux";
import useFetchSources from "../hooks/useFetchSources";
import useFetchPipelineHistory from "../hooks/useFetchPipelineHistory";
import useDashboardKpis from "../hooks/useDashboardKpis";


export default function Home() {
  const [showExtras, setShowExtras] = useState(false);
  const [showSources, setShowSources] = useState(false);

  const user = useSelector((state) => state.me.me);
  const workspaceID = useSelector(
    (state) => state.workspaces?.workspaces?.[0]?.id
  );

  const { sources = [], isLoading: sourcesLoading } = useFetchSources(workspaceID);
  const { source: historyData = [], isLoading: isHistoryLoading } = useFetchPipelineHistory();
  //const { data: kpis = {} } = useDashboardKpis();// Safe default fallback
  const { kpis } = useDashboardKpis();
  console.log("KPIs from hook:", kpis);

  const dynamicSourceData = useMemo(() => {
    const typeCounts = sources.reduce((acc, source) => {
      const type = source?.configuration?.sourceType ?? "Unknown";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(typeCounts).map(([type, count]) => ({
      source: type,
      value: count,
    }));
  }, [sources]);

  const chartData = useMemo(() => {
    if (!historyData || historyData.length === 0) return [];

    const grouped = {};

    historyData.forEach(item => {
      if (!item.pipeline_start_time || !item.pipeline_status) return;

      const date = new Date(item.pipeline_start_time).toISOString().split("T")[0];

      if (!grouped[date]) {
        grouped[date] = { date, Completed: 0, Running: 0, Failed: 0 };
      }

      const status = item.pipeline_status.toLowerCase();

      if (["completed", "success"].includes(status)) {
        grouped[date].Completed += 1;
      } else if (status === "running") {
        grouped[date].Running += 1;
      } else if (status === "failed") {
        grouped[date].Failed += 1;
      }
    });

    return Object.values(grouped).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [historyData]);

  const greeting = user ? `Welcome, ${user.name}!` : "Welcome!";

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Banner */}
        <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#2196F3] rounded-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{greeting}</h1>
                <p className="text-[#2196F3] mt-1">Your data insights are ready.</p>
                <p className="text-sm text-gray-600 mt-2">Your platform for secure, compliant, and modern data analytics.</p>
              </div>
            </div>
          </CardContent>
        </Card>
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* Data Sources */}
  <div className="bg-white rounded-2xl shadow-md hover:shadow-lg hover:scale-[1.01] transition-all duration-300 p-6 border border-gray-200">
    <div className="flex items-start gap-4">
      <div className="bg-orange-100 p-3 rounded-lg shadow-inner">
        <Database className="h-6 w-6 text-orange-600" />
      </div>
      <div>
        <p className="text-sm text-gray-600 font-medium">Data Sources</p>
        <h3 className="text-3xl font-bold text-gray-900">{kpis?.dataSources ?? 0}</h3>
        <p className="text-sm text-green-600 mt-1 flex items-center">
          <TrendingUp className="h-4 w-4 mr-1" />
        </p>
        <p className="text-xs text-gray-400">Active data sources</p>
      </div>
    </div>
  </div>

  {/* Total Pipelines */}
  <div className="bg-white rounded-2xl shadow-md hover:shadow-lg hover:scale-[1.01] transition-all duration-300 p-6 border border-gray-200">
    <div className="flex items-start gap-4">
      <div className="bg-yellow-100 p-3 rounded-lg shadow-inner">
        <Activity className="h-6 w-6 text-yellow-600" />
      </div>
      <div>
        <p className="text-sm text-gray-600 font-medium">Total Pipelines</p>
        <h3 className="text-3xl font-bold text-gray-900">{kpis?.totalPipelines ?? 0}</h3>
        <p className="text-sm text-green-600 mt-1 flex items-center">
          <TrendingUp className="h-4 w-4 mr-1" />
        </p>
        <p className="text-xs text-gray-400">Pipelines created</p>
      </div>
    </div>
  </div>

  {/* Successful Pipelines */}
  <div className="bg-white rounded-2xl shadow-md hover:shadow-lg hover:scale-[1.01] transition-all duration-300 p-6 border border-gray-200">
    <div className="flex items-start gap-4">
      <div className="bg-green-100 p-3 rounded-lg shadow-inner">
        <CheckCircle className="h-6 w-6 text-green-600" />
      </div>
      <div>
        <p className="text-sm text-gray-600 font-medium">Successful Pipelines</p>
        <h3 className="text-3xl font-bold text-gray-900">{kpis?.successPipelines ?? 0}</h3>
        <p className="text-sm text-green-600 mt-1 flex items-center">
          <TrendingUp className="h-4 w-4 mr-1" />
        </p>
        <p className="text-xs text-gray-400">Successfully executed</p>
      </div>
    </div>
  </div>

  {/* Accessible Workspaces */}
  <div className="bg-white rounded-2xl shadow-md hover:shadow-lg hover:scale-[1.01] transition-all duration-300 p-6 border border-gray-200">
    <div className="flex items-start gap-4">
      <div className="bg-purple-100 p-3 rounded-lg shadow-inner">
        <Users className="h-6 w-6 text-purple-600" />
      </div>
      <div>
        <p className="text-sm text-gray-600 font-medium">Your Workspaces</p>
        <h3 className="text-3xl font-bold text-gray-900">{kpis?.accessibleWorkspaces ?? 0}</h3>
        <p className="text-sm text-green-600 mt-1 flex items-center">
          <TrendingUp className="h-4 w-4 mr-1" />
        </p>
        <p className="text-xs text-gray-400">Accessible to you</p>
      </div>
    </div>
  </div>
</div>

        {/* Bottom Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
          {/* Data Brewing Activity */}
          <Card className="border-[#2196F3] shadow-sm h-full">
            <div
              className="bg-[#f7f1eb] px-6 py-4 flex items-center justify-between border-b border-[#2196F3] rounded-t-md cursor-pointer"
              onClick={() => setShowExtras((prev) => !prev)}
            >
              <div>
                <h2 className="text-xl font-semibold text-[#2196F3]">Data Brewing Activity</h2>
                <p className="text-sm text-[#2196F3]">Pipeline execution status over time</p>
              </div>
              {showExtras ? (
                <ChevronUp className="text-[#2196F3] w-6 h-6" />
              ) : (
                <ChevronDown className="text-[#2196F3] w-6 h-6" />
              )}
            </div>

            <CardContent className="p-4">
              <div className="h-[300px] w-full bg-white rounded-lg">
                {isHistoryLoading ? (
                  <div className="flex justify-center items-center h-full text-[#2196F3]">
                    Loading pipeline activity...
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid stroke="#ddd" />
                      <XAxis dataKey="date" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      {showExtras && (
                        <Legend
                          verticalAlign="top"
                          iconType="square"
                          formatter={(value) => (
                            <span style={{ color: "#2196F3", fontSize: "0.875rem" }}>{value}</span>
                          )}
                        />
                      )}
                      <Line
                        type="monotone"
                        dataKey="Completed"
                        stroke="#4CAF50"
                        strokeWidth={3}
                        dot={{ r: 3 }}
                        name="Completed"
                      />
                      <Line
                        type="monotone"
                        dataKey="Running"
                        stroke="#2196F3"
                        strokeWidth={3}
                        dot={{ r: 3 }}
                        name="Running"
                      />
                      <Line
                        type="monotone"
                        dataKey="Failed"
                        stroke="#f44336"
                        strokeWidth={3}
                        dot={{ r: 3 }}
                        name="Failed"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Data Sources */}
          <Card className="border-[#2196F3] shadow-sm h-full">
            <div
              className="bg-[#f7f1eb] px-6 py-4 flex items-center justify-between border-b border-[#2196F3] rounded-t-md cursor-pointer"
              onClick={() => setShowSources((prev) => !prev)}
            >
              <div>
                <h2 className="text-xl font-semibold text-[#2196F3]">Data Sources</h2>
                <p className="text-sm text-[#2196F3]">Source distribution by type</p>
              </div>
              {showSources ? (
                <ChevronUp className="text-[#2196F3] w-6 h-6" />
              ) : (
                <ChevronDown className="text-[#2196F3] w-6 h-6" />
              )}
            </div>

            <CardContent className="p-4">
              <div className="h-[300px] w-full bg-white rounded-lg">
                {(() => {
                  if (sourcesLoading) {
                    return (
                      <div className="flex items-center justify-center h-full text-[#2196F3] text-sm">
                        Loading sources...
                      </div>
                    );
                  }

                  if (dynamicSourceData.length === 0) {
                    return (
                      <div className="flex items-center justify-center h-full text-sm text-gray-500">
                        No data sources found in your workspace yet.
                      </div>
                    );
                  }

                  return (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={dynamicSourceData}
                        layout="vertical"
                        margin={{ top: 5, right: 10, left: 40, bottom: 5 }}
                      >
                        <CartesianGrid stroke="#eee" />
                        <XAxis type="number" hide={!showSources} />
                        <YAxis type="category" dataKey="source" tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Bar dataKey="value" fill="#2196F3" barSize={20} />
                      </BarChart>
                    </ResponsiveContainer>
                  );
                })()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Log Card */}
        <Card className="border-[#2196F3] shadow-sm">
          <CardHeader className="bg-[#f7f1eb] flex flex-row justify-between items-center px-6 py-4 border-b border-[#2196F3]">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-[#2196F3]">Data Brewing Activity Log</h2>
              <Badge className="bg-[#2196F3] text-[#2196F3] text-xs">5 New</Badge>
            </div>
            <Button variant="ghost" className="text-[#2196F3] text-sm hover:underline">View All</Button>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  text: "New source added",
                  time: "3 hours ago by Madhu Chanthati",
                  border: "border-l-[4px] border-green-700",
                  hover: "hover:bg-green-50",
                },
                {
                  text: "User account created",
                  time: "Yesterday by Admin",
                  border: "border-l-[4px] border-blue-700",
                  hover: "hover:bg-blue-50",
                },
                {
                  text: "System backup completed",
                  time: "2 days ago by System",
                  border: "border-l-[4px] border-yellow-700",
                  hover: "hover:bg-yellow-50",
                },
                {
                  text: "Report published",
                  time: "4 days ago by Sarah Johnson",
                  border: "border-l-[4px] border-red-700",
                  hover: "hover:bg-red-50",
                },
                {
                  text: "Failed login attempt",
                  time: "1 week ago from 192.168.1.105",
                  border: "border-l-[4px] border-rose-800",
                  hover: "hover:bg-rose-50",
                },
                {
                  text: "Data batch processed",
                  time: "1 week ago by System",
                  border: "border-l-[4px] border-purple-800",
                  hover: "hover:bg-purple-50",
                },
              ].map((log, index) => (
                <div
                  key={index}
                  className={`bg-white p-4 shadow-sm ${log.border} ${log.hover} rounded-r-md transition-colors duration-200`}
                >
                  <p className="font-semibold text-[#1e3a8a]">{log.text}</p>
                  <p className="text-sm text-gray-600 mt-1">{log.time}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        
        <div className="text-center text-sm text-[#2196F3] pt-6 border-t border-[#e6d5c5]">
          © 2025 Data Coffee. All rights reserved. | Privacy Policy | Terms of Service
        </div>
      </div>
    </DashboardLayout>
  );
}
