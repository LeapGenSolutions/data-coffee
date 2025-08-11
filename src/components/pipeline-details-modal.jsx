import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Database,
  Calendar,
  Clock,
  Settings,
  Shield,
  GitBranch,
  Target,
  Zap,
  CheckCircle,
  AlertCircle} from "lucide-react";
import { useMemo } from "react";
import useFetchPipelineHistory from "../hooks/useFetchPipelineHistory";

export function PipelineDetailsModal({ pipeline, run, isOpen, onClose, mode = "auto" }) {
  const { source: history = [] } = useFetchPipelineHistory();

  // View mode: pipeline overview vs specific run
  const isRunView = mode === "run" || !!run;

  const getStatusBadge = (status) => {
    const s = (status || "").toLowerCase();

    const statusConfig = {
      active: { className: "bg-[#4CAF50] text-white", icon: <CheckCircle className="h-4 w-4" /> },
      running: { className: "bg-[#2196F3] text-white", icon: <Zap className="h-4 w-4" /> },
      paused: { className: "bg-[#FF9800] text-white", icon: <AlertCircle className="h-4 w-4" /> },
      inactive: { className: "bg-[#F44336] text-white", icon: <AlertCircle className="h-4 w-4" /> },
      success:  { className: "bg-[#4CAF50] text-white", icon: <CheckCircle className="h-4 w-4" /> },
      failed:   { className: "bg-[#F44336] text-white", icon: <AlertCircle className="h-4 w-4" /> },
    };

    const labelMap = {
      success: "Completed",
      failed: "Failed",
      running: "Running",
      active: "Active",
      paused: "Paused",
      inactive: "Inactive",
    };

    const cfg = statusConfig[s] || statusConfig.active;
    const label = labelMap[s] || "Active";

    return (
      <Badge className={`${cfg.className} flex items-center gap-1`}>
        {cfg.icon}
        {label}
      </Badge>
    );
  };

  const getTechniqueBadge = (technique) => {
    const techniqueConfig = {
      masking: { className: "bg-blue-100 text-blue-700", icon: <Shield className="h-4 w-4" /> },
      encryption: { className: "bg-blue-100 text-blue-700", icon: <Shield className="h-4 w-4" /> },
      anonymization: { className: "bg-green-100 text-green-700", icon: <Shield className="h-4 w-4" /> },
      tokenization: { className: "bg-orange-100 text-orange-700", icon: <Shield className="h-4 w-4" /> }
    };

    const config = techniqueConfig[technique?.toLowerCase()] || techniqueConfig.masking;

    return (
      <Badge className={`${config.className} flex items-center gap-1`}>
        {config.icon}
        {technique?.charAt(0).toUpperCase() + technique?.slice(1) || 'Masking'}
      </Badge>
    );
  };

  const normalizeStatus = (s) => {
    const x = (s || "").toLowerCase();

    if (["success", "succeeded", "completed", "complete"].includes(x)) return "success";
    if (["failed", "failure", "error"].includes(x)) return "failed";
    if (["running", "in-progress", "inprogress"].includes(x)) return "running";
    if (x === "paused") return "paused";
    if (x === "active") return "active";
    if (x === "inactive") return "inactive";

    return x || "active";
  };

  const normalizeCosmosDate = (d) => {
    if (!d) return undefined;
    // Some rows use "YYYY-MM-DD HH:mm:ss" → make it ISO-ish
    if (typeof d === "string" && d.includes(" ") && !d.includes("T")) {
      return d.replace(" ", "T");
    }
    return d;
  };

  //  Build the object the JSX will use (merges config + chosen run)
  const view = useMemo(() => {
    if (!pipeline && !run) return null;

    const rows = history
      .filter((h) =>
        (pipeline?.id ? h.pipeline_id === pipeline.id : false) ||
        (pipeline?.name ? h.pipeline_name === pipeline.name : false) ||
        (run?.pipeline_id ? h.pipeline_id === run.pipeline_id : false) ||
        (run?.pipeline_name ? h.pipeline_name === run.pipeline_name : false)
      )
      .sort(
        (a, b) =>
          new Date(b.pipeline_start_time) - new Date(a.pipeline_start_time)
      );

    const chosen = isRunView
      ? (run ? rows.find((r) => r.id === run.id) || run : rows[0])
      : rows[0];

    const totalRuns = !isRunView ? rows.length || undefined : undefined;
    const successRate =
      !isRunView && rows.length
        ? Math.round(
            (rows.filter((r) => (r.pipeline_status || "").toLowerCase() === "success").length /
              rows.length) * 100
          )
        : undefined;

    return {
      // Config (safe fallbacks if config not loaded yet)
      name: pipeline?.name || run?.pipeline_name,
      source: pipeline?.source,
      destination: pipeline?.destination,
      technique: pipeline?.technique,
      processingAgent: pipeline?.processing_agent || pipeline?.processingAgent,
      schedule: pipeline?.schedule,
      description: pipeline?.description,
      workspaceName: pipeline?.workspaceName,

      // Chosen run (specific run for Control Panel, latest run for Management)
      status: normalizeStatus(chosen?.pipeline_status || pipeline?.status),
      created: pipeline?.created_at || pipeline?.last_updated,
      lastRun:
        normalizeCosmosDate(chosen?.pipeline_end_time) ||
        chosen?.pipeline_start_time,

      // Exact run timestamps for "Run Details"
      runStart: chosen?.pipeline_start_time,
      runEnd: normalizeCosmosDate(chosen?.pipeline_end_time),

      // Cross-run stats (hidden in run view)
      totalRuns,
      successRate,
      avgDuration: chosen?.pipeline_duration || undefined,

      // Extras
      message: chosen?.pipeline_message,
      logs: chosen?.pipeline_logs,
    };
  }, [pipeline, run, history, isRunView]);

  //  Only now it’s safe to early return
  if (!view) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };
  const statusL = (view.status || "").toLowerCase();
  const isFailure = ["failed", "error"].includes(statusL);
  const isSuccess = ["success", "completed", "active"].includes(statusL);
  const logsSaySuccess = /\bsuccess(fully)? completed\b/i.test(view.logs || "");
  const logsSayFailure = /(failed|failure|exception|error)/i.test(view.logs || "");
  const showStaleWarning = (isFailure && logsSaySuccess) || (isSuccess && logsSayFailure);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white p-0 flex flex-col h-[80vh]">
        {/* Fixed Header */}
        <div className="flex-shrink-0 border-b border-gray-200">
          <DialogHeader className="p-6 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="flex items-center gap-2 text-xl text-gray-900">
                  <GitBranch className="h-5 w-5 text-[#2196F3]" />
                  {view.name}
                </DialogTitle>
                <DialogDescription className="text-gray-600 mt-1">
                  View configuration and details for this pipeline.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Source</span>
                  </div>
                  <span className="text-sm text-gray-900">{view.source ?? "—"}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Destination</span>
                  </div>
                  <span className="text-sm text-gray-900">{view.destination ?? "—"}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Technique</span>
                  </div>
                  {getTechniqueBadge(view.technique)}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Status</span>
                  </div>
                  {getStatusBadge(view.status)}
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Created</span>
                  </div>
                  <span className="text-sm text-gray-900">{formatDate(view.created)}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Last Run</span>
                  </div>
                  <span className="text-sm text-gray-900">{formatDate(view.lastRun)}</span>
                </div>
              </div>
            </div>

            {/* Additional Configuration */}
            {(view.processingAgent || view.schedule || view.description) && (
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Additional Configuration
                </h4>

                {view.description && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Description</label>
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-gray-700">{view.description}</p>
                    </div>
                  </div>
                )}

                {view.processingAgent && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Processing Agent</label>
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm text-gray-700">{view.processingAgent}</p>
                    </div>
                  </div>
                )}

                {view.schedule && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Schedule</label>
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-gray-700">{view.schedule}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Run Details (shows on Control Panel / when a run is chosen) */}
            {(view.runStart || view.runEnd || view.message || view.logs) && (
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Run Details
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {view.runStart && (
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="text-sm font-medium text-gray-700">Start Time</div>
                      <div className="text-sm text-gray-900">{formatDate(view.runStart)}</div>
                    </div>
                  )}
                  {view.runEnd && (
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="text-sm font-medium text-gray-700">End Time</div>
                      <div className="text-sm text-gray-900">{formatDate(view.runEnd)}</div>
                    </div>
                  )}
                </div>

                {view.message && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Message</label>
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-gray-700">{view.message}</p>
                    </div>
                  </div>
                )}

                {view.logs && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Logs</label>
                    {showStaleWarning && (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-sm">
                        Status shows failure, but logs contain a success message. Logs may be stale or from a different run.
                      </div>
                    )}
                    <div className="p-3 bg-gray-900 text-gray-100 rounded-lg border border-gray-800 max-h-56 overflow-auto">
                      <pre className="text-xs whitespace-pre-wrap">{view.logs}</pre>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Pipeline Statistics */}
            {!isRunView && (view.totalRuns || view.successRate || view.avgDuration) && (
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Pipeline Statistics
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {view.totalRuns && (
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="text-sm font-medium text-gray-700">Total Runs</div>
                      <div className="text-lg font-semibold text-gray-900">{view.totalRuns}</div>
                    </div>
                  )}
                  {view.successRate && (
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="text-sm font-medium text-gray-700">Success Rate</div>
                      <div className="text-lg font-semibold text-gray-900">{view.successRate}%</div>
                    </div>
                  )}
                  {view.avgDuration && (
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="text-sm font-medium text-gray-700">Avg Duration</div>
                      <div className="text-lg font-semibold text-gray-900">{view.avgDuration}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Workspace Information */}
            {view.workspaceName && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Workspace</label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-700">{view.workspaceName}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="flex-shrink-0 p-6 pt-4 border-t border-gray-200">
          <div className="flex justify-end">
            <Button onClick={onClose} className="bg-[#2196F3] hover:bg-[#1976D2] text-white">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}