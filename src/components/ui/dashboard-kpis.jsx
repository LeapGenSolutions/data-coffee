import { Database, Activity, Users, CheckCircle, TrendingUp } from "lucide-react";

export default function DashboardKpis({ kpis }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Data Sources */}
      <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-200">
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
      <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-200">
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
      <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-200">
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
      <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-200">
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
  );
}
