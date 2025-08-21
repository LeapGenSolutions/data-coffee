import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Clock, Play, Pause, AlertTriangle } from "lucide-react";

export default function PipelineSchedulingDashboard() {
  const [viewMode, setViewMode] = useState("upcoming");
  
  const { data: pipelines = [], isLoading } = useQuery({
    queryKey: ['/api/pipelines'],
  });

  const getScheduledPipelines = () => {
    // Filter pipelines that have scheduling information
    return pipelines.filter(p => p.schedule || p.status === 'Scheduled');
  };

  const getUpcomingSchedules = () => {
    const now = new Date();
    const scheduled = getScheduledPipelines();
    
    return scheduled.map(pipeline => {
      // Simulate next run time based on schedule
      const nextRun = new Date(now.getTime() + Math.random() * 24 * 60 * 60 * 1000);
      return {
        ...pipeline,
        nextRun,
        scheduleType: pipeline.schedule || 'Daily',
        status: pipeline.status || 'Scheduled'
      };
    }).sort((a, b) => a.nextRun - b.nextRun);
  };

  const getScheduleStatus = (pipeline) => {
    const now = new Date();
    const nextRun = new Date(pipeline.nextRun);
    
    if (nextRun < now) {
      return 'overdue';
    } else if (nextRun - now < 60 * 60 * 1000) { // Less than 1 hour
      return 'upcoming';
    } else {
      return 'scheduled';
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'overdue': 'text-red-600 bg-red-100',
      'upcoming': 'text-yellow-600 bg-yellow-100',
      'scheduled': 'text-blue-600 bg-blue-100'
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'overdue': <AlertTriangle className="h-4 w-4" />,
      'upcoming': <Clock className="h-4 w-4" />,
      'scheduled': <Calendar className="h-4 w-4" />
    };
    return icons[status] || <Calendar className="h-4 w-4" />;
  };

  const upcomingSchedules = getUpcomingSchedules();

  return (
    <div className="enhanced-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Pipeline Scheduling Dashboard</h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">View:</span>
          <select 
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            className="text-sm border border-gray-300 rounded px-2 py-1"
          >
            <option value="upcoming">Upcoming</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
      </div>

      {/* Schedule Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-sm text-blue-600 font-medium">Total Scheduled</div>
          <div className="text-2xl font-bold text-blue-900">{upcomingSchedules.length}</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="text-sm text-yellow-600 font-medium">Upcoming (1h)</div>
          <div className="text-2xl font-bold text-yellow-900">
            {upcomingSchedules.filter(p => getScheduleStatus(p) === 'upcoming').length}
          </div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="text-sm text-red-600 font-medium">Overdue</div>
          <div className="text-2xl font-bold text-red-900">
            {upcomingSchedules.filter(p => getScheduleStatus(p) === 'overdue').length}
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-sm text-green-600 font-medium">Active</div>
          <div className="text-2xl font-bold text-green-900">
            {pipelines.filter(p => p.status === 'Running').length}
          </div>
        </div>
      </div>

      {/* Schedule Calendar Placeholder */}
      <div className="bg-gray-50 p-8 rounded-lg text-center mb-6">
        <div className="text-gray-500 text-lg mb-2">📅</div>
        <h4 className="text-md font-medium text-gray-700 mb-2">Schedule Calendar</h4>
        <p className="text-sm text-gray-500">Interactive calendar view of pipeline schedules will be displayed here</p>
      </div>

      {/* Upcoming Schedules */}
      <div>
        <h4 className="text-md font-medium text-gray-900 mb-4">Upcoming Schedules</h4>
        {isLoading ? (
          <div className="text-center py-4">
            <p className="text-gray-500">Loading schedules...</p>
          </div>
        ) : upcomingSchedules.length > 0 ? (
          <div className="space-y-3">
            {upcomingSchedules.map((pipeline) => {
              const scheduleStatus = getScheduleStatus(pipeline);
              return (
                <div key={pipeline.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${getStatusColor(scheduleStatus).split(' ')[1]}`}>
                        {getStatusIcon(scheduleStatus)}
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900">{pipeline.name}</h5>
                        <p className="text-sm text-gray-500">{pipeline.workspace}</p>
                        <p className="text-xs text-gray-400">
                          Schedule: {pipeline.scheduleType} • Next run: {pipeline.nextRun.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(scheduleStatus)}`}>
                        {scheduleStatus}
                      </span>
                      <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                        <Play className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                        <Pause className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-4">⏰</div>
            <p className="text-gray-500">No scheduled pipelines found</p>
          </div>
        )}
      </div>
    </div>
  );
}
