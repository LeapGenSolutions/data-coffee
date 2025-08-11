/* eslint-disable */
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import {
  RefreshCw,
  Eye,
  Trash2,
  Activity,
  CheckCircle,
  AlertCircle,
  Clock
} from "lucide-react";

function formatDateTime(dt) {
  if (!dt) return "-";
  const d = new Date(dt);
  if (isNaN(d)) return dt;
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
}
import { Calendar } from "lucide-react";
import DashboardLayout from "../layouts/dashboard-layout";
import { Power } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import useFetchPipelineHistory from "../hooks/useFetchPipelineHistory";
import { PipelineDetailsModal } from "../components/pipeline-details-modal";
import useFetchPipelineById from "../hooks/useFetchPipelineById";

export default function ControlPanel() {
  // General settings state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [isBackupEnabled, setIsBackupEnabled] = useState(true);
  const [backupSchedule, setBackupSchedule] = useState("daily");
  const [backupTime, setBackupTime] = useState("2am");
  const [backupRetention, setBackupRetention] = useState(30);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [maintMode, setMaintMode] = useState(false);
  const [apiRateLimit, setApiRateLimit] = useState(100);
  const [cpuUsage, setCpuUsage] = useState(42);
  const [memoryUsage, setMemoryUsage] = useState(68);
  const [diskUsage, setDiskUsage] = useState(34);
  const { source: pipelineHistory, isLoading, error, refetch } = useFetchPipelineHistory();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedRun, setSelectedRun] = useState(null);
  const { data: pipelineConfig } = useFetchPipelineById(selectedRun?.pipeline_id);



  const { toast } = useToast();

  // WebSocket connection for real-time updates
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    try {
      const socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        console.log('WebSocket connected');
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received WebSocket message:', data);

          if (data.type === 'pipeline_progress') {
            setPipelines(prev => prev.map(pipeline =>
              pipeline.id === data.data.id
                ? { ...pipeline, message: data.data.message }
                : pipeline
            ));
          } else if (data.type === 'pipeline_completed') {
            setPipelines(prev => prev.map(pipeline =>
              pipeline.id === data.data.id
                ? { ...pipeline, status: 'success', endTime: data.data.endTime, message: data.data.message }
                : pipeline
            ));
          }
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      socket.onclose = () => {
        console.log('WebSocket disconnected');
      };

      return () => {
        socket.close();
      };
    } catch (err) {
      console.error('Failed to establish WebSocket connection:', err);
    }
  }, []);

  // Simulate real-time system metrics
  useEffect(() => {
    const interval = setInterval(() => {
      setCpuUsage(prev => Math.max(10, Math.min(90, prev + (Math.random() - 0.5) * 10)));
      setMemoryUsage(prev => Math.max(20, Math.min(85, prev + (Math.random() - 0.5) * 8)));
      setDiskUsage(prev => Math.max(15, Math.min(75, prev + (Math.random() - 0.5) * 5)));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Data Refreshed",
      description: "Pipeline data has been refreshed successfully.",
    });
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      running: { variant: "default", className: "bg-blue-100 text-blue-800", icon: Activity },
      success: { variant: "success", className: "bg-green-100 text-green-800", icon: CheckCircle },
      failed: { variant: "destructive", className: "bg-red-100 text-red-800", icon: AlertCircle },
      pending: { variant: "secondary", className: "bg-yellow-100 text-yellow-800", icon: Clock },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const IconComponent = config.icon;

    return (
      <Badge variant={config.variant} className={`${config.className} flex items-center gap-1`}>
        <IconComponent />
        <span>{status === 'success' ? 'Completed' : status.charAt(0).toUpperCase() + status.slice(1)}</span>
      </Badge>
    );
  };
  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <Tabs defaultValue="monitoring" className="w-full">
          <TabsContent value="monitoring">
            <Card className="rounded-xl shadow-sm border border-gray-200">
              <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <div>
                  <CardTitle className="text-[#2196F3] text-lg font-semibold">Pipeline Monitoring</CardTitle>
                  <CardDescription className="text-gray-500 text-sm">
                    Real-time status of all data processing pipelines
                  </CardDescription>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[#2196F3]">Auto-refresh</span>
                    <Switch checked />
                  </div>
                  <Button size="sm" variant="outline" onClick={handleRefresh} className="flex items-center gap-1 text-[#2196F3] border-[#2196F3]">
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* Left Side: Input + Dropdown */}
                  <div className="flex items-center gap-3">
                    <Input
                      placeholder="Search pipelines..."
                      className="w-[240px] h-10 text-sm border border-gray-300 rounded-md placeholder:text-gray-500 focus:ring-2 focus:ring-[#2196F3] bg-white text-black !bg-white !text-black dark:!bg-white dark:!text-black" />
                    <Select>
                      <SelectTrigger className="w-[160px] h-10 text-sm border border-[#2196F3] text-[#2196F3] rounded-md">
                        <SelectValue placeholder="All Statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="success">Success</SelectItem>
                        <SelectItem value="running">Running</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Right Side: Clear Filters Button */}
                  <Button
                    variant="outline"
                    className="h-10 px-4 border border-[#D6BFAA] text-[#8B5E3C] rounded-md flex items-center gap-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4 stroke-current"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L16 12.414V19a1 1 0 01-1.447.894l-4-2A1 1 0 0110 17v-4.586L3.293 6.707A1 1 0 013 6V4z"
                      />
                    </svg>
                    Clear Filters
                  </Button>
                </div>
                <div className="overflow-auto rounded-md border border-gray-200">
                  <table className="w-full text-sm">
                    <thead className="bg-[#F4F6F8] text-[#2196F3] text-left text-sm">
                      <tr>
                        <th className="p-3 font-medium">Pipeline Name</th>
                        <th className="p-3 font-medium">Start Time</th>
                        <th className="p-3 font-medium">End Time</th>
                        <th className="p-3 font-medium">Status</th>
                        <th className="p-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(!pipelineHistory || pipelineHistory.length === 0) ? (
                        <tr>
                          <td colSpan={5} className="p-6 text-center text-gray-500">No pipelines ran yet.</td>
                        </tr>
                      ) : (
                        pipelineHistory.map((item, idx) => (
                          <tr key={idx} className="border-t hover:bg-blue-50 transition-colors">
                            <td className="p-3 text-gray-800">{item.pipeline_name}</td>
                            <td className="p-3 text-gray-800">{formatDateTime(item.pipeline_start_time)}</td>
                            <td className="p-3 text-gray-800">{formatDateTime(item.pipeline_end_time)}</td>
                            <td className="p-3">
                              {getStatusBadge(item.pipeline_status)}
                            </td>
                            <td className="p-3 flex gap-2">
                              <Button
                                size="icon"
                                variant="outline"
                                className="rounded-full"
                                onClick={() => {
                                  setSelectedRun(item);          // item is the row (a run)
                                  setDetailsOpen(true);
                                }}
                              >
                                <Eye className="h-4 w-4 text-[#2196F3]" />
                              </Button>
                              <Button size="icon" variant="outline" className="rounded-full">
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>


          <TabsContent value="general">
            <Card className="rounded-xl shadow-sm border border-gray-200">
              <CardHeader>
                <CardTitle className="text-[#2196F3] text-lg font-semibold">
                  General Settings
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Switches */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm text-[#2196F3] font-medium">Maintenance Mode</Label>
                    <p className="text-sm text-gray-500 mb-1">
                      When enabled, all users except admins will be locked out of the system
                    </p>
                    <Switch checked={maintMode} onCheckedChange={setMaintMode} />
                  </div>

                  <div>
                    <Label className="text-sm text-[#2196F3] font-medium">Email Notifications</Label>
                    <p className="text-sm text-gray-500 mb-1">
                      Receive email notifications for system alerts and updates
                    </p>
                    <Switch checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
                  </div>
                </div>

                {/* Inputs */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm text-[#2196F3] font-medium">Company Name</Label>
                    <Input placeholder="Data Coffee" className="w-[240px] h-10 text-sm border border-gray-300 rounded-md placeholder:text-gray-500 focus:ring-2 focus:ring-[#2196F3] bg-white text-black !bg-white !text-black dark:!bg-white dark:!text-black" />
                  </div>

                  <div>
                    <Label className="text-sm text-[#2196F3] font-medium">System Email</Label>
                    <Input placeholder="admin@datacoffee.com" className="w-[240px] h-10 text-sm border border-gray-300 rounded-md placeholder:text-gray-500 focus:ring-2 focus:ring-[#2196F3] bg-white text-black !bg-white !text-black dark:!bg-white dark:!text-black" />
                  </div>

                  <div>
                    <Label className="text-sm text-[#2196F3] font-medium">Timezone</Label>
                    <Select>
                      <SelectTrigger className="w-full mt-1 border border-gray-300 text-[#2196F3]">
                        <SelectValue placeholder="UTC" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="EST">EST</SelectItem>
                        <SelectItem value="PST">PST</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-between items-center pt-4">
                  <Button variant="outline" className="border border-red-600 text-red-600 hover:bg-red-50">
                    <Power className="w-4 h-4 mr-2" />
                    Restart System
                  </Button>
                  <Button className="bg-gradient-to-r from-blue-500 to-black-500 text-white">
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card className="rounded-xl shadow-sm border border-gray-200"> <CardHeader>
              <CardTitle className="text-[#2196F3] text-lg">Security Settings</CardTitle>
            </CardHeader>
              <CardContent className="space-y-6 px-6 py-4">
                {/* Two-Factor Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-[#2196F3] block mb-1">Two-Factor Authentication</Label>
                    <p className="text-xs text-gray-500">
                      Require two-factor authentication for all users
                    </p>
                  </div>
                  <Switch checked={twoFactorEnabled} onCheckedChange={setTwoFactorEnabled} />
                </div>

                {/* Password Policy */}
                <div>
                  <Label className="text-[#2196F3] block mb-1">Password Policy</Label>
                  <Select>
                    <SelectTrigger className="w-full h-10 rounded-md border border-gray-300 text-sm placeholder:text-gray-400 focus:ring-2 focus:ring-[#2196F3]">
                      <SelectValue placeholder="Strong (8+ chars, number, symbol)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weak">Weak</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="strong">Strong</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Session Timeout */}
                <div>
                  <Label className="text-[#2196F3] block mb-1">Session Timeout (minutes)</Label>
                  <Input
                    type="number"
                    placeholder="30"
                    className="w-[240px] h-10 text-sm border border-gray-300 rounded-md placeholder:text-gray-500 focus:ring-2 focus:ring-[#2196F3] bg-white text-black !bg-white !text-black dark:!bg-white dark:!text-black" />
                </div>

                {/* Max Login Attempts */}
                <div>
                  <Label className="text-[#2196F3] block mb-1">Max Login Attempts</Label>
                  <Input
                    type="number"
                    placeholder="5"
                    className="w-[240px] h-10 text-sm border border-gray-300 rounded-md placeholder:text-gray-500 focus:ring-2 focus:ring-[#2196F3] bg-white text-black !bg-white !text-black dark:!bg-white dark:!text-black" />
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-4">
                  <Button className="bg-gradient-to-r from-blue-500 to-black-500 text-white">
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="backup">
            <Card className="w-full max-w-4xl">
              <CardHeader>
                <CardTitle className="text-[#2196F3] text-lg">Backup & Recovery</CardTitle>
                <p className="text-sm text-[#2196F3]">
                  Schedule automatic database backups
                </p>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Automatic Backups Switch */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-[#2196F3] block">Automatic Backups</Label>
                    <p className="text-xs text-[#2196F3]">Enable scheduled backups</p>
                  </div>
                  <Switch checked={isBackupEnabled} onCheckedChange={setIsBackupEnabled} />
                </div>

                {/* Backup Schedule */}
                <div>
                  <Label className="text-[#2196F3] block mb-1">Backup Schedule</Label>
                  <Select value={backupSchedule} onValueChange={setBackupSchedule}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Backup Time */}
                <div>
                  <Label className="text-[#2196F3] block mb-1">Backup Time</Label>
                  <Select value={backupTime} onValueChange={setBackupTime}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose Time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2am">2:00 AM</SelectItem>
                      <SelectItem value="3am">3:00 AM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Backup Retention */}
                <div>
                  <Label className="text-[#2196F3] block mb-1">Backup Retention (days)</Label>
                  <Input
                    type="number"
                    value={backupRetention}
                    onChange={(e) => setBackupRetention(e.target.value)}
                    className="w-full h-10 rounded-md border border-gray-300 text-sm placeholder:text-gray-400 focus:ring-2 focus:ring-[#2196F3] bg-white text-black !bg-white !text-black dark:!bg-white dark:!text-black" />
                </div>

                {/* Buttons */}
                <div className="flex justify-between">
                  <Button variant="outline" className="border border-[#2196F3] text-[#2196F3]">
                    <Calendar className="w-4 h-4 mr-2" />
                    Manual Backup
                  </Button>
                  <Button className="bg-gradient-to-r from-blue-500 to-black-500 text-white">
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>


          <TabsContent value="api">
            <Card className="shadow-lg rounded-xl border border-gray-200">
              <CardHeader>
                <CardTitle className="text-[#2196F3] text-xl font-semibold">API Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 text-[#2196F3]">
                {/* API Key */}
                <div className="flex items-center gap-2">
                  <Input
                    type="password"
                    value="••••••••••••••••••••••••"
                    readOnly
                    className="flex-1 border text-[#2196F3] border-gray-300"
                  />
                  <Button
                    variant="outline"
                    className="border border-[#2196F3] text-[#2196F3] hover:bg-[#2196F3]/10"
                  >
                    Regenerate
                  </Button>
                </div>

                {/* Rate Limit Slider */}
                <div>
                  <Label className="block mb-2 text-[#2196F3] font-medium">API Rate Limit (per minute)</Label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={apiRateLimit}
                    onChange={(e) => setApiRateLimit(e.target.value)}
                    className="w-full h-10 rounded-md border border-gray-300 text-sm placeholder:text-gray-400 focus:ring-2 focus:ring-[#2196F3]" />
                  <div className="text-right text-sm">{apiRateLimit}</div>
                </div>

                {/* CORS Origins */}
                <div>
                  <Label className="block mb-1 text-[#2196F3] font-medium">CORS Origins</Label>
                  <Input value="*" className="border border-gray-300 text-[#2196F3] bg-white text-black !bg-white !text-black dark:!bg-white dark:!text-black" />
                  <p className="text-sm text-[#2196F3]/70 mt-1">
                    Comma-separated list of allowed origins, or <code>*</code> for all
                  </p>
                </div>

                {/* Request Timeout */}
                <div>
                  <Label className="block mb-1 text-[#2196F3] font-medium">Request Timeout (seconds)</Label>
                  <Input value="30" className="border border-gray-300 text-[#2196F3] bg-white text-black !bg-white !text-black dark:!bg-white dark:!text-black" />
                </div>

                {/* Save Changes */}
                <div className="pt-2">
                  <Button className="bg-[#2196F3] text-white hover:bg-[#1e88e5] px-6 py-2 rounded-md">
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <PipelineDetailsModal
        pipeline={pipelineConfig}   // optional; modal works even if this is undefined
        run={selectedRun}           //  tell the modal which run to show
        mode="run"                  //  force run mode 
        isOpen={detailsOpen}
        onClose={() => setDetailsOpen(false)}
      />
    </DashboardLayout>
  )
}