import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "../hooks/use-toast";
import { X, CheckCircle, Database, ArrowRight, Settings, Star, Layers, Loader2 } from "lucide-react";
import { Button } from "./ui/button";

export default function PipelineTemplatesGallery({ isOpen, onClose, onTemplateSelect }) {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const { toast } = useToast();

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['/api/templates'],
    enabled: isOpen
  });

  const createFromTemplateMutation = useMutation({
    mutationFn: async (templateData) => {
      const response = await apiRequest("POST", "/api/pipelines", templateData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pipelines'] });
      onClose();
      toast({
        title: "Success",
        description: "Pipeline created from template successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create pipeline from template",
        variant: "destructive"
      });
    }
  });

  const handleUseTemplate = (template) => {
    if (onTemplateSelect) {
      onTemplateSelect(template);
      onClose();
    } else {
      // Create directly from template
      const pipelineData = {
        name: `${template.name} - ${new Date().toLocaleDateString()}`,
        workspace: "development",
        source: template.source,
        destination: template.destination,
        technique: template.technique,
        description: `Created from template: ${template.description}`,
        status: "Stopped"
      };
      createFromTemplateMutation.mutate(pipelineData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50" data-testid="templates-gallery-modal">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Pipeline Templates</h3>
                <p className="text-sm text-gray-600">Choose from pre-configured templates to quickly create new pipelines</p>
              </div>
              <button 
                className="text-gray-400 hover:text-gray-600"
                onClick={onClose}
                data-testid="close-templates-gallery"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div className="p-6">
            {isLoading ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 text-gray-400 animate-spin mx-auto mb-2" />
                <p className="text-gray-500">Loading templates...</p>
              </div>
            ) : templates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {templates.map((template) => (
                  <div 
                    key={template.id} 
                    className={`border rounded-lg p-6 cursor-pointer transition-all ${
                      selectedTemplate?.id === template.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                    }`}
                    onClick={() => setSelectedTemplate(template)}
                    data-testid={`template-card-${template.id}`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-2">{template.name}</h4>
                        <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                      </div>
                      {selectedTemplate?.id === template.id && (
                        <CheckCircle className="h-6 w-6 text-blue-600" />
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center text-sm">
                        <Database className="h-4 w-4 text-blue-600 mr-3" />
                        <span className="text-gray-700">Source: {template.source}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <ArrowRight className="h-4 w-4 text-green-600 mr-3" />
                        <span className="text-gray-700">Destination: {template.destination}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Settings className="h-4 w-4 text-purple-600 mr-3" />
                        <span className="text-gray-700">Technique: {template.technique}</span>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-xs text-gray-500">
                          <Star className="h-3 w-3 text-yellow-500 mr-1" />
                          <span>Popular template</span>
                        </div>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUseTemplate(template);
                          }}
                          disabled={createFromTemplateMutation.isPending}
                          variant="outline"
                          size="sm"
                          className="text-blue-600 border-blue-600 hover:bg-blue-50"
                          data-testid={`use-template-${template.id}`}
                        >
                          {createFromTemplateMutation.isPending ? 'Creating...' : 'Use Template'}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Layers className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No Templates Available</h4>
                <p className="text-gray-600">Templates will appear here once they are created</p>
              </div>
            )}
          </div>

          {selectedTemplate && (
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Selected: {selectedTemplate.name}</h4>
                  <p className="text-sm text-gray-600">Ready to create pipeline from this template</p>
                </div>
                <div className="flex space-x-3">
                  <Button
                    onClick={onClose}
                    variant="outline"
                    size="sm"
                    data-testid="cancel-template-selection"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => handleUseTemplate(selectedTemplate)}
                    disabled={createFromTemplateMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    data-testid="create-from-template"
                  >
                    {createFromTemplateMutation.isPending ? 'Creating...' : 'Create Pipeline'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
