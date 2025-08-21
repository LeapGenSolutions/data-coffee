import { useState, useEffect, useMemo } from "react";
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
  Users,
  Activity,
  FileText,
  TrendingUp,
} from "lucide-react";
import DashboardLayout from "../layouts/dashboard-layout";
import { useSelector } from "react-redux";
import useFetchPipelineHistory from "../hooks/useFetchPipelineHistory";
import { BACKEND_URL } from "../constants";

export default function Home() {

  const [showExtras, setShowExtras] = useState(false);
  const [showSources, setShowSources] = useState(false);

  const user = useSelector((state) => state.me.me);
  const userEmail = user?.email;

  const [allSources, setAllSources] = useState([]);
  const [sourcesLoading, setSourcesLoading] = useState(true);
  const [workspaces, setWorkspaces] = useState([]);
  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/workspaces/owner/${userEmail}`);
        const data = await res.json();
        setWorkspaces(data || []);
      } catch (err) {
        console.error("Error fetching workspaces:", err);
      }
    };

    if (userEmail) {
      fetchWorkspaces();
    }
  }, [userEmail]);

  useEffect(() => {
    const fetchAllSources = async () => {
      setSourcesLoading(true);
      const combined = [];

      for (const ws of workspaces) {
        try {
          const res = await fetch(`${BACKEND_URL}/api/source/${userEmail}/workspace/${ws.id}`);
          if (res.ok) {
            const data = await res.json();
            combined.push(...data);
          }
        } catch (err) {
          console.error(`Failed fetching sources for workspace ${ws.id}`, err);
        }
      }

      setAllSources(combined);
      setSourcesLoading(false);
    };

    if (workspaces.length > 0 && userEmail) {
      fetchAllSources();
    }
  }, [workspaces, userEmail]);

  const dynamicSourceData = useMemo(() => {
    const typeCounts = {};

    allSources.forEach((source) => {
      const type = source?.configuration?.sourceType ?? "Unknown";
      const workspace = source?.workspaceName ?? "Unknown Workspace";
      const key = `${workspace}: ${type}`;

      typeCounts[key] = (typeCounts[key] || 0) + 1;
    });

    return Object.entries(typeCounts).map(([label, count]) => ({
      source: label,
      value: count,
    }));
  }, [allSources]);

  const { groupedData } = useMemo(() => {
    const rows = new Map();   // workspace -> { workspace, [type]: count }
    const types = new Set();

    dynamicSourceData.forEach((d) => {
      const label = d.source || "";
      const idx = label.lastIndexOf(":");
      const workspace = (idx !== -1 ? label.slice(0, idx) : label).trim();
      const type = (idx !== -1 ? label.slice(idx + 1) : "unknown").trim().toLowerCase();

      types.add(type);
      const row = rows.get(workspace) || { workspace };
      row[type] = (row[type] || 0) + (d.value || 0);
      rows.set(workspace, row);
    });

    return { groupedData: Array.from(rows.values()), usedTypes: Array.from(types) };
  }, [dynamicSourceData]);

  const { source: historyData = [], isLoading: isHistoryLoading } = useFetchPipelineHistory();

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Data Sources */}
          <Card className="border-gray-200 shadow-sm transition-transform duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#2196F3] font-medium text-gray-600">Data Sources</p>
                  <p className="text-3xl font-bold text-gray-900">12</p>
                  <p className="text-xs text-gray-500 mt-1">↑ 2 from last period</p>
                </div>
                <div className="p-3 bg-[#FF9800] rounded-lg">
                  <Database className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Users */}
          <Card className="border-gray-200 shadow-sm transition-transform duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-3xl font-bold text-gray-900">28</p>
                  <p className="text-xs text-gray-500 mt-1">↑ 5 from last period</p>
                </div>
                <div className="p-3 bg-[#9C27B0] rounded-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Health */}
          <Card className="border-gray-200 shadow-sm transition-transform duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Data Health</p>
                  <p className="text-3xl font-bold text-gray-900">98%</p>
                  <p className="text-xs text-[#4CAF50] mt-1">Excellent</p>
                </div>
                <div className="p-3 bg-[#4CAF50] rounded-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Generated Reports */}
          <Card className="border-gray-200 shadow-sm transition-transform duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Generated Reports</p>
                  <p className="text-xs text-gray-500 mt-1">↑ 3 from last period</p>
                </div>
                <div className="p-3 bg-[#F44336] rounded-lg">
                  <FileText className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Data Processed */}
          <Card className="border-gray-200 shadow-sm transition-transform duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Data Processed</p>
                  <p className="text-3xl font-bold text-[#2196F3]">14.7GB</p>
                  <p className="text-xs text-[#2196F3] mt-1">↑ 2.5GB from last period</p>
                </div>
                <div className="p-3 bg-[#2196F3] rounded-full">
                  <Database className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Processing Speed */}
          <Card className="border-gray-200 shadow-sm transition-transform duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Processing Speed</p>
                  <p className="text-3xl font-bold text-[#4CAF50]">245ms</p>
                  <p className="text-xs text-green-600 mt-1">↓ 15ms from last period</p>
                </div>
                <div className="p-3 bg-[#4CAF50] rounded-full">
                  <Activity className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Bytes Served */}
          <Card className="border-gray-200 shadow-sm transition-transform duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Bytes Served</p>
                  <p className="text-3xl font-bold text-[#FF9800]">1.2TB</p>
                  <p className="text-xs text-[#FF9800] mt-1">↑ 12% from last period</p>
                </div>
                <div className="p-3 bg-[#FF9800] rounded-full">
                  <Database className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Freshness */}
          <Card className="border-gray-200 shadow-sm transition-transform duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Freshness</p>
                  <p className="text-3xl font-bold text-[#9C27B0]">99.2%</p>
                  <p className="text-xs text-[#9C27B0] mt-1">↑ 0.5% from last period</p>
                </div>
                <div className="p-3 bg-[#9C27B0] rounded-full">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
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
              <div className="h-[300px] w-full bg-white rounded-lg relative">
                {sourcesLoading ? (
                  <div className="flex items-center justify-center h-full text-[#2196F3] text-sm">
                    Loading sources...
                  </div>
                ) : dynamicSourceData.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-sm text-gray-500">
                    No data sources found in your workspace yet.
                  </div>
                ) : (
                  <>
                    {/* Color map */}
                    {(() => {
                      const sourceColorMap = {
                        files: "#2196F3",
                        blob: "#eeff00ff",
                        rest: "#4CAF50",
                        data: "#9C27B0",
                        mongo: "#703a26ff",
                        sql: "#FF9800",
                        oracle: "#E91E63",
                        postgres: "#3F51B5",
                        edi: "#8BC34A",
                        sharepoint: "#573196ff",
                      };

                      /* Types present (for legend) */
                      const usedTypes = [
                        ...new Set(
                          dynamicSourceData.map((entry) => {
                            const v = entry.source || "";
                            const i = v.lastIndexOf(":");
                            const raw = i !== -1 ? v.slice(i + 1) : v;
                            return raw.trim().toLowerCase();
                          })
                        ),
                      ];

                      return (
                        <>
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={groupedData}
                              layout="vertical"
                              margin={{ top: showSources ? 36 : 8, right: 10, left: 40, bottom: 8 }}
                              barCategoryGap="30%"
                              barGap={2}
                            >
                              <CartesianGrid stroke="#eee" />
                              <XAxis type="number" hide={!showSources} />
                              <YAxis type="category" dataKey="workspace" tick={{ fontSize: 12 }} />
                              <Tooltip
                                formatter={(value, name) => [value, name.charAt(0).toUpperCase() + name.slice(1)]}
                                labelFormatter={(ws) => ws}
                              />
                              {usedTypes.map((t) => (
                                <Bar
                                  key={t}
                                  dataKey={t}
                                  barSize={16}
                                  fill={sourceColorMap[t] || "#90A4AE"}
                                  radius={[2, 2, 2, 2]}
                                />
                              ))}
                            </BarChart>
                          </ResponsiveContainer>

                          {/* legend overlay */}
                          {showSources && (
                            <div
                              className="absolute top-2 right-3 flex flex-wrap items-center gap-4 text-sm rounded-md px-2 py-1"
                              style={{ pointerEvents: "none", background: "rgba(255,255,255,0.8)" }}
                            >
                              {usedTypes.map((t) => (
                                <span key={t} className="flex items-center gap-2">
                                  <span
                                    className="inline-block w-3.5 h-3.5 rounded-sm"
                                    style={{ backgroundColor: sourceColorMap[t] || "#90A4AE" }}
                                  />
                                  <span className="capitalize">{t}</span>
                                </span>
                              ))}
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </>
                )}
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