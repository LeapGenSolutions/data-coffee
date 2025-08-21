import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

export default function PipelineMonitoringDashboard() {
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds
  
  const { data: pipelines = [], isLoading } = useQuery({
    queryKey: ['/api/pipelines'],
    refetchInterval: refreshInterval,
    refetchIntervalInBackground: true
  });

  const statusCounts = pipelines.reduce((acc, pipeline) => {
    acc[pipeline.status] = (acc[pipeline.status] || 0) + 1;
    return acc;
  }, {});

  const getStatusColor = (status) => {
    const colors = {
      'Running': 'text-green-600 bg-green-100',
      'Stopped': 'text-gray-600 bg-gray-100', 
      'Failed': 'text-red-600 bg-red-100',
      'Scheduled': 'text-blue-600 bg-blue-100',
      'Completed': 'text-emerald-600 bg-emerald-100'
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
  };

  const recentActivity = pipelines
    .filter(p => p.lastRun)
    .sort((a, b) => new Date(b.lastRun) - new Date(a.lastRun))
    .slice(0, 5);

  return (
    <div className="enhanced-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Pipeline Monitoring Dashboard</h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Auto-refresh:</span>
          <select 
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            className="text-sm border border-gray-300 rounded px-2 py-1"
            data-testid="refresh-interval-selector"
          >
            <option value={10000}>10s</option>
            <option value={30000}>30s</option>
            <option value={60000}>1min</option>
            <option value={0}>Off</option>
          </select>
        </div>
      </div>

      {/* Status Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {Object.entries(statusCounts).map(([status, count]) => (
          <div key={status} className="enhanced-card text-center p-4">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
              {status}
            </div>
            <div className="text-2xl font-bold text-gray-900 mt-2" data-testid={`status-count-${status.toLowerCase()}`}>
              {count || 0}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div>
        <h4 className="text-md font-medium text-gray-900 mb-4">Recent Activity</h4>
        {isLoading ? (
          <div className="text-center py-4">
            <i className="fas fa-spinner fa-spin text-gray-400"></i>
            <p className="text-gray-500 mt-2">Loading activity...</p>
          </div>
        ) : recentActivity.length > 0 ? (
          <div className="space-y-3">
            {recentActivity.map((pipeline) => (
              <div key={pipeline.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg" data-testid={`activity-${pipeline.id}`}>
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    pipeline.status === 'Running' ? 'bg-green-500' :
                    pipeline.status === 'Failed' ? 'bg-red-500' :
                    pipeline.status === 'Completed' ? 'bg-emerald-500' :
                    'bg-gray-500'
                  }`}></div>
                  <div>
                    <p className="font-medium text-gray-900">{pipeline.name}</p>
                    <p className="text-sm text-gray-500">{pipeline.workspace}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-900">
                    {new Date(pipeline.lastRun).toLocaleTimeString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {pipeline.executionTime ? `${pipeline.executionTime}min` : 'N/A'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <i className="fas fa-clock text-3xl text-gray-300 mb-3"></i>
            <p className="text-gray-500">No recent activity</p>
          </div>
        )}
      </div>
    </div>
  );
}