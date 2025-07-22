/* eslint-disable */
import { useRunPipeline } from '../hooks/useRunPipeline';
import { useState, useRef, useEffect } from "react";
import {
  Plus,
  MoreHorizontal,
  Shield,
  Eye,
  Pencil,
  Copy,
  Sparkles,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Checkbox } from "../components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Label } from "../components/ui/label";
import { useToast } from "../hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from "../components/ui/dropdown-menu";
import { CSSTransition } from 'react-transition-group';
import useFetchSources from "../hooks/useFetchSources";
import useSavePipeline from "../hooks/useSavePipeline";
import useFetchPipeline from "../hooks/useFetchPipeline";
import useFetchCustomPrompt from "../hooks/useFetchCustomPrompt";
// Custom prompt fetch hook

// Handler for Use Prompt button
import { useSelector } from "react-redux";
import usePatchPipeline from '../hooks/usePatchPipeline';


function UserManagement() {
  
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showCreateUserDialog, setShowCreateUserDialog] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTechniques, setSelectedTechniques] = useState([]);
  const [destinationType, setDestinationType] = useState("dataset"); // "dataset" or "connection"
  const [connectionString, setConnectionString] = useState("");
  const [selectedProcessingAgent, setSelectedProcessingAgent] = useState("");
  const [runConfiguration, setRunConfiguration] = useState({
    schedule: "",
    notifications: false,
    autoClose: false
  });
  const { toast } = useToast();
  const [viewPipeline, setViewPipeline] = useState(null);
  const [editPipeline, setEditPipeline] = useState(null);
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState("");
  const [promptInput, setPromptInput] = useState("");
  const [showPromptListModal, setShowPromptListModal] = useState(false);
  const [promptPipeline, setPromptPipeline] = useState(null);
  const [showPromptReviewModal, setShowPromptReviewModal] = useState(false);
  const [reviewPromptContent, setReviewPromptContent] = useState("");
  const [reviewPromptPipeline, setReviewPromptPipeline] = useState(null);
  const [showRunPipelineModal, setShowRunPipelineModal] = useState(false);
  const [runPipelineStatus, setRunPipelineStatus] = useState("running");
  const runTimeoutRef = useRef(null);
  const [pipelinePrompts, setPipelinePrompts] = useState({}); // { [pipelineId]: { content, title, timestamp } }
  const [showPromptAppliedModal, setShowPromptAppliedModal] = useState(false);
  const [isApplyingPrompt, setIsApplyingPrompt] = useState(false);
  const [showSuccessTransition, setShowSuccessTransition] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [enableSurroundAI, setEnableSurroundAI] = useState(false);
  const [showSurroundAIConfig, setShowSurroundAIConfig] = useState(false);
  const workspaces = useSelector((state) => state.workspaces.workspaces);
  const [selectedWorkspace, setSelectedWorkspace] = useState(() => {
    // Only set the first workspace if workspaces array exists and has items
    return workspaces && workspaces.length > 0 ? workspaces[0] || "" : "";
  });

  // Fetch available sources for the selected workspace
  const { sources: availableSources, isLoading: sourcesLoading, error: sourcesError } = useFetchSources(selectedWorkspace.id);
  const { sources: pipelineSources, isLoading: pipelineLoading, error: pipelineError } = useFetchPipeline(selectedWorkspace.id);

  // Set the first workspace when workspaces are loaded
  useEffect(() => {
    if (workspaces && workspaces.length > 0 && !selectedWorkspace) {
      setSelectedWorkspace(workspaces[0] || "");
    }
  }, [workspaces, selectedWorkspace]);

  // Sample user data with medical context (fallback for demo)
  const [pipelines, setPipelines] = useState([]);

  const [newUser, setNewUser] = useState({
    name: "",
    sourceDatabase: "",
    destinationDatabase: "",
    techniques: [],
    status: "Active",
  });

  // Use pipelineSources if available, otherwise fallback to users
  const pipelineData = pipelineSources && pipelineSources.length > 0 ? pipelineSources : pipelines;

  // Filter pipelines based on search term
  const filteredUsers = pipelineData.filter(
    (pipeline) =>
      (pipeline.name && pipeline.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (pipeline.source && pipeline.source.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (pipeline.destination && pipeline.destination.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (pipeline.technique && pipeline.technique.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  // Sort users
  const sortedUsers = filteredUsers && filteredUsers.length > 0 ? [...filteredUsers].sort((a, b) => {
    const aValue = a[sortField] || '';
    const bValue = b[sortField] || '';

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      if (sortDirection === "asc") {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    }
    return 0;
  }) : [];

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleSelectUser = (userId, checked) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
    }
  };

  const handleSelectAll = (checked) => {
    if (checked && sortedUsers) {
      setSelectedUsers(sortedUsers.map((user) => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const fetchCustomPrompt = useFetchCustomPrompt();
  const patchPipeline = usePatchPipeline();

  function handleUsePromptClick() {
    if (!promptPipeline || !promptPipeline.id) return;
    fetchCustomPrompt.mutate(
      { pipelineID: promptPipeline.id },
      {
        onSuccess: (data) => {
          console.log(data);
          
          setReviewPromptContent(data?.new_feedback_prompt);
          setReviewPromptPipeline(promptPipeline);
          setShowPromptReviewModal(true);
          setShowPromptListModal(false);
        },
        onError: (err) => {
          toast({ title: 'Failed to fetch prompt', description: err?.message || 'Unknown error', variant: 'destructive' });
        }
      }
    );
  }

  function handlePromptClick() {
    setShowPromptReviewModal(false);
    setIsApplyingPrompt(true);
    // Update the pipeline's current prompt locally
    const pipelineId = (reviewPromptPipeline?.id || promptPipeline?.id);

    // Find the pipeline object to patch
    const pipelineObj = (pipelines.find(p => p.id === pipelineId) || pipelineSources?.find(p => p.id === pipelineId));
    // Get user email (assuming pipeline object has user_id or email field)
    const userEmail = pipelineObj?.user_id || pipelineObj?.email;
    if (pipelineObj && userEmail) {
      // Patch the pipeline with the new prompt content
      patchPipeline.mutate({
        email: userEmail,
        pipelineId: pipelineId,
        pipeline: {
          ...pipelineObj,
          customPrompt: reviewPromptContent,
        }
      }, {
        onSuccess: () => {
          setTimeout(() => {
            setIsApplyingPrompt(false);
            setShowSuccessTransition(true);
            setTimeout(() => {
              setShowSuccessTransition(false);
              setShowPromptAppliedModal(true);
            }, 500);
          }, 3000);
        },
        onError: (err) => {
          setIsApplyingPrompt(false);
          toast({ title: 'Failed to update pipeline', description: err?.message || 'Unknown error', variant: 'destructive' });
        }
      });
    } else {
      setTimeout(() => {
        setIsApplyingPrompt(false);
        setShowSuccessTransition(true);
        setTimeout(() => {
          setShowSuccessTransition(false);
          setShowPromptAppliedModal(true);
        }, 500);
      }, 3000);
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { className: "bg-[#4CAF50] text-white", label: "Completed" },
      inactive: { className: "bg-[#F44336] text-white", label: "Inactive" },
      pending: { className: "bg-[#FF9800] text-white", label: "Pending" },
      new: { className: "bg-blue-500 text-white", label: "New" },
    };

    const config = statusConfig[status.toLowerCase()] || statusConfig.active;

    return (
      <Badge className={`${config.className} text-xs px-2 py-1 rounded-md`}>
        {config.label}
      </Badge>
    );
  };

  const getTechniqueBadge = (technique) => {
    const techniqueConfig = {
      anonymization: {
        className: "bg-[#9C27B0] text-white",
        label: "Anonymization",
      },
      tokenization: {
        className: "bg-[#2196F3] text-white",
        label: "Tokenization",
      },
      masking: { className: "bg-[#FF9800] text-white", label: "Masking" },
    };

    const config = technique ? techniqueConfig[technique.toLowerCase()] : {
      className: "bg-[#4CAF50] text-white",
      label: technique,
    };

    return (
      <Badge className={`${config.className} text-xs px-2 py-1 rounded-md`}>
        {config.label}
      </Badge>
    );
  };

  const savePipeline = useSavePipeline();

  const handleCreateUserPipeline = async () => {
    if (currentStep === 1) {
      if (!newUser.name) {
        toast({
          title: "Validation Error",
          description: "Please enter a pipeline name",
          variant: "destructive",
        });
        return;
      }
      setCurrentStep(2);
      return;
    }

    if (currentStep === 2) {
      const destinationValid =
        destinationType === "connection"
          ? connectionString.trim() !== ""
          : newUser.destinationDatabase !== "";

      if (
        !newUser.sourceDatabase ||
        !destinationValid ||
        selectedTechniques.length === 0
      ) {
        toast({
          title: "Validation Error",
          description:
            "Please fill in all required fields and select at least one security technique",
          variant: "destructive",
        });
        return;
      }
      setCurrentStep(3);
      return;
    }

    if (currentStep === 3) {
      if (!selectedProcessingAgent && !isEditing) {
        toast({
          title: "Validation Error",
          description: "Please select a processing agent",
          variant: "destructive",
        });
        return;
      }
      setCurrentStep(4);
      return;
    }

    if (currentStep === 4) {
      if (!runConfiguration.schedule) {
        toast({
          title: "Validation Error",
          description: "Please select a run schedule",
          variant: "destructive",
        });
        return;
      }

      const pipeline = {
        id: isEditing && editPipeline ? editPipeline.id : Date.now(),
        name: newUser.name,
        source: newUser.sourceDatabase,
        destination:
          destinationType === "connection"
            ? connectionString
            : newUser.destinationDatabase,
        technique: selectedTechniques.join(", "),
        processingAgent: selectedProcessingAgent,
        schedule: runConfiguration.schedule,
        notifications: runConfiguration.notifications,
        status: newUser.status || "Active",
        workspaceID: selectedWorkspace.id,
        workspaceName: selectedWorkspace.workspaceName,
        created: isEditing && editPipeline ? editPipeline.created : new Date().toLocaleDateString(),
        destinationType,
        connectionString,
        enableSurroundAI,
      };
      savePipeline.mutateAsync(pipeline, {
        onSuccess: (data) => {
          toast({
            title: "Pipeline Saved",
            description: `${data.name} has been saved successfully.`,
            variant: "success",
          });
        },
        onError: (error) => {
          toast({
            title: "API Error",
            description: error?.message || "Failed to save pipeline to server.",
            variant: "destructive",
          });
        }
      });

      if (isEditing && editPipeline) {
        setPipelines(users => users.map(u => u.id === pipeline.id ? pipeline : u));
        toast({ title: "Pipeline Updated", description: `${pipeline.name} has been updated.` });
      } else {
        setPipelines([...pipelines, pipeline]);
        toast({ title: "Pipeline Created", description: `${pipeline.name} has been added to the system` });
      }
      resetForm();
      setShowCreateUserDialog(false);
      setIsEditing(false);
      setEditPipeline(null);
    }
  };

  const resetForm = () => {
    setNewUser({
      name: "",
      sourceDatabase: "",
      destinationDatabase: "",
      techniques: [],
      status: "Active",
    });
    setCurrentStep(1);
    setSelectedTechniques([]);
    setDestinationType("dataset");
    setConnectionString("");
    setSelectedProcessingAgent("");
    setRunConfiguration({
      schedule: "",
      notifications: false,
      autoClose: false
    });
    setEnableSurroundAI(false);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleTechniqueToggle = (technique) => {
    setSelectedTechniques((prev) =>
      prev.includes(technique)
        ? prev.filter((t) => t !== technique)
        : [...prev, technique],
    );
  };

  const handleDeleteUser = (userId) => {
    const user = pipelines.find((u) => u.id === userId);
    if (
      window.confirm(
        `Are you sure you want to delete "${user.name}"? This action cannot be undone.`,
      )
    ) {
      setPipelines(pipelines.filter((u) => u.id !== userId));
      toast({
        title: "User Deleted",
        description: `${user.name} has been removed from the system`,
        variant: "destructive",
      });
    }
  };

  const handleToggleStatus = (userId) => {
    setPipelines(
      pipelines.map((user) =>
        user.id === userId
          ? {
            ...user,
            status: user.status === "Active" ? "Inactive" : "Active",
          }
          : user,
      ),
    );
  };

  const handleClonePipeline = (pipeline) => {
    // Find all pipelines with the same base name or base name with (n)
    const baseName = pipeline.name.replace(/ \(\d+\)$/, "");
    const regex = new RegExp(`^${baseName.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}(?: \\((\\d+)\\))?$`);
    let maxClone = 0;
    pipelineData.forEach((p) => {
      const match = p.name.match(regex);
      if (match && match[1]) {
        maxClone = Math.max(maxClone, parseInt(match[1], 10));
      } else if (match) {
        maxClone = Math.max(maxClone, 0);
      }
    });
    const newName = `${baseName} (${maxClone + 1})`;
    const newPipeline = {
      ...pipeline,
      id: Date.now(),
      name: newName,
      created: new Date().toLocaleDateString(),
      status: "new",
    };
    setPipelines([...pipelines, newPipeline]);
    toast({
      title: "Pipeline Cloned",
      description: (
        <span>
          <b>{newName}</b> was created. <Button variant="link" className="p-0 ml-2 text-blue-600" onClick={() => setEditPipeline(newPipeline)}>Edit now</Button>
        </span>
      ),
    });
  };

  // Add mock prompt history and suggested prompt for demonstration
  const getPipelinePrompts = (pipeline) => {
    // In a real app, fetch from backend or pipeline object
    return {
      surroundAIPrompt: {
        title: "Enhance Using Surround AI",
        description: "Improve data validation and cleansing processes Using Surround AI.",
        content: "Improve data validation and cleansing processes to ensure high-quality medical records with standardized formats and complete patient information.",
        timestamp: "2024-07-01 10:00",
      },
      suggestedPrompt: {
        title: "Enhance Data Quality",
        description: "Improve data validation and cleansing processes to assure high-quality analytics.",
        content: "Improve data validation and cleansing processes to ensure high-quality medical records with standardized formats and complete patient information.",
        timestamp: "2024-07-01 10:00",
      },
      promptHistory: [
        {
          title: "Automate Anonymization",
          description: "Implement automated patient data anonymization using advanced AI techniques.",
          content: "Implement automated patient data anonymization using advanced AI techniques for privacy compliance.",
          timestamp: "2024-06-28 09:30",
        },
        {
          title: "Real-time Processing",
          description: "Enable real-time data processing for critical patient and clinical workflows.",
          content: "Enable real-time data processing for critical patient and clinical workflows.",
          timestamp: "2024-06-20 14:15",
        },
      ],
    };
  };

  const runPipelineMutation = useRunPipeline();

  const handleRunPipeline = (pipeline) => {
    setReviewPromptPipeline(pipeline);
    // setShowRunPipelineModal(true);
    // setRunPipelineStatus("running");

    // Call Databricks pipeline run
    runPipelineMutation.mutate({
      pipeline_id: pipeline.id,
      user_id: pipeline.user_id,
      pipeline_name: pipeline.name
    }, {
      onSuccess: (data) => {
        setRunPipelineStatus("completed");
        setPipelines(users => users.map(p =>
          p.id === pipeline.id ? { ...p, status: "Completed" } : p
        ));
        // Optionally show a toast or handle response
      },
      onError: (error) => {
        setRunPipelineStatus("failed");
        // Optionally show a toast for error
      }
    });
  };

  const handleEditPipeline = (pipeline) => {
    setIsEditing(true);
    setEditPipeline(pipeline);
    setShowCreateUserDialog(true);
    setCurrentStep(1);
    setNewUser({
      name: pipeline.name,
      sourceDatabase: pipeline.source,
      destinationDatabase: pipeline.destinationType === "dataset" ? pipeline.destination : "",
      techniques: pipeline.technique ? pipeline.technique.split(", ") : [],
      status: pipeline.status,
    });
    setSelectedTechniques(pipeline.technique ? pipeline.technique.split(", ") : []);
    setDestinationType(pipeline.destinationType || "dataset");
    setConnectionString(pipeline.destinationType === "connection" ? pipeline.connectionString : "");
    setSelectedProcessingAgent(pipeline.processingAgent || "");
    setRunConfiguration({
      schedule: pipeline.schedule || "",
      notifications: pipeline.notifications || false,
      autoClose: pipeline.autoClose || false,
    });
    setEnableSurroundAI(!!pipeline.enableSurroundAI);
  };

  return (
    <div className="space-y-6">
      {/* Applying Prompt Full-Screen Overlay */}
      <CSSTransition
        in={isApplyingPrompt}
        timeout={300}
        classNames="fade"
        unmountOnExit
      >
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(255,255,255,0.96)',
            zIndex: 99999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Simple spinner animation */}
          <div className="custom-spinner" style={{ marginBottom: 32 }}></div>
          <div style={{ color: '#1e293b', fontSize: 20, fontWeight: 500, textAlign: 'center' }}>
            Updating prompt and applying changes to the pipeline…
          </div>
        </div>
      </CSSTransition>
      {/* Header Section - Medical theme with blue gradient */}
      <div className="bg-gradient-to-r from-[#2196F3] to-[#1976D2] text-white p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">User Management</h1>
            <p className="text-blue-100 mt-1">
              Manage data pipelines for secure data handling
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Breadcrumb */}
      <div className="flex items-center text-sm text-blue-600">
        <Shield className="h-4 w-4 mr-2 text-blue-500" />
        <span>Pipeline Management</span>
      </div>

      {/* Main Content */}
      <div className="space-y-4">
        {/* Section Title and Controls */}
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Data Pipelines
          </h2>
          {/* Workspace Dropdown */}
          <div className="flex items-center gap-2">
            <label htmlFor="workspace-select" className="text-sm font-medium text-gray-700">Workspace:</label>
            <select
              id="workspace-select"
              className="border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedWorkspace.id}
              onChange={e => setSelectedWorkspace(workspaces.find(ws => ws.id === e.target.value))}
            >
              {!selectedWorkspace && (
                <option value="" disabled>Select a workspace</option>
              )}
              {workspaces.map(ws => (
                <option key={ws.id} value={ws.id}>{ws.workspaceName || ws.name || ws.id}</option>
              ))}
            </select>
          </div>
          <Dialog
            open={showCreateUserDialog}
            onOpenChange={(open) => {
              setShowCreateUserDialog(open);
              if (!open) {
                resetForm();
                setIsEditing(false);
                setEditPipeline(null);
              }
            }}
          >
            <DialogTrigger asChild>
              <Button className="bg-[#2196F3] hover:bg-[#1976D2] text-white flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Pipeline
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] bg-white max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-gray-900 text-center">
                  {currentStep === 1
                    ? "Create Data Pipeline"
                    : currentStep === 2
                      ? "Select Security Techniques"
                      : currentStep === 3
                        ? "Select Processing Agent"
                        : "Run and Close Configuration"}
                </DialogTitle>
                {currentStep === 2 && (
                  <div className="text-right text-sm text-gray-500">
                    Step 2 of 6
                  </div>
                )}
                {currentStep === 3 && (
                  <div className="text-right text-sm text-gray-500">
                    Step 3 of 6
                  </div>
                )}
                {currentStep === 4 && (
                  <div className="text-right text-sm text-gray-500">
                    Step 4 of 6
                  </div>
                )}
                <DialogDescription className="text-gray-600 text-center">
                  {currentStep === 1
                    ? "Secure your data with privacy techniques."
                    : currentStep === 3
                      ? "Choose the engine or service that will perform data masking, redaction, anonymization, or tokenization."
                      : currentStep === 4
                        ? "Configure when and how the pipeline will run, including scheduling and closure settings."
                        : ""}
                </DialogDescription>
              </DialogHeader>

              {currentStep === 1 && (
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-700">
                      Enter Pipeline Name:
                    </Label>
                    <Input
                      id="name"
                      value={newUser.name}
                      onChange={(e) =>
                        setNewUser({ ...newUser, name: e.target.value })
                      }
                      placeholder="e.g. Customer Data Anonymization"
                      className="input-override !bg-white !border-gray-300 !focus:border-[#2196F3] !text-gray-900"
                      style={{
                        backgroundColor: "white !important",
                        color: "#111827 !important",
                        border: "1px solid #d1d5db !important",
                      }}
                    />
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-8 py-6">
                  {/* Select Data Source Section */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <div className="border-b border-gray-300 pb-3 mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">
                        Select Data Source
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-6">
                      Select the data source or enter a connection string to
                      identify where data will be pulled from. Then choose one
                      or more data security techniques to apply during
                      processing.
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
                      <p className="text-sm text-blue-700"></p>
                    </div>
                    <Select
                      value={newUser.sourceDatabase}
                      onValueChange={(value) =>
                        setNewUser({ ...newUser, sourceDatabase: value })
                      }
                      disabled={sourcesLoading}
                    >
                      <SelectTrigger
                        className="!bg-white !border-gray-300 !focus:border-[#2196F3] !text-gray-900 h-12"
                        style={{ backgroundColor: "white", color: "#111827" }}
                      >
                        <SelectValue placeholder={sourcesLoading ? "Loading sources..." : "Select a data source or connection string"} />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {sourcesLoading && (
                          <div className="px-4 py-2 text-gray-500">Loading...</div>
                        )}
                        {sourcesError && (
                          <div className="px-4 py-2 text-red-500">Error loading sources</div>
                        )}
                        {Array.isArray(availableSources) && availableSources.length > 0 ? (
                          availableSources.map((src) => (
                            <SelectItem key={src.id || src.value || src} value={src?.configuration?.sourceName}>
                              {src?.configuration?.sourceName}
                            </SelectItem>
                          ))
                        ) : !sourcesLoading && !sourcesError ? (
                          <div className="px-4 py-2 text-gray-500">No sources found</div>
                        ) : null}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Select Security Techniques Section */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <div className="border-b border-gray-300 pb-3 mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">
                        Select Security Techniques
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      {[
                        { id: "Masking", label: "Masking" },
                        {
                          id: "Tokenization",
                          label: "Tokenization",
                        },
                        {
                          id: "Anonymization",
                          label: "Anonymization",
                        },
                        { id: "Generate", label: "Generate" },
                      ].map((technique) => (
                        <Button
                          key={technique.id}
                          variant="outline"
                          className={`h-16 flex flex-col items-center gap-2 border-2 transition-all rounded-lg ${selectedTechniques.includes(technique.id)
                            ? "border-[#2196F3] bg-blue-50 text-[#2196F3] shadow-md"
                            : "border-gray-300 hover:border-[#2196F3] hover:bg-blue-25 bg-white"
                            }`}
                          onClick={() => handleTechniqueToggle(technique.id)}
                        >
                          <span className="text-xl">{technique.icon}</span>
                          <span className="text-sm font-medium">
                            {technique.label}
                          </span>
                        </Button>
                      ))}
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4"></div>
                  </div>

                  {/* Destination Configuration Section */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <div className="border-b border-gray-300 pb-3 mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">
                        Select Destination (Connection String or Dataset)
                      </h3>
                    </div>

                    {/* Toggle between connection string and dataset */}
                    <div className="flex gap-4 mb-6">
                      <Button
                        variant="outline"
                        className={`flex items-center gap-2 px-4 py-2 ${destinationType === "connection"
                          ? "border-[#2196F3] bg-blue-50 text-[#2196F3]"
                          : "border-gray-300 text-gray-700"
                          }`}
                        onClick={() => setDestinationType("connection")}
                      >
                        Use connection string
                      </Button>
                      <Button
                        variant="outline"
                        className={`flex items-center gap-2 px-4 py-2 ${destinationType === "dataset"
                          ? "border-[#2196F3] bg-blue-50 text-[#2196F3]"
                          : "border-gray-300 text-gray-700"
                          }`}
                        onClick={() => setDestinationType("dataset")}
                      >
                        Use existing dataset
                      </Button>
                    </div>

                    {destinationType === "connection" ? (
                      <div className="space-y-3">
                        <Input
                          value={connectionString}
                          onChange={(e) => setConnectionString(e.target.value)}
                          placeholder="Enter full connection string (e.g., postgresql://user:pass@host:5432/dbname)"
                          className="input-override !bg-white !border-gray-300 !focus:border-[#2196F3] !text-gray-900 h-12"
                          style={{
                            backgroundColor: "white !important",
                            color: "#111827 !important",
                            border: "1px solid #d1d5db !important",
                          }}
                        />
                        <p className="text-sm text-gray-600">
                          Specify a full connection string for the destination
                          source, or select a predefined dataset from your
                          organization.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Select
                          value={newUser.destinationDatabase}
                          onValueChange={(value) =>
                            setNewUser({
                              ...newUser,
                              destinationDatabase: value,
                            })
                          }
                        >
                          <SelectTrigger
                            className="!bg-white !border-gray-300 !focus:border-[#2196F3] !text-gray-900 h-12"
                            style={{
                              backgroundColor: "white",
                              color: "#111827",
                            }}
                          >
                            <SelectValue placeholder="Select from saved datasets" />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            {sourcesLoading && (
                              <div className="px-4 py-2 text-gray-500">Loading...</div>
                            )}
                            {sourcesError && (
                              <div className="px-4 py-2 text-red-500">Error loading sources</div>
                            )}
                            {Array.isArray(availableSources) && availableSources.length > 0 ? (
                              availableSources.map((src) => (
                                <SelectItem key={src.id || src.value || src} value={src?.configuration?.sourceName}>
                                  {src?.configuration?.sourceName}
                                </SelectItem>
                              ))
                            ) : !sourcesLoading && !sourcesError ? (
                              <div className="px-4 py-2 text-gray-500">No sources found</div>
                            ) : null}
                          </SelectContent>
                        </Select>
                        <p className="text-sm text-gray-600">
                          Choose a predefined dataset from your organization's
                          saved configurations.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6 py-6">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <div className="border-b border-gray-300 pb-3 mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">Select Processing Agent</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Choose the engine or service that will perform data masking, redaction, anonymization, or tokenization.
                    </p>
                    {isEditing ? (
                      <>
                        <Input value={selectedProcessingAgent} disabled className="bg-gray-100" />
                        <div className="text-xs text-gray-500 mt-2">Agent cannot be changed during edit.</div>
                      </>
                    ) : (
                      <Select value={selectedProcessingAgent} onValueChange={setSelectedProcessingAgent}>
                        <SelectTrigger className="!bg-white !border-gray-300 !focus:border-[#2196F3] !text-gray-900 h-12" style={{ backgroundColor: 'white', color: '#111827' }}>
                          <SelectValue placeholder="Select a processing agent" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="Redaction Agent">Redaction Agent</SelectItem>
                          <SelectItem value="Tokenization Agent">Tokenization Agent</SelectItem>
                          <SelectItem value="Anonymization Agent">Anonymization Agent</SelectItem>
                          <SelectItem value="Custom Processing Agent">Custom Processing Agent</SelectItem>
                          <SelectItem value="AI-Based Privacy Agent">AI-Based Privacy Agent</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-6 py-6">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <div className="border-b border-gray-300 pb-3 mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">Run and Close Configuration</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Configure when and how the pipeline will run, including scheduling and closure settings.
                    </p>

                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">
                          Run Schedule
                        </Label>
                        <Select value={runConfiguration.schedule} onValueChange={(value) => setRunConfiguration({ ...runConfiguration, schedule: value })}>
                          <SelectTrigger className="!bg-white !border-gray-300 !focus:border-[#2196F3] !text-gray-900 h-12" style={{ backgroundColor: 'white', color: '#111827' }}>
                            <SelectValue placeholder="Select run schedule" />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            <SelectItem value="immediate">Run Immediately</SelectItem>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="manual">Manual Trigger Only</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            id="notifications"
                            checked={runConfiguration.notifications}
                            onCheckedChange={(checked) => setRunConfiguration({ ...runConfiguration, notifications: checked })}
                            className="border-gray-400"
                          />
                          <Label htmlFor="notifications" className="text-sm text-gray-700 font-medium">
                            Send notifications on completion
                          </Label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            id="autoClose"
                            checked={runConfiguration.autoClose}
                            onCheckedChange={(checked) => setRunConfiguration({ ...runConfiguration, autoClose: checked })}
                            className="border-gray-400"
                          />
                          <Label htmlFor="autoClose" className="text-sm text-gray-700 font-medium">
                            Auto-close pipeline after successful completion
                          </Label>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center mt-4">
                      <Checkbox
                        id="enableSurroundAI"
                        checked={enableSurroundAI}
                        onCheckedChange={setEnableSurroundAI}
                      />
                      <Label htmlFor="enableSurroundAI" className="ml-2">
                        Enable Surround AI
                      </Label>
                    </div>
                    {isEditing && (
                      <div className="mt-4">
                        <Button variant="outline" onClick={() => setShowSurroundAIConfig(true)}>
                          Reconfigure Surround AI
                        </Button>
                        <Dialog open={showSurroundAIConfig} onOpenChange={setShowSurroundAIConfig}>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Reconfigure Surround AI</DialogTitle>
                            </DialogHeader>
                            <div className="flex items-center mt-4">
                              <Checkbox
                                id="editEnableSurroundAI"
                                checked={enableSurroundAI}
                                onCheckedChange={setEnableSurroundAI}
                              />
                              <Label htmlFor="editEnableSurroundAI" className="ml-2">
                                Enable Surround AI
                              </Label>
                            </div>
                            <DialogFooter>
                              <Button onClick={() => setShowSurroundAIConfig(false)}>Done</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <DialogFooter className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                {(currentStep === 2 || currentStep === 3 || currentStep === 4) && (
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    className="border-gray-300 text-gray-700 px-6 py-2"
                  >
                    ← Back
                  </Button>
                )}
                {currentStep === 1 && (
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateUserDialog(false)}
                    className="border-gray-300 text-gray-700 px-6 py-2"
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  onClick={handleCreateUserPipeline}
                  className="bg-[#2196F3] hover:bg-[#1976D2] text-white px-8 py-2 font-medium"
                >
                  {currentStep === 1
                    ? "Create Pipeline"
                    : currentStep === 4
                      ? "Complete Pipeline"
                      : "Next →"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg border border-gray-200">
          <Table
            className="w-full table-fixed"
          >
            <TableHeader>
              <TableRow className="bg-[#2196F3] border-blue-600">
                <TableHead className="text-white font-medium">
                  Pipeline Name
                </TableHead>
                <TableHead className="text-white font-medium">Source</TableHead>
                <TableHead className="text-white font-medium">
                  Destination
                </TableHead>
                <TableHead className="text-white font-medium">
                  Technique
                </TableHead>
                <TableHead className="text-white font-medium">Status</TableHead>
                <TableHead className="text-white font-medium">
                  Created
                </TableHead>
                <TableHead className="text-white font-medium">
                  Actions
                </TableHead>
                <TableHead className="text-white font-medium">
                  Thought Bubble
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pipelineLoading ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center text-gray-500 py-8">
                    Loading pipelines...
                  </TableCell>
                </TableRow>
              ) : pipelineError ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center text-red-500 py-8">
                    Error loading pipelines: {pipelineError.message || 'Unknown error'}
                  </TableCell>
                </TableRow>
              ) : sortedUsers && sortedUsers.length > 0 ? (
                sortedUsers.map((pipeline) => (
                  <TableRow
                    key={pipeline.id}
                    className="bg-white hover:bg-gray-50 border-gray-200"
                  >
                    <TableCell className="font-medium text-gray-900 p-4 text-sm whitespace-nowrap overflow-hidden truncate w-40 cursor-pointer" title={pipeline.name}>
                      {pipeline.name}
                    </TableCell>
                    <TableCell className="text-gray-600 p-4 text-sm whitespace-normal">
                      {pipeline.source}
                    </TableCell>
                    <TableCell className="text-gray-600 p-4 text-sm whitespace-normal">
                      {pipeline.destination}
                    </TableCell>
                    <TableCell className="p-1 text-sm whitespace-normal">{getTechniqueBadge(pipeline.technique)}</TableCell>
                    <TableCell className="p-1 text-sm whitespace-normal">{getStatusBadge(pipeline.status)}</TableCell>
                    <TableCell className="text-gray-600 p-1 text-sm whitespace-normal">
                      {pipeline.created}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleEditPipeline(pipeline)}
                            className="flex items-center gap-2 cursor-pointer hover:bg-blue-50 focus:bg-blue-100 text-gray-700"
                          >
                            <Pencil className="h-4 w-4 text-blue-500" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setViewPipeline(pipeline)}
                            className="flex items-center gap-2 cursor-pointer hover:bg-blue-50 focus:bg-blue-100 text-gray-700"
                          >
                            <Eye className="h-4 w-4 text-blue-500" /> View
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleClonePipeline(pipeline)}
                            className="flex items-center gap-2 cursor-pointer hover:bg-blue-50 focus:bg-blue-100 text-gray-700"
                          >
                            <Copy className="h-4 w-4 text-blue-500" /> Clone
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleRunPipeline(pipeline)}
                            className="flex items-center gap-2 cursor-pointer hover:bg-blue-50 focus:bg-blue-100 text-gray-700"
                          >
                            <RotateCcw className="h-4 w-4 text-blue-500" /> Run Manually
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                    <TableCell className="whitespace-normal p-4 min-w-[100px] max-w-[140px] text-sm flex justify-center items-center">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2 font-semibold text-gray-900 border-gray-300 hover:border-blue-400 hover:bg-blue-50 px-2 py-1 text-sm"
                        onClick={() => {
                          setPromptPipeline(pipeline);
                          setShowPromptListModal(true);
                        }}
                      >
                        <Sparkles className="h-4 w-4 text-purple-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={10} className="text-center text-gray-500 py-8">
                    No pipelines found for the selected workspace.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      {!isApplyingPrompt && !showSuccessTransition && (
        <>
          {/* View Pipeline Modal */}
          <Dialog open={!!viewPipeline} onOpenChange={(open) => { if (!open) setViewPipeline(null); }}>
            <DialogContent className="sm:max-w-[500px] bg-white">
              <DialogHeader>
                <DialogTitle className="text-gray-900">Pipeline Details</DialogTitle>
                <DialogDescription className="text-gray-600">
                  View configuration and details for this pipeline.
                </DialogDescription>
              </DialogHeader>
              {viewPipeline && (
                <div className="space-y-4 py-2">
                  <div><span className="font-semibold">Pipeline Name:</span> {viewPipeline.name}</div>
                  <div><span className="font-semibold">Source:</span> {viewPipeline.source}</div>
                  <div><span className="font-semibold">Destination:</span> {viewPipeline.destination}</div>
                  <div><span className="font-semibold">Technique:</span> {viewPipeline.technique}</div>
                  {/* <div><span className="font-semibold">Agent:</span> {viewPipeline.processingAgent || "Not specified"}</div>
                  <div><span className="font-semibold">Schedule:</span> {viewPipeline.schedule || "Not configured"}</div> */}
                  <div><span className="font-semibold">Status:</span> {viewPipeline.status}</div>
                  <div><span className="font-semibold">Created:</span> {viewPipeline.created}</div>
                </div>
              )}
              <DialogFooter>
                <Button onClick={() => setViewPipeline(null)} className="bg-[#2196F3] hover:bg-[#1976D2] text-white w-full">Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          {/* Edit AI Prompt Modal */}
          <Dialog open={showPromptModal} onOpenChange={setShowPromptModal}>
            <DialogContent className="sm:max-w-[600px] bg-white">
              <DialogHeader>
                <DialogTitle className="text-gray-900">Edit AI Prompt</DialogTitle>
                <DialogDescription className="text-gray-600">
                  You can modify the AI prompt before applying it to the pipeline. The prompt will help optimize your pipeline processing.
                </DialogDescription>
              </DialogHeader>
              <div className="font-semibold text-gray-900 mb-1">Prompt Content</div>
              <div className="text-sm text-gray-600 mb-2">Edit the prompt below to customize how AI will process this pipeline:</div>
              <textarea
                className="w-full border rounded-lg p-3 text-gray-900 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={6}
                value={promptInput}
                onChange={e => setPromptInput(e.target.value)}
                maxLength={1000}
              />
              <div className="text-xs text-gray-400 mt-1">Characters: {promptInput.length}</div>
              <DialogFooter className="mt-4 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowPromptModal(false)}>Cancel</Button>
                <Button
                  className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white"
                  onClick={() => {
                    alert('Apply Prompt clicked');
                    console.log('Apply Prompt button clicked');
                    setShowPromptModal(false);
                    setIsApplyingPrompt(true);
                    setTimeout(() => {
                      setIsApplyingPrompt(false);
                      setShowSuccessTransition(true);
                      setTimeout(() => {
                        setShowSuccessTransition(false);
                        setShowPromptAppliedModal(true);
                      }, 500); // short transition before showing success modal
                    }, 5000); // 5 seconds
                  }}
                >
                  Apply Prompt to Pipeline
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          {/* AI Prompts List Modal */}
          <Dialog open={showPromptListModal} onOpenChange={setShowPromptListModal}>
            <DialogContent className="sm:max-w-[650px] bg-white rounded-lg shadow-lg p-6 m-4">
              <DialogHeader>
                <DialogTitle className="text-gray-900">
                  AI Prompts for {promptPipeline ? promptPipeline.name : "Pipeline"}
                </DialogTitle>
              </DialogHeader>
              {promptPipeline && (() => {
                const { surroundAIPrompt, suggestedPrompt, promptHistory } = getPipelinePrompts(promptPipeline);
                return (
                  <>
                    {/* Suggested Prompt */}
                    <div className="mb-6">
                      <div className="flex items-center mb-2">
                        <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded mr-2">Suggested</span>
                        <span className="text-xs text-gray-400">{surroundAIPrompt.timestamp}</span>
                        <span className="text-xs text-gray-400">{suggestedPrompt.timestamp}</span>
                        {pipelinePrompts[promptPipeline?.id]?.content === suggestedPrompt.content && (
                          <span className="ml-2 bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded">Currently in use</span>
                        )}
                      </div>
                      <div className="bg-blue-50 rounded-lg border border-blue-200 shadow p-5 flex items-start gap-4 mb-4">
                        <span className="flex-shrink-0 bg-purple-100 rounded-full p-3 flex items-center justify-center">
                          <Sparkles className="h-6 w-6 text-purple-500" />
                        </span>
                        <span className="flex-1">
                          <div className="font-bold text-gray-900 text-lg mb-1">{surroundAIPrompt.title}</div>
                          <div className="text-sm text-gray-700 mb-3">{surroundAIPrompt.description}</div>
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold"
                            onClick={() => {
                              const newId = promptPipeline?.id;
                              window.open(`https://octopus-nonred-strlit-czh5frcegse9cwdb.centralus-01.azurewebsites.net/?pipeline_type=redaction&pipeline_id=${encodeURIComponent(newId)}`, '_blank');
                            }}
                          >
                            Open Surround AI
                          </Button>
                        </span>
                      </div>
                      
                      <div className="bg-blue-50 rounded-lg border border-blue-200 shadow p-5 flex items-start gap-4">
                        <span className="flex-shrink-0 bg-purple-100 rounded-full p-3 flex items-center justify-center">
                          <Sparkles className="h-6 w-6 text-purple-500" />
                        </span>
                        <span className="flex-1">
                          <div className="font-bold text-gray-900 text-lg mb-1">{suggestedPrompt.title}</div>
                          <div className="text-sm text-gray-700 mb-3">{suggestedPrompt.description}</div>
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold"
                            disabled={fetchCustomPrompt.isLoading}
                            onClick={handleUsePromptClick}
                          >
                            {fetchCustomPrompt.isPending ? 'Loading...' : 'Use Prompt'}
                          </Button>
                        </span>
                      </div>
                    </div>
                    {/* Prompt Version History */}
                    <div>
                      <div className="font-semibold text-gray-800 mb-3 text-base">Prompt Version History</div>
                      <div className="space-y-4">
                        {promptHistory.map((prompt, idx) => (
                          <div
                            key={prompt.title + prompt.timestamp}
                            className="bg-gray-50 rounded-lg border border-gray-200 shadow-sm p-4 flex items-start gap-3"
                          >
                            <span className="flex-shrink-0 bg-purple-100 rounded-full p-2 flex items-center justify-center">
                              <Sparkles className="h-5 w-5 text-purple-500" />
                            </span>
                            <span className="flex-1">
                              <div className="font-semibold text-gray-900 text-base mb-1">{prompt.title}</div>
                              <div className="text-sm text-gray-600 mb-2">{prompt.description}</div>
                              <div className="text-xs text-gray-400 mb-2">{prompt.timestamp}</div>
                              {pipelinePrompts[promptPipeline?.id]?.content === prompt.content ? (
                                <span className="ml-2 bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded">Currently in use</span>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="mt-1 border-blue-500 text-blue-700 hover:bg-blue-50"
                                  onClick={() => {
                                    setReviewPromptContent(prompt.content);
                                    setReviewPromptPipeline(promptPipeline);
                                    setShowPromptReviewModal(true);
                                    setShowPromptListModal(false);
                                  }}
                                >
                                  Revert to this Prompt
                                </Button>
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                );
              })()}
            </DialogContent>
          </Dialog>
          {/* Prompt Review Modal */}
          <Dialog open={showPromptReviewModal} onOpenChange={setShowPromptReviewModal}>
            <DialogContent className="sm:max-w-[600px] bg-white rounded-lg shadow-lg p-6">
              <DialogHeader>
                <DialogTitle className="text-gray-900">Review & Apply AI Prompt</DialogTitle>
                <DialogDescription className="text-gray-600">
                  Review or edit the prompt before applying it to the pipeline.
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-500">Prompt Content</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1 text-gray-700 hover:text-blue-600"
                  onClick={() => {
                    navigator.clipboard.writeText(reviewPromptContent);
                    toast({ title: "Prompt copied!" });
                  }}
                >
                  <Copy className="h-4 w-4" /> Copy
                </Button>
              </div>
              <textarea
                className="w-full border rounded-lg p-3 text-gray-900 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                rows={6}
                value={reviewPromptContent}
                onChange={e => setReviewPromptContent(e.target.value)}
                maxLength={1000}
              />
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setShowPromptReviewModal(false)}>Cancel</Button>
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={handlePromptClick}
                >
                  Apply Prompt
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          {/* Run Pipeline Modal */}
          <Dialog open={showRunPipelineModal} onOpenChange={setShowRunPipelineModal}>
            <DialogContent className="sm:max-w-[400px] bg-white rounded-lg shadow-lg p-6 flex flex-col items-center">
              <DialogHeader>
                <DialogTitle className="text-gray-900 w-full text-center">
                  {runPipelineStatus === "running" ? "Pipeline Running" : "Pipeline Completed"}
                </DialogTitle>
              </DialogHeader>
              {runPipelineStatus === "running" ? (
                <>
                  <Loader2 className="animate-spin h-12 w-12 text-blue-500 my-6" />
                  <div className="text-gray-700 text-center">Your pipeline is being processed...</div>
                </>
              ) : (
                <>
                  <div className="text-green-600 text-3xl my-6">✔</div>
                  <div className="text-gray-700 text-center mb-2">Pipeline completed successfully!</div>
                  <div className="flex gap-2 mt-2">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setShowRunPipelineModal(false)}>
                      Close
                    </Button>
                    <Button variant="outline" className="flex items-center gap-2" onClick={() => {
                      setRunPipelineStatus("running");
                      if (runTimeoutRef.current) clearTimeout(runTimeoutRef.current);
                      runTimeoutRef.current = setTimeout(() => {
                        setRunPipelineStatus("completed");
                        setPipelines(users => users.map(p =>
                          p.id === (reviewPromptPipeline?.id || promptPipeline?.id) ? { ...p, status: "Completed" } : p
                        ));
                      }, 2500);
                    }}>
                      <RotateCcw className="h-4 w-4 text-blue-500" /> Re-run
                    </Button>
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>
          {/* Prompt Applied Confirmation Modal */}
          <Dialog open={showPromptAppliedModal} onOpenChange={setShowPromptAppliedModal}>
            <DialogContent className="sm:max-w-[400px] bg-white rounded-lg shadow-lg p-6 flex flex-col items-center">
              <DialogHeader>
                <DialogTitle className="text-gray-900 w-full text-center">Changes Applied</DialogTitle>
              </DialogHeader>
              <div className="text-gray-700 text-center my-4">The prompt has been applied and the pipeline configuration is updated.</div>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white mt-2" onClick={() => setShowPromptAppliedModal(false)}>
                Close
              </Button>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}

export default UserManagement;
