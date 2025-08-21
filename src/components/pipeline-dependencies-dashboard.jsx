import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

export default function PipelineDependenciesDashboard() {
  const [selectedPipeline, setSelectedPipeline] = useState(null);
  
  const { data: pipelines = [], isLoading } = useQuery({
    queryKey: ['/api/pipelines'],
  });

  const getDependencies = (pipeline) => {
    // This would typically come from the API, but for now we'll simulate dependencies
    const mockDependencies = {
      'source': pipeline.source || 'Unknown',
      'destination': pipeline.destination || 'Unknown',
      'technique': pipeline.technique || 'Unknown',
      'workspace': pipeline.workspace || 'Unknown'
    };
    
    return mockDependencies;
  };

  const getDependencyHealth = (pipeline) => {
    // Simulate dependency health checks
    const health = {
      source: Math.random() > 0.2 ? 'healthy' : 'warning',
      destination: Math.random() > 0.15 ? 'healthy' : 'warning',
      technique: Math.random() > 0.1 ? 'healthy' : 'warning',
      workspace: Math.random() > 0.05 ? 'healthy' : 'warning'
    };
    
    return health;
  };

  const getHealthColor = (status) => {
    return status === 'healthy' ? 'text-green-600 bg-green-100' : 'text-yellow-600 bg-yellow-100';
  };

  const getHealthIcon = (status) => {
    return status === 'healthy' ? '✅' : '⚠️';
  };

  return (
    <div className="enhanced-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Pipeline Dependencies Dashboard</h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Pipeline:</span>
          <select 
            value={selectedPipeline || ''}
            onChange={(e) => setSelectedPipeline(e.target.value)}
            className="text-sm border border-gray-300 rounded px-2 py-1"
          >
            <option value="">Select a pipeline</option>
            {pipelines.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {!selectedPipeline ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-4xl mb-4">🔗</div>
          <h4 className="text-lg font-medium text-gray-700 mb-2">Select a Pipeline</h4>
          <p className="text-sm text-gray-500">Choose a pipeline from the dropdown above to view its dependencies</p>
        </div>
      ) : (
        <div>
          {(() => {
            const pipeline = pipelines.find(p => p.id === selectedPipeline);
            if (!pipeline) return null;
            
            const dependencies = getDependencies(pipeline);
            const health = getDependencyHealth(pipeline);
            
            return (
              <div>
                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                  <h4 className="font-medium text-blue-900 mb-2">{pipeline.name}</h4>
                  <p className="text-sm text-blue-700">{pipeline.description || 'No description available'}</p>
                </div>

                {/* Dependency Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {Object.entries(dependencies).map(([key, value]) => (
                    <div key={key} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-gray-900 capitalize">{key}</h5>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getHealthColor(health[key])}`}>
                          {getHealthIcon(health[key])} {health[key]}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{value}</p>
                    </div>
                  ))}
                </div>

                {/* Dependency Graph Placeholder */}
                <div className="bg-gray-50 p-8 rounded-lg text-center mb-6">
                  <div className="text-gray-500 text-lg mb-2">🕸️</div>
                  <h4 className="text-md font-medium text-gray-700 mb-2">Dependency Graph</h4>
                  <p className="text-sm text-gray-500">Visual representation of pipeline dependencies will be displayed here</p>
                </div>

                {/* Dependency Details */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">Dependency Details</h4>
                  <div className="space-y-3">
                    {Object.entries(dependencies).map(([key, value]) => (
                      <div key={key} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-medium text-gray-900 capitalize">{key}</h5>
                            <p className="text-sm text-gray-600">{value}</p>
                          </div>
                          <div className="text-right">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getHealthColor(health[key])}`}>
                              {getHealthIcon(health[key])} {health[key]}
                            </span>
                            <p className="text-xs text-gray-500 mt-1">
                              Last checked: {new Date().toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
