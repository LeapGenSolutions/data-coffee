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

export function PipelineDetailsModal({ pipeline, isOpen, onClose }) {
  // Call hooks unconditionally (no early return above this)
  const { source: history = [] } = useFetchPipelineHistory();

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { className: "bg-[#4CAF50] text-white", icon: <CheckCircle className="h-4 w-4" /> },
      running: { className: "bg-[#2196F3] text-white", icon: <Zap className="h-4 w-4" /> },
      paused: { className: "bg-[#FF9800] text-white", icon: <AlertCircle className="h-4 w-4" /> },
      inactive: { className: "bg-[#F44336] text-white", icon: <AlertCircle className="h-4 w-4" /> }
    };

    const config = statusConfig[status?.toLowerCase()] || statusConfig.active;

    return (
      <Badge className={`${config.className} flex items-center gap-1`}>
        {config.icon}
        {status?.charAt(0).toUpperCase() + status?.slice(1) || 'Active'}
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
    if (x === "success") return "active";
    if (x === "failed" || x === "error") return "inactive";
    if (x === "running") return "running";
    return x || "active";
  };

  const normalizeCosmosDate = (d) => {
    if (!d) return undefined;
    if (typeof d === "string" && d.includes(" ") && !d.includes("T")) {
      return d.replace(" ", "T");
    }
    return d;
  };

  const view = useMemo(() => {
    if (!pipeline) return null;

    const rows = history
      .filter((h) => h.pipeline_id === pipeline.id || h.pipeline_name === pipeline.name)
      .sort((a, b) => new Date(b.pipeline_start_time) - new Date(a.pipeline_start_time));

    const latest = rows[0];
    const totalRuns = rows.length || undefined;
    const successRate = rows.length
      ? Math.round(
          (rows.filter((r) => (r.pipeline_status || "").toLowerCase() === "success").length / rows.length) *
            100
        )
      : undefined;

    return {
      // config
      name: pipeline.name,
      source: pipeline.source,
      destination: pipeline.destination,
      technique: pipeline.technique,
      processingAgent: pipeline.processing_agent || pipeline.processingAgent,
      schedule: pipeline.schedule,
      description: pipeline.description,
      workspaceName: pipeline.workspaceName,

      // cosmos-preferred
      status: normalizeStatus(latest?.pipeline_status || pipeline.status),
      created: pipeline.created_at || pipeline.last_updated,
      lastRun: normalizeCosmosDate(latest?.pipeline_end_time) || latest?.pipeline_start_time,

      // stats
      totalRuns,
      successRate,
      avgDuration: latest?.pipeline_duration || undefined,

      // extras
      logs: latest?.pipeline_logs,
      message: latest?.pipeline_message,
    };
  }, [pipeline, history]);

  // ✅ Early return AFTER hooks
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
                  <span className="text-sm text-gray-900">{view.source}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Destination</span>
                  </div>
                  <span className="text-sm text-gray-900">{view.destination}</span>
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

            {/* Pipeline Statistics */}
            {(view.totalRuns || view.successRate || view.avgDuration) && (
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