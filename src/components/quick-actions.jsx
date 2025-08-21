import React from "react";
import { Button } from "./ui/button";
import { Play, Square, RefreshCw, Download, Trash2 } from "lucide-react";

export default function QuickActions({ 
  selectedPipelines = [], 
  totalPipelines = 0,
  onStartSelected,
  onStopSelected,
  onRefreshAll,
  onExportConfig,
  onDeleteSelected,
  pipelineStats = { running: 0, stopped: 0, failed: 0, scheduled: 0 }
}) {
  const hasSelectedPipelines = selectedPipelines.length > 0;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      {/* Quick Actions Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className={`flex items-center gap-2 ${
              hasSelectedPipelines 
                ? "bg-green-100 text-green-700 hover:bg-green-200 border-green-300" 
                : "bg-gray-100 text-gray-700 border-gray-300"
            }`}
            disabled={!hasSelectedPipelines}
            onClick={onStartSelected}
          >
            <Play className="h-4 w-4" />
            Start Selected {hasSelectedPipelines && `(${selectedPipelines.length})`}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={`flex items-center gap-2 ${
              hasSelectedPipelines 
                ? "bg-red-100 text-red-700 hover:bg-red-200 border-red-300" 
                : "bg-gray-100 text-gray-700 border-gray-300"
            }`}
            disabled={!hasSelectedPipelines}
            onClick={onStopSelected}
          >
            <Square className="h-4 w-4" />
            Stop Selected {hasSelectedPipelines && `(${selectedPipelines.length})`}
          </Button>
          <Button
            variant="default"
            size="sm"
            className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700"
            onClick={onRefreshAll}
          >
            <RefreshCw className="h-4 w-4" />
            Refresh All
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={`flex items-center gap-2 ${
              hasSelectedPipelines 
                ? "bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-300" 
                : "bg-gray-100 text-gray-700 border-gray-300"
            }`}
            disabled={!hasSelectedPipelines}
            onClick={onExportConfig}
          >
            <Download className="h-4 w-4" />
            Export Config {hasSelectedPipelines && `(${selectedPipelines.length})`}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={`flex items-center gap-2 ${
              hasSelectedPipelines 
                ? "bg-red-100 text-red-700 hover:bg-red-200 border-red-300" 
                : "bg-gray-100 text-gray-700 border-gray-300"
            }`}
            disabled={!hasSelectedPipelines}
            onClick={onDeleteSelected}
          >
            <Trash2 className="h-4 w-4" />
            Delete Selected {hasSelectedPipelines && `(${selectedPipelines.length})`}
          </Button>
          <span className="text-sm text-gray-500 ml-4">
            {hasSelectedPipelines 
              ? `${selectedPipelines.length} pipeline(s) selected` 
              : "Select pipelines to enable bulk actions."
            }
          </span>
        </div>
      </div>

      {/* Pipeline Status Summary */}
      <div className="border-t border-gray-200 pt-4">
        <div className="grid grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-2xl font-semibold text-gray-900 mb-1">{pipelineStats.running || 0}</div>
            <div className="text-sm text-gray-600 mb-1">Running</div>
            <div className="w-8 h-1 bg-green-500 rounded-full mx-auto"></div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-semibold text-gray-900 mb-1">{pipelineStats.stopped || 0}</div>
            <div className="text-sm text-gray-600 mb-1">Stopped</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-semibold text-gray-900 mb-1">{pipelineStats.failed || 0}</div>
            <div className="text-sm text-gray-600 mb-1">Failed</div>
            <div className="w-8 h-1 bg-red-500 rounded-full mx-auto"></div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-semibold text-gray-900 mb-1">{pipelineStats.scheduled || 0}</div>
            <div className="text-sm text-gray-600 mb-1">Scheduled</div>
            <div className="w-8 h-1 bg-blue-500 rounded-full mx-auto"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
