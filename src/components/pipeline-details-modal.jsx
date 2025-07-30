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

export function PipelineDetailsModal({ pipeline, isOpen, onClose }) {
  if (!pipeline) return null;

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
                  {pipeline.name}
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
                  <span className="text-sm text-gray-900">{pipeline.source}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Destination</span>
                  </div>
                  <span className="text-sm text-gray-900">{pipeline.destination}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Technique</span>
                  </div>
                  {getTechniqueBadge(pipeline.technique)}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Status</span>
                  </div>
                  {getStatusBadge(pipeline.status)}
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Created</span>
                  </div>
                  <span className="text-sm text-gray-900">{formatDate(pipeline.created)}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Last Run</span>
                  </div>
                  <span className="text-sm text-gray-900">{formatDate(pipeline.lastRun)}</span>
                </div>
              </div>
            </div>

            {/* Additional Configuration */}
            {(pipeline.processingAgent || pipeline.schedule || pipeline.description) && (
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Additional Configuration
                </h4>

                {pipeline.description && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Description</label>
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-gray-700">{pipeline.description}</p>
                    </div>
                  </div>
                )}

                {pipeline.processingAgent && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Processing Agent</label>
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm text-gray-700">{pipeline.processingAgent}</p>
                    </div>
                  </div>
                )}

                {pipeline.schedule && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Schedule</label>
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-gray-700">{pipeline.schedule}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Pipeline Statistics */}
            {(pipeline.totalRuns || pipeline.successRate || pipeline.avgDuration) && (
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Pipeline Statistics
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {pipeline.totalRuns && (
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="text-sm font-medium text-gray-700">Total Runs</div>
                      <div className="text-lg font-semibold text-gray-900">{pipeline.totalRuns}</div>
                    </div>
                  )}
                  {pipeline.successRate && (
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="text-sm font-medium text-gray-700">Success Rate</div>
                      <div className="text-lg font-semibold text-gray-900">{pipeline.successRate}%</div>
                    </div>
                  )}
                  {pipeline.avgDuration && (
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="text-sm font-medium text-gray-700">Avg Duration</div>
                      <div className="text-lg font-semibold text-gray-900">{pipeline.avgDuration}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Workspace Information */}
            {pipeline.workspaceName && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Workspace</label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-700">{pipeline.workspaceName}</p>
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