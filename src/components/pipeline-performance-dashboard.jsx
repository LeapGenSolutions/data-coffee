import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

export default function PipelinePerformanceDashboard() {
  const [timeRange, setTimeRange] = useState("7d");
  
  const { data: pipelines = [], isLoading } = useQuery({
    queryKey: ['/api/pipelines'],
  });

  const getPerformanceMetrics = () => {
    const now = new Date();
    const timeRanges = {
      "24h": 24 * 60 * 60 * 1000,
      "7d": 7 * 24 * 60 * 60 * 1000,
      "30d": 30 * 24 * 60 * 60 * 1000
    };
    
    const cutoff = new Date(now.getTime() - timeRanges[timeRange]);
    
    return pipelines.filter(p => p.lastRun && new Date(p.lastRun) > cutoff);
  };

  const performanceData = getPerformanceMetrics();
  
  const avgExecutionTime = performanceData.length > 0 
    ? performanceData.reduce((sum, p) => sum + (p.executionTime || 0), 0) / performanceData.length
    : 0;

  const successRate = performanceData.length > 0
    ? (performanceData.filter(p => p.status === 'Completed').length / performanceData.length) * 100
    : 0;

  return (
    <div className="enhanced-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Pipeline Performance Dashboard</h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Time Range:</span>
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="text-sm border border-gray-300 rounded px-2 py-1"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-sm text-blue-600 font-medium">Total Executions</div>
          <div className="text-2xl font-bold text-blue-900">{performanceData.length}</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-sm text-green-600 font-medium">Success Rate</div>
          <div className="text-2xl font-bold text-green-900">{successRate.toFixed(1)}%</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-sm text-purple-600 font-medium">Avg Execution Time</div>
          <div className="text-2xl font-bold text-purple-900">{avgExecutionTime.toFixed(1)} min</div>
        </div>
      </div>

      {/* Performance Chart Placeholder */}
      <div className="bg-gray-50 p-8 rounded-lg text-center">
        <div className="text-gray-500 text-lg mb-2">📊</div>
        <h4 className="text-md font-medium text-gray-700 mb-2">Performance Trends</h4>
        <p className="text-sm text-gray-500">Performance visualization charts will be displayed here</p>
      </div>

      {/* Top Performers */}
      <div className="mt-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">Top Performing Pipelines</h4>
        {isLoading ? (
          <div className="text-center py-4">
            <p className="text-gray-500">Loading performance data...</p>
          </div>
        ) : performanceData.length > 0 ? (
          <div className="space-y-3">
            {performanceData
              .filter(p => p.status === 'Completed')
              .sort((a, b) => (a.executionTime || 0) - (b.executionTime || 0))
              .slice(0, 5)
              .map((pipeline, index) => (
                <div key={pipeline.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{pipeline.name}</p>
                      <p className="text-sm text-gray-500">{pipeline.workspace}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-900">
                      {pipeline.executionTime ? `${pipeline.executionTime} min` : 'N/A'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(pipeline.lastRun).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No performance data available</p>
          </div>
        )}
      </div>
    </div>
  );
}
