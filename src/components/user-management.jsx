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
  RefreshCcw,
  AlertTriangle,
  Trash2 as Trash,
  RotateCcw,
  Database,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Textarea } from "../components/ui/textarea";
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
import SurroundAIWidget from './surroundAI-widget';
import { CSSTransition } from 'react-transition-group';
import useFetchSources from "../hooks/useFetchSources";
import useSavePipeline from "../hooks/useSavePipeline";
import useFetchPipeline from "../hooks/useFetchPipeline";
import useFetchCustomPrompt from "../hooks/useFetchCustomPrompt";
import {useListAzureBlobFiles} from "../hooks/useListAzureBlobFiles";
import { useClonePipeline } from "../hooks/useSavePipeline";
import useFetchPromptHistory from '../hooks/useFetchPromptHistory';
// Custom prompt fetch hook
// Handler for Use Prompt button
import { useSelector } from "react-redux";
import usePatchPipeline from '../hooks/usePatchPipeline';
import { format } from 'date-fns';

import { BACKEND_URL } from '../constants';
import { PipelineDetailsModal } from './pipeline-details-modal';
import useDeletePipeline from "../hooks/useDeletePipeline";


function UserManagement() {
  const [sourceError, setSourceError] = useState(false);
  const [techniquesError, setTechniquesError] = useState(false);
  const [destinationError, setDestinationError] = useState(false);
  const [nameError, setNameError] = useState(false);
  const [agentError, setAgentError] = useState(false);
  const [scheduleError, setScheduleError] = useState(false);
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
  const [showSurroundAI, setShowSurroundAI] = useState(false);
  const [pipelineForWidget, setPipelineForWidget] = useState(null);
  const [showSurroundAIConfig, setShowSurroundAIConfig] = useState(false);
  const workspaces = useSelector((state) => state.workspaces.workspaces);
  const { mutate: deletePipeline } = useDeletePipeline();
  // NEW: delete-confirmation state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pipelineToDelete, setPipelineToDelete] = useState(null);

  const [selectedWorkspace, setSelectedWorkspace] = useState(() => {
    // Only set the first workspace if workspaces array exists and has items
    return workspaces && workspaces.length > 0 ? workspaces[0] || "" : "";
  });

  // Fetch available sources for the selected workspace
  const { sources: availableSources, isLoading: sourcesLoading, error: sourcesError } = useFetchSources(selectedWorkspace.id);
  const { sources: pipelineSources,
    isLoading: pipelineLoading,
    error: pipelineError,
    refetch: refetchPipelines } = useFetchPipeline(selectedWorkspace.id);
  const {
    promptHistory: promptHistory,
    isLoading: promptHistoryLoading,
    error: promptHistoryError,
    refetch: refetchPromptHistory } = useFetchPromptHistory(promptPipeline?.id || "");  const [numRows, setNumRows] = useState("");
  const [useAllRows, setUseAllRows] = useState(false);
  const savePipeline = useSavePipeline();
  const patchPipeline = usePatchPipeline();
    const [techniqueToShow, setTechniqueToShow] = useState(null);
    const [selectedSource, setSelectedSource] = useState(null);
    const [tableSearchQuery, setTableSearchQuery] = useState("");
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [azureFiles, setAzureFiles] = useState([]);
    const [isAzureFilesLoaded, setIsAzureFilesLoaded] = useState(false);
    const listAzureBlobFiles = useListAzureBlobFiles();
    const [dataSelectionOptions, setDataSelectionOptions] = useState({
          selectionMode: "all",
          selectedTables: [],
          expandedTables: [],
          customQuery: ""
    });


  const fetchCustomPrompt = useFetchCustomPrompt();

  // Set the first workspace when workspaces are loaded
  useEffect(() => {
    if (workspaces && workspaces.length > 0 && !selectedWorkspace) {
      setSelectedWorkspace(workspaces[0] || "");
    }
  }, [workspaces, selectedWorkspace]);

  useEffect(() => {
    if (savePipeline.isSuccess || patchPipeline.isSuccess) {
      refetchPipelines();
    }
  }, [savePipeline.isSuccess, patchPipeline.isSuccess]);

  // Fetch prompt history when a pipeline is opened
  useEffect(() => {
    if (promptPipeline?.id) {
      refetchPromptHistory();
    }
  }, [promptPipeline]);

  // Sample user data with medical context (fallback for demo)
  const [pipelines, setPipelines] = useState([]);

  const [newUser, setNewUser] = useState({
    name: "",
    sourceDatabase: "",
    sourceDatabaseId: "",
    destinationDatabase: "",
    destinationDatabaseId: "",
    techniques: [],
    status: "Active",
    customPrompt: "",
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

  const { mutateAsync: clonePipeline } = useClonePipeline();

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

  const techniqueOptions = (source) => {
    if(source === null){
      setTechniqueToShow(null);
      return;
    }
    if(source?.configuration?.sourceType === "files" || source?.configuration?.sourceType === "sharepoint"){
      setTechniqueToShow([
        { id: "Masking", label: "Masking" }
      ]);
    }else{
      setTechniqueToShow([
        { id: "Masking", label: "Masking" },
        {
          id: "Anonymization",
          label: "Anonymization",
        },
        { id: "Generate", label: "Generate" },
      ]);
    }
  }

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

  function handleUsePromptClick() {
    if (!promptPipeline || !promptPipeline.id || !promptPipeline.processing_agent) return;
    fetchCustomPrompt.mutate({
      pipelineID: promptPipeline.id,
      agentType: promptPipeline.processingAgent || promptPipeline.processing_agent || ""
    },
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
    const pipelineId = reviewPromptPipeline?.id || promptPipeline?.id;

    // Find the pipeline object to patch
    const pipelineObj =
      pipelines.find((p) => p.id === pipelineId) ||
      pipelineSources?.find((p) => p.id === pipelineId);
    // Get user email (assuming pipeline object has user_id or email field)
    const userEmail = pipelineObj?.user_id || pipelineObj?.email;
    if (pipelineObj && userEmail) {
      // Patch the pipeline with the new prompt content
      patchPipeline.mutate(
        {
          email: userEmail,
          pipelineId: pipelineId,
          pipeline: {
            ...pipelineObj,
            customPrompt: reviewPromptContent,
          },
        },
        {
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
            toast({
              title: "Failed to update pipeline",
              description: err?.message || "Unknown error",
              variant: "destructive",
            });
          },
        }
      );
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
      active: { className: "bg-[#4CAF50] text-white", label: "Created" },
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
      generate: { className: "bg-[#FF9800] text-white", label: "Masking" },
    };

    let config;
    if (technique && techniqueConfig[technique.toLowerCase()]) {
      config = techniqueConfig[technique.toLowerCase()];
    } else {
      config = {
        className: "bg-gray-300 text-gray-800",
        label: technique || "Unknown",
      };
    }

    return (
      <Badge className={`${config.className} text-xs px-2 py-1 rounded-md`}>
        {config.label}
      </Badge>
    );
  };


  const handleCreateUserPipeline = async () => {
    if (currentStep === 1) {
      if (!newUser.name) {
        setNameError(true);
        toast({
          title: "Validation Error",
          description: "Please enter a pipeline name",
          variant: "destructive",
        });
        return;
      }
      setNameError(false);
      setCurrentStep(2);
      return;
    }

    if (currentStep === 2) {
      let hasError = false;

      if (!newUser.sourceDatabase) {
        setSourceError(true);
        hasError = true;
      } else {
        setSourceError(false);
      }

      const destinationValid =
        destinationType === "connection"
          ? connectionString.trim() !== ""
          : newUser.destinationDatabase !== "";

      if (!destinationValid) {
        setDestinationError(true);
        hasError = true;
      } else {
        setDestinationError(false);
      }

      if (selectedTechniques.length === 0) {
        setTechniquesError(true);
        hasError = true;
      } else {
        setTechniquesError(false);
      }

      if (hasError) {
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
      // Skip Processing Agent step unless source type is files
      const srcType = selectedSource?.configuration?.sourceType;
      if (srcType === 'files' || srcType === 'sharepoint') {
        setCurrentStep(4);
      } else {
        setCurrentStep(5);
      }
      return;
    }

    if (currentStep === 4) {
      if (!selectedProcessingAgent && !isEditing) {
        setAgentError(true);
        toast({
          title: "Validation Error",
          description: "Please select a processing agent",
          variant: "destructive",
        });
        return;
      }
      setAgentError(false);
      setCurrentStep(5);
      return;
    }

    if (currentStep === 5) {
      if (!runConfiguration.schedule) {
        setScheduleError(true);
        toast({
          title: "Validation Error",
          description: "Please select a run schedule",
          variant: "destructive",
        });
        return;
      }
      setScheduleError(false);

      // Find source and destination IDs from availableSources
      let sourceId = "",
        destId = "";
      if (Array.isArray(availableSources)) {
        const srcObj = availableSources.find(
          (src) => src?.configuration?.sourceName === newUser.sourceDatabase
        );
        sourceId = srcObj?.id;
        const dstObj = availableSources.find(
          (src) =>
            src?.configuration?.sourceName === newUser.destinationDatabase
        );
        destId = dstObj?.id || "";
      }

      const pipeline = {
        ...(isEditing && editPipeline ? { id: editPipeline.id } : {}),
        name: newUser.name,
        source: newUser.sourceDatabase,
        sourceDatabaseId: sourceId,
        destination:
          destinationType === "connection"
            ? connectionString
            : newUser.destinationDatabase,
        destinationDatabaseId: destinationType === "connection" ? "" : destId,
        technique: selectedTechniques.join(", "),
        processingAgent: selectedProcessingAgent,
        data_selection_mode: dataSelectionOptions.selectionMode,
        selected_tables: dataSelectionOptions.selectedTables,
        expandedTables: dataSelectionOptions.expandedTables,
        customQuery: dataSelectionOptions.customQuery,
        customPrompt: newUser.customPrompt,
        schedule: runConfiguration.schedule,
        notifications: runConfiguration.notifications,
        auto_close: runConfiguration.autoClose,
        enable_surround_AI: enableSurroundAI,
        status: newUser.status || "Active",
        workspaceID: selectedWorkspace.id,
        workspaceName: selectedWorkspace.workspaceName,
        created:
          isEditing && editPipeline
            ? editPipeline.created
            : new Date().toLocaleDateString(),
        destinationType,
        connectionString,
      };

      if (isEditing && editPipeline) {
        const userEmail =
          editPipeline.user_id || editPipeline.email || "unknown@example.com";

        patchPipeline.mutate(
          {
            email: userEmail,
            pipelineId: editPipeline.id,
            pipeline,
          },
          {
            onSuccess: (data) => {
              toast({
                title: "Pipeline Updated",
                description: `${data.name} has been updated.`,
                variant: "success",
              });
              setPipelines((users) =>
                users.map((u) => (u.id === data.id ? data : u))
              );
              if (pipeline.schedule === "immediate") {
                handleRunPipeline(data);
              }
              resetForm();
              setShowCreateUserDialog(false);
              setIsEditing(false);
              setEditPipeline(null);
            },
            onError: (error) => {
              toast({
                title: "API Error",
                description:
                  error?.message || "Failed to update pipeline on server.",
                variant: "destructive",
              });
            },
          }
        );
      } else {
        savePipeline.mutateAsync(pipeline, {
          onSuccess: (data) => {
            toast({
              title: "Pipeline Created",
              description: `${data.name} has been added successfully.`,
              variant: "success",
            });
            setPipelines([...pipelines, data]);
            if (pipeline.schedule === "immediate") {
              handleRunPipeline(data);
            }
            resetForm();
            setShowCreateUserDialog(false);
          },
          onError: (error) => {
            toast({
              title: "API Error",
              description:
                error?.message || "Failed to save pipeline to server.",
              variant: "destructive",
            });
          },
        });
      }
    }
  };

  const resetForm = () => {
    setNewUser({
      name: "",
      sourceDatabase: "",
      sourceDatabaseId: "",
      destinationDatabase: "",
      destinationDatabaseId: "",
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
      autoClose: false,
    });
    setEnableSurroundAI(false);
    setNameError(false);
    setSourceError(false);
    setTechniquesError(false);
    setDestinationError(false);
    setAgentError(false);
    setScheduleError(false);
    setTechniqueToShow(null);
    setDataSelectionOptions({
      selectionMode: "all",
      selectedTables: [],
      expandedTables: [],
      customQuery: "",
    });
    setTableSearchQuery("");
    setUploadedFiles([]);
    setAzureFiles([]);
    setIsAzureFilesLoaded(false);
  };


const handleBack = () => {
    if (currentStep === 2) {
      setSourceError(false);
      setDestinationError(false);
      setTechniquesError(false);
      setTechniqueToShow(null);
    }
    if (currentStep === 3) {
      setAgentError(false);
    }
    if (currentStep === 4) {
      setScheduleError(false);
    }
    // If skipping Processing Agent step, back from final step should go to Data Selection
    if (currentStep === 5) {
      const srcType = selectedSource?.configuration?.sourceType;
      if (srcType !== 'files') {
        setScheduleError(false);
        setCurrentStep(3);
        return;
      }
    }
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleOpenSurroundAI = (pipeline) => {
    setShowSurroundAI(true);
    setPipelineForWidget(pipeline);
    setShowPromptListModal(false);
  };

 const handleTechniqueToggle = (technique) => {
  setSelectedTechniques((prev) => {
    const updated = prev.includes(technique)
      ? prev.filter((t) => t !== technique)
      : [...prev, technique];

      //  Clear error when at least one technique is selected
      if (updated.length > 0) {
        setTechniquesError(false);
      }

      return updated;
    });
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

  const handleClonePipeline = async (pipeline) => {
    try {
      const cloned = await clonePipeline({ user_id: pipeline.user_id, pipeline_id: pipeline.id });
      await refetchPipelines();
      toast({
        title: "Pipeline Cloned",
        description: (
          <span>
            <b>{cloned.name}</b> was created successfully.
          </span>
        ),
      });
    } catch (err) {
      toast({
        title: "Clone Failed",
        description: err.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  // Open the confirm dialog
const openDeleteConfirm = (pipeline) => {
  const userId = pipeline?.user_id;
  if (!userId) {
    toast({ title: "Delete failed", description: "user_id missing on pipeline.", variant: "destructive" });
    return;
  }
  setPipelineToDelete(pipeline);
  setDeleteOpen(true);
};

// Execute deletion after user confirms
const confirmDelete = () => {
  if (!pipelineToDelete) return;
  const userId = pipelineToDelete.user_id;

  deletePipeline(
    { id: pipelineToDelete.id, email: userId },
    {
      onSuccess: () => {
        toast({ title: "Pipeline deleted", description: `${pipelineToDelete.name} was removed.` });
        setDeleteOpen(false);
        setPipelineToDelete(null);
        refetchPipelines();
      },
      onError: (e) => {
        toast({ title: "Delete failed", description: e?.message || "Unknown error", variant: "destructive" });
      }
    }
  );
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
      sourceDatabaseId: pipeline.sourceDatabaseId || "",
      destinationDatabaseId: pipeline.destinationDatabaseId || "",
      destinationDatabase: pipeline.destination || "",
      techniques: pipeline.technique ? pipeline.technique.split(", ") : [],
      customPrompt: pipeline.customPrompt || "",
      status: pipeline.status,
    });
    setSelectedTechniques(
      pipeline.technique ? pipeline.technique.split(", ") : []
    );
    setDestinationType(pipeline.destinationType || "dataset");
    setConnectionString(
      pipeline.destinationType === "connection" ? pipeline.connectionString : ""
    );
    setSelectedProcessingAgent(
      pipeline.processingAgent || pipeline.processing_agent || ""
    );
    setRunConfiguration({
      schedule: pipeline.schedule || "",
      notifications: pipeline.notifications || false,
      autoClose: pipeline.auto_close || pipeline.autoClose || false,
    });
    setEnableSurroundAI(!!pipeline.enable_surround_AI);
    // Initialize selectedSource and load its techniques for editing
    const sourceObject = availableSources.find(
      (s) => s?.configuration?.sourceName === pipeline.source
    );
    setSelectedSource(sourceObject);
    techniqueOptions(sourceObject);
    setDataSelectionOptions({
      selectionMode: pipeline.data_selection_mode || "all",
      selectedTables: pipeline.selected_tables || [],
      expandedTables: pipeline.expandedTables || [],
      customQuery: pipeline.customQuery || "",
    });
  };

  const getDataSelectionOptions = (sourceType) => {
      switch (sourceType) {
        case "sql":
        case "oracle":
        case "postgresql":
          return [
            {
              value: "all",
              label: "Select All Tables - Extract all tables from the database",
            },
            {
              value: "specific",
              label: "List Specific Tables - Choose individual tables to extract",
            },
            {
              value: "query",
              label:
                "Write a Query - Custom SQL to filter or join data as needed",
            },
          ];
        case "mongodb":
          return [
            {
              value: "all",
              label: "Select All Collections",
            },
            {
              value: "specific",
              label: "Select Specific Collections",
            },
            {
              value: "query",
              label: "Write an Aggregation Pipeline (optional advanced)",
            },
          ];
        case "files":
          return [
            {
              value: "all",
              label: "Upload Entire File - CSV/Excel/JSON/Parquet",
            },
            {
              value: "specific",
              label: "Select Specific Sheets/Columns - For Excel or structured formats",
            },
          ];
        case "blob":
          return [
            {
              value: "all",
              label: "Ingest All Files - From a container or path prefix",
            },
            {
              value: "specific",
              label: "Select Files - Individual files or via pattern matching",
            },
            {
              value: "query",
              label: "Filter by Metadata - Ingest only recent/active/flagged",
            },
          ];
        case "rest":
          return [
            {
              value: "all",
              label: "Full Endpoint - Ingest entire API response",
            },
            {
              value: "specific",
              label: "Specify Resource Paths - Choose specific endpoints",
            },
            {
              value: "query",
              label: "Write Custom Request - Compose full request with params/body",
            },
          ];
        case "datawarehouse":
          return [
            {
              value: "all",
              label:
                "Select All Tables / Datasets - Ingest all tables from a schema or project",
            },
            {
              value: "specific",
              label: "Choose Specific Tables - Pick tables manually",
            },
            {
              value: "query",
              label:
                "Write SQL Query - Extract with complex joins or aggregations",
            },
          ];
        default:
          return [
            {
              value: "all",
              label:
                "Select All Data - Extract all available data from this source",
            },
            {
              value: "specific",
              label: "Select Specific Items - Choose individual items to extract",
            },
            {
              value: "query",
              label:
                "Custom Query - Write custom logic to filter or transform data",
            },
          ];
      }
    };
  
    const renderDataSelectionStep = (sourceType) => {
        if (!sourceType) {
          return (
            <div className="text-center py-8">
              <p className="text-gray-500">
                Please complete the previous steps to continue
              </p>
            </div>
          );
        }
    
        // Get appropriate terminology based on source type
        const getItemTerminology = (sourceType) => {
          switch (sourceType) {
            case "mongodb":
              return {
                single: "collection",
                plural: "collections",
                field: "field",
                fields: "fields",
              };
            case "files":
            case "blob":
              return {
                single: "file",
                plural: "files",
                field: "property",
                fields: "properties",
              };
            case "rest":
              return {
                single: "endpoint",
                plural: "endpoints",
                field: "field",
                fields: "fields",
              };
            case "datawarehouse":
              return {
                single: "dataset",
                plural: "datasets",
                field: "column",
                fields: "columns",
              };
            default:
              return {
                single: "table",
                plural: "tables",
                field: "column",
                fields: "columns",
              };
          }
        };
        const getFilesListSection = () => {
    
          return (
            <div className="mt-4">
              {/* Title + Radio Buttons Row */}
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center space-x-6">
                  <p className="text-sm font-medium text-gray-900">
                    Select Files: <span className="text-gray-500">({dataSelectionOptions.selectedTables.length} selected)</span>
                  </p>
                  <label className="inline-flex items-center space-x-1 text-sm">
                    <input
                      type="radio"
                      name="fileSelection"
                      value="selectAll"
                      onChange={() => setDataSelectionOptions({ ...dataSelectionOptions, selectedTables: [...azureFiles] })}
                      checked={dataSelectionOptions.selectedTables.length === azureFiles.length}
                    />
                    <span>Select All</span>
                  </label>
                  <label className="inline-flex items-center space-x-1 text-sm">
                    <input
                      type="radio"
                      name="fileSelection"
                      value="unselectAll"
                      onChange={() => setDataSelectionOptions({ ...dataSelectionOptions, selectedTables: [] })}
                      checked={dataSelectionOptions.selectedTables.length === 0}
                    />
                    <span>Unselect All</span>
                  </label>
                </div>
              </div>
    
              {/* File List */}
              <div className="max-h-64 overflow-y-auto border rounded p-2 bg-gray-50">
                {azureFiles.map((file) => (
                  <label key={file} className="flex items-center space-x-2 mb-1">
                    <input
                      type="checkbox"
                      checked={dataSelectionOptions.selectedTables.includes(file)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setDataSelectionOptions({ ...dataSelectionOptions, selectedTables: [...dataSelectionOptions.selectedTables, file] });
                        } else {
                          setDataSelectionOptions({ ...dataSelectionOptions, selectedTables: dataSelectionOptions.selectedTables.filter((f) => f !== file) });
                        }
                      }}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-xs text-gray-700">{file}</span>
                  </label>
                ))}
              </div>
            </div>
          );
        };
    
        // Get query-related helpers
        const getQueryDescription = (sourceType) => {
          switch (sourceType) {
            case "mongodb":
              return "Write a MongoDB aggregation pipeline to filter and transform your data:";
            case "files":
              return "Define file parsing rules including file type, schema, and delimiters:";
            case "blob":
              return "Define file parsing rules including schema, encoding, and structure settings:";
            case "rest":
              return "Write custom API request configuration with parameters, headers, and HTTP methods:";
            default:
              return "Write a custom SQL query to extract specific data:";
          }
        };
    
        const getQueryEditorTitle = (sourceType) => {
          switch (sourceType) {
            case "mongodb":
              return "MongoDB Pipeline Editor";
            case "files":
              return "File Parsing Rules Editor";
            case "blob":
              return "Blob Parsing Rules Editor";
            case "rest":
              return "API Request Editor";
            default:
              return "SQL Query Editor";
          }
        };
    
        const getQueryPlaceholder = (sourceType) => {
          switch (sourceType) {
            case "mongodb":
              return '[{"$match": {"field": "value"}}, {"$group": {...}}]';
            case "files":
              return '{\n  "fileType": "CSV",\n  "delimiter": ",",\n  "encoding": "UTF-8",\n  "hasHeader": true\n}';
            case "blob":
              return '{\n  "containerName": "data",\n  "filePattern": "*.json",\n  "encoding": "UTF-8"\n}';
            case "rest":
              return '{\n  "method": "GET",\n  "headers": {"Authorization": "Bearer token"},\n  "params": {"limit": 100}\n}';
            default:
              return "SELECT * FROM table_name WHERE condition";
          }
        };
    
        const getQueryType = (sourceType) => {
          switch (sourceType) {
            case "mongodb":
              return "Pipeline";
            case "files":
            case "blob":
              return "Parsing Rules";
            case "rest":
              return "API Request";
            default:
              return "Query";
          }
        };
    
        const terminology = getItemTerminology(sourceType);
    
    
    
        return (
          <div className="space-y-6">
            <div className="border rounded-md p-5 bg-gradient-to-r from-blue-50 to-white border-gray-200">
              <h4 className="text-md font-medium mb-3 text-gray-900">
                Data Selection Mode
              </h4>
              <p className="text-sm text-gray-600 mb-4">
                Choose how you want to extract data from your{" "}
                {sourceType.toUpperCase()} source.
              </p>
    
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="select-all"
                    name="selection-mode"
                    value="all"
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    checked={dataSelectionOptions.selectionMode === "all"}
                    onChange={() => setDataSelectionOptions({ ...dataSelectionOptions, selectionMode: "all" })}
                  />
                  <label
                    htmlFor="select-all"
                    className="text-sm font-medium text-gray-900"
                  >
                    {getDataSelectionOptions(sourceType)[0]?.label || "Select All Data"}
                  </label>
                </div>
    
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="select-specific"
                    name="selection-mode"
                    value="specific"
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    checked={dataSelectionOptions.selectionMode === "specific"}
                    onChange={() => setDataSelectionOptions({ ...dataSelectionOptions, selectionMode: "specific" })}
                  />
                  <label
                    htmlFor="select-specific"
                    className="text-sm font-medium text-gray-900"
                  >
                    {getDataSelectionOptions(sourceType)[1]?.label || "Select Specific Items"}
                  </label>
                </div>

                {sourceType !== "files" && (
                  <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="select-query"
                    name="selection-mode"
                    value="query"
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    checked={dataSelectionOptions.selectionMode === "query"}
                    onChange={() => setDataSelectionOptions({ ...dataSelectionOptions, selectionMode: "query" })}
                  />
                  <label
                    htmlFor="select-query"
                    className="text-sm font-medium text-gray-900"
                  >
                    {getDataSelectionOptions(sourceType)[2]?.label || "Custom Query"}
                  </label>
                </div>
              )}
              </div>
    
              {/* Show appropriate UI based on selection mode */}
              <div className="mt-6">
                {dataSelectionOptions.selectionMode === "all" && sourceType === "files" && (
                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-md border border-gray-200">
                      <p className="text-sm text-gray-600">
                        All files will be uploaded and processed. Choose your file below:
                      </p>
                    </div>
                  </div>
                )}
    
                {dataSelectionOptions.selectionMode === "all" && sourceType !== "files" && (
                  <div className="bg-white p-4 rounded-md border border-gray-200">
                    <p className="text-sm text-gray-600">
                      All available {terminology.plural} will be extracted from this
                      source during data collection. This may include a large amount
                      of data depending on the source size.
                    </p>
                  </div>
                )}
    
                {dataSelectionOptions.selectionMode === "specific" && sourceType === "files" && (
                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-md border border-gray-200">
                      {/* Azure Blob Storage: List files for selection */}
                      {selectedSource?.configuration?.location === "cloud" && selectedSource?.configuration?.cloudProvider === "azure" ? (
                        <>
                          <div className="flex justify-end mt-4">
                            <button
                              type="button"
                              className="mb-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                              disabled={listAzureBlobFiles.isLoading}
                              onClick={() => {
                                handleListFilesButtonClick({
                                  connectionString: selectedSource?.configuration?.connectionString,
                                  containerName: selectedSource?.configuration?.containerName,
                                  blobPath: selectedSource?.configuration?.pathPrefix,
                                  fileType: selectedSource?.configuration?.fileFormat
                                });
                              }}
                            >
                              {listAzureBlobFiles.isLoading ? (
                                "Loading Files..."
                              ) : (
                                <RefreshCcw className="w-4 h-4" />
                              )}
                            </button>
    
                          </div>
                          {isAzureFilesLoaded && azureFiles.length > 0 && getFilesListSection()}
                        </>
                      ) : (
                        // Fallback: original file upload logic for on-prem or non-Azure
                        <>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
                            <div className="text-center">
                              <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                              </svg>
                              <label htmlFor="specific-file-upload" className="cursor-pointer">
                                <span className="text-sm font-medium text-gray-900">Upload Excel or CSV file</span>
                                <input
                                  id="specific-file-upload"
                                  type="file"
                                  className="sr-only"
                                  accept=".xlsx,.xls,.csv"
                                  onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                      // Simulate sheet/column detection
                                      setDataSelectionOptions({ ...dataSelectionOptions, selectedTables: ["Sheet1", "Sheet2", "Data"] });
                                      setDataSelectionOptions({ ...dataSelectionOptions, expandedTables: ["Sheet1"] });
                                    }
                                  }}
                                />
                              </label>
                              <p className="text-xs text-gray-500 mt-1">Excel or CSV files only</p>
                            </div>
                          </div>
                          {/* Sheet/Column Selection (appears after file upload) */}
                          {dataSelectionOptions.selectedTables.length > 0 && (
                            <div className="mt-4 space-y-3">
                              <p className="text-sm font-medium text-gray-900">Select Sheets and Columns:</p>
                              {dataSelectionOptions.selectedTables.map((sheet) => (
                                <div key={sheet} className="border border-gray-200 rounded-lg p-3 bg-white">
                                  <div className="flex items-center justify-between mb-2">
                                    <label className="flex items-center space-x-2">
                                      <input
                                        type="checkbox"
                                        defaultChecked
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                      />
                                      <span className="text-sm font-medium text-gray-900">{sheet}</span>
                                    </label>
                                    <button
                                      onClick={() => {
                                        setDataSelectionOptions({ ...dataSelectionOptions, expandedTables: ((prev =>
                                          prev.includes(sheet)
                                            ? prev.filter(t => t !== sheet)
                                            : [...prev, sheet]
                                        )) });
                                      }}
                                      className="text-blue-600 text-xs hover:text-blue-800"
                                    >
                                      {dataSelectionOptions.expandedTables.includes(sheet) ? "Hide Columns" : "Show Columns"}
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}
    
                {dataSelectionOptions.selectionMode === "specific" && sourceType !== "files" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-900">
                        Step 1: Select{" "}
                        {terminology.plural.charAt(0).toUpperCase() +
                          terminology.plural.slice(1)}
                      </p>
                      <div className="space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDataSelectionOptions({ ...dataSelectionOptions, selectedTables: [] })}
                          className="text-xs border-gray-200 text-gray-600 hover:bg-blue-50"
                        >
                          Clear All
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            console.log("Select All Tables Clicked");
                            
                          }}
                          className="text-xs border-gray-200 text-gray-600 hover:bg-blue-50"
                        >
                          Select All
                        </Button>
                      </div>
                    </div>
    
                    {/* Search bar for filtering tables */}
                    <div className="mb-2">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg
                            className="h-5 w-5 text-gray-500"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <input
                          type="text"
                          className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md bg-white text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder={`Search ${terminology.plural}...`}
                          value={tableSearchQuery}
                          onChange={(e) => setTableSearchQuery(e.target.value)}
                        />
                      </div>
                    </div>
    
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-sm text-gray-900">
                        {dataSelectionOptions.selectedTables.length} {terminology.plural} selected
                      </span>
                    </div>
                  </div>
                )}
    
                {dataSelectionOptions.selectionMode === "query" && (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-900">
                      {getQueryDescription(sourceType)}
                    </p>
                    <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
                      <div className="flex items-center justify-between px-3 py-1 border-b border-gray-200 bg-gray-50">
                        <span className="text-xs text-gray-700">
                          {getQueryEditorTitle(sourceType)}
                        </span>
                        <div className="flex space-x-1">
                          <div className="w-3 h-3 rounded-full bg-red-500"></div>
                          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        </div>
                      </div>
                      <Textarea
                        value={dataSelectionOptions.customQuery}
                        onChange={(e) => setDataSelectionOptions({ ...dataSelectionOptions, customQuery: e.target.value })}
                        className="font-mono text-sm !text-gray-900 !bg-white border-0 focus:ring-0 h-40 resize-none p-3 placeholder:!text-gray-500"
                        style={{
                          backgroundColor: "white !important",
                          color: "#111827 !important",
                        }}
                        placeholder={getQueryPlaceholder(sourceType)}
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs border-blue-500 text-blue-600 hover:bg-blue-50"
                        onClick={() => {
                          // In a real implementation, this would validate the query
                          toast({
                            title: `${getQueryType(sourceType)} syntax looks good`,
                            description: `The ${getQueryType(sourceType).toLowerCase()} has been validated.`,
                          });
                        }}
                      >
                        Validate {getQueryType(sourceType)}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
    
            <div className="bg-gradient-to-r from-blue-50 to-white p-4 rounded-md border border-blue-200">
              <div className="flex items-start gap-3">
                <div className="mt-1 bg-white p-2 rounded-full border border-blue-300">
                  <Database className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-md font-medium text-gray-900">
                    Ready to Configure Data Source
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Your data selection is configured. In the next step, you'll
                    confirm your selections before we start connecting and
                    processing your data.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      };
  
      const handleListFilesButtonClick = async () => {
          const connectionString = selectedSource?.configuration?.connectionString;
          const containerName = selectedSource?.configuration?.containerName;
          const blobPath = selectedSource?.configuration?.pathPrefix;
          const fileType = selectedSource?.configuration?.fileFormat;
          if (!connectionString || !containerName || !fileType) {
            return;
          }
          listAzureBlobFiles.mutate(
            { connectionString, containerName, blobPath: blobPath || "", fileType },
            {
              onSuccess: (data) => {
                if (data.success && Array.isArray(data.files)) {
                  setAzureFiles(data.files);
                  setIsAzureFilesLoaded(true);
                  setDataSelectionOptions({ ...dataSelectionOptions, selectedTables: data.files });
                } else {
                  setAzureFiles([]);
                  setIsAzureFilesLoaded(false);
                  toast({
                    title: "No files found",
                    description: "No files of the selected type were found in the container.",
                    variant: "destructive",
                  });
                }
              },
              onError: (error) => {
                setAzureFiles([]);
                setIsAzureFilesLoaded(false);
                toast({
                  title: "Error listing files",
                  description: error?.response?.data?.message || error.message || "Could not list files from Azure Blob Storage.",
                  variant: "destructive",
                });
              },
            }
          );
        }

         useEffect(() => {
    const currentSourceType = selectedSource?.configuration?.sourceType;
    const currentLocation = selectedSource?.configuration?.location;
    const connectionString = selectedSource?.configuration?.connectionString;
    const containerName = selectedSource?.configuration?.containerName;
    const blobPath = selectedSource?.configuration?.pathPrefix;
    const fileType = selectedSource?.configuration?.fileFormat;
    const cloudProvider = selectedSource?.configuration?.cloudProvider;
    if (
      currentStep === 3 &&
      dataSelectionOptions.selectionMode === "specific" &&
      currentSourceType === "files" &&
      currentLocation === "cloud" &&
      cloudProvider === "azure" &&
      azureFiles.length > 0 &&
      fileType &&
      containerName &&
      blobPath &&
      cloudProvider&&
      connectionString

    ) {
      handleListFilesButtonClick({
        connectionString,
        containerName,
        blobPath,
        fileType
      });
    }
  }, [
    currentStep,
    dataSelectionOptions.selectionMode,
    azureFiles.length,
    selectedSource
  ]);

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
          <div
            style={{
              color: "#1e293b",
              fontSize: 20,
              fontWeight: 500,
              textAlign: "center",
            }}
          >
            Updating prompt and applying changes to the pipeline…
          </div>
        </div>
      </CSSTransition>
      {/* Header Section - Medical theme with blue gradient */}
      <div className="bg-gradient-to-r from-[#2196F3] to-[#1976D2] text-white p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Pipeline Management</h1>
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
            <label
              htmlFor="workspace-select"
              className="text-sm font-medium text-gray-700"
            >
              Workspace:
            </label>
            <select
              id="workspace-select"
              className="border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedWorkspace.id}
              onChange={(e) =>
                setSelectedWorkspace(
                  workspaces.find((ws) => ws.id === e.target.value)
                )
              }
            >
              {!selectedWorkspace && (
                <option value="" disabled>
                  Select a workspace
                </option>
              )}
              {workspaces.map((ws) => (
                <option key={ws.id} value={ws.id}>
                  {ws.workspaceName || ws.name || ws.id}
                </option>
              ))}
            </select>
          </div>
           {/* Create Pipeline and Refresh Buttons */}
          <div className="flex items-center gap-2">
                          <Button
                onClick={() => {
                  refetchPipelines();
                  toast({
                    title: "Refreshing pipelines...",
                    description: "Pipeline list is being updated.",
                  });
                }}
                className="bg-white hover:bg-gray-50 text-[#2196F3] border border-[#2196F3] flex items-center gap-2 rounded-md"
                disabled={pipelineLoading}
              >
                <RefreshCcw className={`h-4 w-4 text-[#2196F3] ${pipelineLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
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
            <DialogContent className="sm:max-w-[600px] bg-white max-h-[85vh] flex flex-col">
                <DialogHeader className="flex-shrink-0">
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
                {currentStep === 4 && selectedSource?.configuration?.sourceType === 'files' && (
                  <div className="text-right text-sm text-gray-500">
                    Step 4 of 6
                  </div>
                )}
                <DialogDescription className="text-gray-600 text-center">
                  {currentStep === 1
                    ? "Secure your data with privacy techniques."
                    : currentStep === 4
                    ? "Choose the engine or service that will perform data masking, redaction, anonymization, or tokenization."
                    : currentStep === 5
                    ? "Configure when and how the pipeline will run, including scheduling and closure settings."
                    : ""}
                </DialogDescription>
              </DialogHeader>

            <div className="flex-1 overflow-y-auto">      
              {currentStep === 1 && (
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-700">
                      Enter Pipeline Name:
                    </Label>
                    <Input
                      id="name"
                      value={newUser.name}
                      onChange={(e) => {
                        const value = e.target.value;
                        setNewUser({ ...newUser, name: value });

                        if (value.trim()) {
                          setNameError(false);
                        }
                      }}
                      placeholder="e.g. Customer Data Anonymization"
                      className={`input-override !bg-white !focus:border-[#2196F3] !text-gray-900 h-12 ${
                        nameError
                          ? "!border-red-500 ring-1 ring-red-500"
                          : "!border-gray-300"
                      }`}
                      style={{
                        backgroundColor: "white !important",
                        color: "#111827 !important",
                        border: "1px solid #d1d5db !important",
                      }}
                    />
                    {nameError && (
                      <p className="text-sm text-red-600 mt-1">
                        Pipeline name is required.
                      </p>
                    )}
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
                    <Select
                      value={newUser.sourceDatabase}
                      onValueChange={(value) => {
                        // Find the full source object from the array
                        const sourceObject = availableSources.find(
                          (s) => s?.configuration?.sourceName === value
                        );

                        if (sourceObject) {
                          // Now call the function that needs the full object
                          techniqueOptions(sourceObject);
                          setSelectedSource(sourceObject);
                        }

                        // Set the name state
                        setNewUser({ ...newUser, sourceDatabase: value });

                        // Clear validation error
                        if (value.trim()) {
                          setSourceError(false);
                        }
                      }}
                      disabled={sourcesLoading}
                    >
                      <SelectTrigger
                        className={`!bg-white !text-gray-900 h-12 ${
                          sourceError
                            ? "!border-red-500 ring-1 ring-red-500"
                            : "!border-gray-300"
                        }`}
                        style={{ backgroundColor: "white", color: "#111827" }}
                      >
                        <SelectValue
                          placeholder={
                            sourcesLoading
                              ? "Loading sources..."
                              : "Select a data source"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {sourcesLoading && (
                          <div className="px-4 py-2 text-gray-500">
                            Loading...
                          </div>
                        )}
                        {sourcesError && (
                          <div className="px-4 py-2 text-red-500">
                            Error loading sources
                          </div>
                        )}
                        {Array.isArray(availableSources) &&
                        availableSources.length > 0
                          ? availableSources.map((src) => (
                              <SelectItem
                                key={src.id || src.value || src}
                                value={src?.configuration?.sourceName}
                              >
                                {src?.configuration?.sourceName}
                              </SelectItem>
                            ))
                          : !sourcesLoading &&
                            !sourcesError && (
                              <div className="px-4 py-2 text-gray-500">
                                No sources found
                              </div>
                            )}
                      </SelectContent>
                    </Select>
                    {sourceError && (
                      <p className="text-sm text-red-600 mt-1">
                        Data source is required.
                      </p>
                    )}
                  </div>

                  {/* Select Security Techniques Section */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <div className="border-b border-gray-300 pb-3 mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">
                        Select Security Techniques
                      </h3>
                    </div>
                    <div className="flex flex-col gap-4 mb-4">
                      {techniqueToShow !== null ? (
                        techniqueToShow.map((technique) => (
                          <Button
                            key={technique.id}
                            variant="outline"
                            className={`h-16 flex items-center justify-center gap-4 border-2 transition-all rounded-lg w-full ${
                              selectedTechniques.includes(technique.id)
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
                        ))
                      ) : (
                        <div className="text-center text-gray-500">
                          Select a data source to see available techniques.
                        </div>
                      )}
                    </div>
                    {techniquesError && (
                      <p className="text-sm text-red-600 mt-1">
                        Select at least one technique.
                      </p>
                    )}
                  </div>

                  {selectedTechniques.includes("Generate") && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                      <div className="border-b border-gray-300 pb-3 mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">
                          Generate Data
                        </h3>
                      </div>
                      <div className="flex items-center gap-6">
                      <Label htmlFor="numRows" className="text-sm font-medium text-gray-700">
                        Number of Rows:
                      </Label>
                      <Input
                        id="numRows"
                        type="number"
                        value={numRows}
                        onChange={e => setNumRows(e.target.value)}
                        disabled={useAllRows}
                        className="w-24"
                      />
                      <div className="flex items-center">
                        <Checkbox
                          id="useAllRows"
                          checked={useAllRows}
                          onCheckedChange={setUseAllRows}
                        />
                        <Label htmlFor="useAllRows" className="ml-2 text-sm">
                          Use AI to generate rows
                        </Label>
                      </div>
                    </div>
                    </div>
                  )}

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
                        className={`flex items-center gap-2 px-4 py-2 ${
                          destinationType === "connection"
                            ? "border-[#2196F3] bg-blue-50 text-[#2196F3]"
                            : "border-gray-300 text-gray-700"
                        }`}
                        onClick={() => setDestinationType("connection")}
                      >
                        Use connection string
                      </Button>
                      <Button
                        variant="outline"
                        className={`flex items-center gap-2 px-4 py-2 ${
                          destinationType === "dataset"
                            ? "border-[#2196F3] bg-blue-50 text-[#2196F3]"
                            : "border-gray-300 text-gray-700"
                        }`}
                        onClick={() => setDestinationType("dataset")}
                      >
                        Use existing dataset
                      </Button>
                    </div>

                    {destinationType === "connection" ? (
                      <>
                        <Input
                          value={connectionString}
                          onChange={(e) => {
                            const value = e.target.value;
                            setConnectionString(value);

                            //  Clear destination error when user types something valid
                            if (value.trim()) {
                              setDestinationError(false);
                            }
                          }}
                          placeholder="Enter full connection string (e.g., postgresql://user:pass@host:5432/dbname)"
                          className={`input-override !bg-white !text-gray-900 h-12 ${
                            destinationError
                              ? "!border-red-500 ring-1 ring-red-500"
                              : "!border-gray-300"
                          }`}
                          style={{
                            backgroundColor: "white",
                            color: "#111827",
                            border: "1px solid #d1d5db",
                          }}
                        />
                        {destinationError && (
                          <p className="text-sm text-red-600 mt-1">
                            Connection string is required.
                          </p>
                        )}
                      </>
                    ) : (
                      <>
                        <Select
                          value={newUser.destinationDatabase}
                          onValueChange={(value) => {
                            setNewUser({
                              ...newUser,
                              destinationDatabase: value,
                            });

                            //  Clear error immediately when a dataset is selected
                            if (value.trim()) {
                              setDestinationError(false);
                            }
                          }}
                        >
                          <SelectTrigger
                            className={`!bg-white !text-gray-900 h-12 ${
                              destinationError
                                ? "!border-red-500 ring-1 ring-red-500"
                                : "!border-gray-300"
                            }`}
                            style={{
                              backgroundColor: "white",
                              color: "#111827",
                            }}
                          >
                            <SelectValue placeholder="Select from saved datasets" />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            {Array.isArray(availableSources) &&
                              availableSources.map((src) => (
                                <SelectItem
                                  key={src.id || src.value || src}
                                  value={src?.configuration?.sourceName}
                                >
                                  {src?.configuration?.sourceName}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        {destinationError && (
                          <p className="text-sm text-red-600 mt-1">
                            Dataset is required.
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}

              {currentStep === 3 && 
                <>
                  {renderDataSelectionStep(selectedSource?.configuration?.sourceType)}
                </>
              }
              
              {currentStep === 4 && (selectedSource?.configuration?.sourceType === 'files' || selectedSource?.configuration?.sourceType === 'sharepoint') && (
                <div className="space-y-6 py-6">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <div className="border-b border-gray-300 pb-3 mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">
                        Select Processing Agent
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Choose the engine or service that will perform data
                      masking, redaction, anonymization, tokenization, or
                      classification.
                    </p>
                    {isEditing ? (
                      <>
                        <Input
                          value={selectedProcessingAgent}
                          disabled
                          className="bg-gray-100"
                        />
                        <div className="text-xs text-gray-500 mt-2">
                          Agent cannot be changed during edit.
                        </div>
                      </>
                    ) : (
                      (() => {
                        // Determine allowed agents based on selected techniques
                        let allowedAgents = [];
                        if (selectedTechniques.includes("Masking")) {
                          allowedAgents.push("Redaction Agent");
                        }
                        if (selectedTechniques.includes("Tokenization")) {
                          allowedAgents.push("Tokenization Agent");
                        }
                        if (selectedTechniques.includes("Anonymization")) {
                          allowedAgents.push("Anonymization Agent");
                        }
                        allowedAgents.push("Classification Agent");
                        // Remove duplicates
                        allowedAgents = Array.from(new Set(allowedAgents));
                        return (
                          <Select
                            value={selectedProcessingAgent}
                            onValueChange={(value) => {
                              setSelectedProcessingAgent(value);

                              if (value.trim()) {
                                setAgentError(false);
                              }
                            }}
                          >
                            <SelectTrigger
                              className={`!bg-white !text-gray-900 h-12 ${
                                agentError
                                  ? "!border-red-500 ring-1 ring-red-500"
                                  : "!border-gray-300"
                              }`}
                              style={{
                                backgroundColor: "white",
                                color: "#111827",
                              }}
                            >
                              <SelectValue placeholder="Select a processing agent" />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                              {allowedAgents.map((agent) => (
                                <SelectItem key={agent} value={agent}>
                                  {agent}
                                </SelectItem>
                              ))}
                            </SelectContent>
                            {agentError && (
                              <p className="text-sm text-red-600 mt-1">
                                Processing agent is required.
                              </p>
                            )}
                          </Select>
                        );
                      })()
                    )}
                    {/* Custom Prompt Textarea */}
                    <div className="mt-6">
                      <label
                        htmlFor="customPrompt"
                        className="block text-gray-700 font-medium mb-2"
                      >
                        Custom Prompt (optional)
                      </label>
                      <textarea
                        id="customPrompt"
                        className="w-full border rounded-lg p-3 text-gray-900 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={4}
                        value={newUser.customPrompt}
                        onChange={(e) =>
                          setNewUser({
                            ...newUser,
                            customPrompt: e.target.value,
                          })
                        }
                        placeholder="Enter a custom prompt for this pipeline (optional)"
                      />
                      <div className="text-xs text-gray-400 mt-1">
                        Characters: {newUser?.customPrompt?.length}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 5 && (
                <div className="space-y-6 py-6">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <div className="border-b border-gray-300 pb-3 mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">
                        Run and Close Configuration
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Configure when and how the pipeline will run, including
                      scheduling and closure settings.
                    </p>

                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">
                          Run Schedule
                        </Label>
                        <Select
                          value={runConfiguration.schedule}
                          onValueChange={(value) => {
                            setRunConfiguration({
                              ...runConfiguration,
                              schedule: value,
                            });

                            if (value.trim()) {
                              setScheduleError(false);
                            }
                          }}
                        >
                          <SelectTrigger
                            className={`!bg-white !text-gray-900 h-12 ${
                              scheduleError
                                ? "!border-red-500 ring-1 ring-red-500"
                                : "!border-gray-300"
                            }`}
                            style={{
                              backgroundColor: "white",
                              color: "#111827",
                            }}
                          >
                            <SelectValue placeholder="Select run schedule" />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            <SelectItem value="immediate">
                              Run Immediately
                            </SelectItem>
                            {/* <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem> */}
                            <SelectItem value="manual">
                              Manual Trigger Only
                            </SelectItem>
                          </SelectContent>
                          {scheduleError && (
                            <p className="text-sm text-red-600 mt-1">
                              Run schedule is required.
                            </p>
                          )}
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            id="notifications"
                            checked={runConfiguration.notifications}
                            onCheckedChange={(checked) =>
                              setRunConfiguration({
                                ...runConfiguration,
                                notifications: checked,
                              })
                            }
                            className="border-gray-400"
                          />
                          <Label
                            htmlFor="notifications"
                            className="text-sm text-gray-700 font-medium"
                          >
                            Send notifications on completion
                          </Label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            id="autoClose"
                            checked={runConfiguration.autoClose}
                            onCheckedChange={(checked) =>
                              setRunConfiguration({
                                ...runConfiguration,
                                autoClose: checked,
                              })
                            }
                            className="border-gray-400"
                          />
                          <Label
                            htmlFor="autoClose"
                            className="text-sm text-gray-700 font-medium"
                          >
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
                        className="border-gray-400"
                      />
                      <Label htmlFor="enableSurroundAI" className="ml-2">
                        Enable Surround AI
                      </Label>
                    </div>
                    {isEditing && (
                      <div className="mt-4">
                        <Button
                          variant="outline"
                          onClick={() => setShowSurroundAIConfig(true)}
                        >
                          Reconfigure Surround AI
                        </Button>
                        <Dialog
                          open={showSurroundAIConfig}
                          onOpenChange={setShowSurroundAIConfig}
                        >
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
                              <Label
                                htmlFor="editEnableSurroundAI"
                                className="ml-2"
                              >
                                Enable Surround AI
                              </Label>
                            </div>
                            <DialogFooter>
                              <Button
                                onClick={() => setShowSurroundAIConfig(false)}
                              >
                                Done
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

              <DialogFooter className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                {(currentStep === 2 ||
                  currentStep === 3 ||
                  currentStep === 4 ||
                  currentStep === 5) && (
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
                    onClick={() => {
                      resetForm(); // ← resets nameError and form state
                      setShowCreateUserDialog(false);
                    }}
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
                    ? isEditing
                      ? "Edit Pipeline"
                      : "Create Pipeline"
                    : currentStep === 4
                    ? "Complete Pipeline"
                    : "Next →"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg border border-gray-200">
          <Table className="w-full table-fixed">
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
                  <TableCell
                    colSpan={8}
                    className="text-center text-gray-500 py-8"
                  >
                    Loading pipelines...
                  </TableCell>
                </TableRow>
              ) : pipelineError ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center text-red-500 py-8"
                  >
                    Error loading pipelines:{" "}
                    {pipelineError.message || "Unknown error"}
                  </TableCell>
                </TableRow>
              ) : sortedUsers && sortedUsers.length > 0 ? (
                sortedUsers.map((pipeline) => (
                  <TableRow
                    key={pipeline.id}
                    className="bg-white hover:bg-gray-50 border-gray-200"
                  >
                    <TableCell
                      className="font-medium text-gray-900 p-4 text-sm whitespace-nowrap overflow-hidden truncate w-40 cursor-pointer"
                      title={pipeline.name}
                    >
                      {pipeline.name}
                    </TableCell>
                    <TableCell className="text-gray-600 p-4 text-sm whitespace-normal">
                      {pipeline.source}
                    </TableCell>
                    <TableCell className="text-gray-600 p-4 text-sm whitespace-normal">
                      {pipeline.destination}
                    </TableCell>
                    <TableCell className="p-4 text-sm whitespace-normal">
                      {getTechniqueBadge(pipeline.technique)}
                    </TableCell>
                    <TableCell className="p-4 text-sm whitespace-normal">
                      {getStatusBadge(pipeline.status)}
                    </TableCell>
                    <TableCell className="text-gray-600 p-4 text-sm whitespace-normal">
                      {pipeline.last_updated
                        ? formatDate(pipeline.last_updated)
                        : formatDate(pipeline.created_at)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
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
                          <RefreshCcw className="h-4 w-4 text-blue-500" /> Run Manually
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => openDeleteConfirm(pipeline)}
                          className="text-red-600 hover:bg-gray-100"
                        >
                          <Trash className="h-4 w-4 text-red-500" /> Delete
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
                  <TableCell
                    colSpan={8}
                    className="text-center text-gray-500 py-8"
                  >
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

        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
  <DialogContent className="sm:max-w-[500px] bg-white rounded-xl">
    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
      <AlertTriangle className="h-8 w-8 text-red-500" />
    </div>
    <DialogHeader className="text-center">
      <DialogTitle className="text-2xl text-gray-900">Are you absolutely sure?</DialogTitle>
      <DialogDescription className="mt-2 text-gray-600">
        This action cannot be undone. This will permanently delete the pipeline{" "}
        <span className="font-semibold text-gray-800">"{pipelineToDelete?.name}"</span>.
      </DialogDescription>
    </DialogHeader>
    <DialogFooter className="mt-6 flex w-full justify-center gap-3">
      <Button variant="outline" className="px-6" onClick={() => setDeleteOpen(false)}>
        Cancel
      </Button>
      <Button className="bg-red-600 hover:bg-red-700 text-white px-6" onClick={confirmDelete}>
        Delete
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

          {/* View Pipeline Modal */}
          <Dialog
            open={!!viewPipeline}
            onOpenChange={(open) => {
              if (!open) setViewPipeline(null);
            }}
          >
            <DialogContent className="sm:max-w-[500px] bg-white">
              <DialogHeader>
                <DialogTitle className="text-gray-900">
                  Pipeline Details
                </DialogTitle>
                <DialogDescription className="text-gray-600">
                  View configuration and details for this pipeline.
                </DialogDescription>
              </DialogHeader>
              {viewPipeline && (
                <div className="space-y-4 py-2">
                  <div>
                    <span className="font-semibold">Pipeline Name:</span>{" "}
                    {viewPipeline.name}
                  </div>
                  <div>
                    <span className="font-semibold">Source:</span>{" "}
                    {viewPipeline.source}
                  </div>
                  <div>
                    <span className="font-semibold">Destination:</span>{" "}
                    {viewPipeline.destination}
                  </div>
                  <div>
                    <span className="font-semibold">Technique:</span>{" "}
                    {viewPipeline.technique}
                  </div>
                  {/* <div><span className="font-semibold">Agent:</span> {viewPipeline.processingAgent || "Not specified"}</div>
                  <div><span className="font-semibold">Schedule:</span> {viewPipeline.schedule || "Not configured"}</div> */}
                  <div>
                    <span className="font-semibold">Status:</span>{" "}
                    {viewPipeline.status}
                  </div>
                  <div>
                    <span className="font-semibold">Created:</span>{" "}
                    {viewPipeline.created}
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button
                  onClick={() => setViewPipeline(null)}
                  className="bg-[#2196F3] hover:bg-[#1976D2] text-white w-full"
                >
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          {/* Edit AI Prompt Modal */}
          <Dialog open={showPromptModal} onOpenChange={setShowPromptModal}>
            <DialogContent className="sm:max-w-[600px] bg-white">
              <DialogHeader>
                <DialogTitle className="text-gray-900">
                  Edit AI Prompt
                </DialogTitle>
                <DialogDescription className="text-gray-600">
                  You can modify the AI prompt before applying it to the
                  pipeline. The prompt will help optimize your pipeline
                  processing.
                </DialogDescription>
              </DialogHeader>
              <div className="font-semibold text-gray-900 mb-1">
                Prompt Content
              </div>
              <div className="text-sm text-gray-600 mb-2">
                Edit the prompt below to customize how AI will process this
                pipeline:
              </div>
              <textarea
                className="w-full border rounded-lg p-3 text-gray-900 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={6}
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
              />
              <DialogFooter>
                <Button
                  className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white"
                  onClick={() => {
                    alert("Apply Prompt clicked");
                    console.log("Apply Prompt button clicked");
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
          <Dialog
            open={showPromptListModal}
            onOpenChange={setShowPromptListModal}
          >
            <DialogContent className="sm:max-w-[650px] bg-white rounded-lg shadow-lg p-6 m-4">
              <DialogHeader>
                <DialogTitle className="text-gray-900">
                  AI Prompts for{" "}
                  {promptPipeline ? promptPipeline.name : "Pipeline"}
                </DialogTitle>
              </DialogHeader>
              {promptPipeline &&
                (() => {
                  const { surroundAIPrompt, suggestedPrompt, promptHistory } =
                    getPipelinePrompts(promptPipeline);
                  return (
                    <>
                      {/* Suggested Prompt */}
                      <div className="mb-6">
                        <div className="flex items-center mb-2">
                          <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded mr-2">
                            Suggested
                          </span>
                          <span className="text-xs text-gray-400">
                            {surroundAIPrompt.timestamp}
                          </span>
                          <span className="text-xs text-gray-400">
                            {suggestedPrompt.timestamp}
                          </span>
                          {pipelinePrompts[promptPipeline?.id]?.content ===
                            suggestedPrompt.content && (
                            <span className="ml-2 bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded">
                              Currently in use
                            </span>
                          )}
                        </div>
                        <div className="bg-blue-50 rounded-lg border border-blue-200 shadow p-5 flex items-start gap-4 mb-4">
                          <span className="flex-shrink-0 bg-purple-100 rounded-full p-3 flex items-center justify-center">
                            <Sparkles className="h-6 w-6 text-purple-500" />
                          </span>
                          <span className="flex-1">
                            <div className="font-bold text-gray-900 text-lg mb-1">
                              {surroundAIPrompt.title}
                            </div>
                            <div className="text-sm text-gray-700 mb-3">
                              {surroundAIPrompt.description}
                            </div>
                            <Button
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold"
                              onClick={() => handleOpenSurroundAI(promptPipeline)}
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
                            <div className="font-bold text-gray-900 text-lg mb-1">
                              {suggestedPrompt.title}
                            </div>
                            <div className="text-sm text-gray-700 mb-3">
                              {suggestedPrompt.description}
                            </div>
                            <Button
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold"
                              disabled={fetchCustomPrompt.isLoading}
                              onClick={handleUsePromptClick}
                            >
                              {fetchCustomPrompt.isPending
                                ? "Loading..."
                                : "Use Prompt"}
                            </Button>
                          </span>
                        </div>
                      </div>
                      {/* Prompt Version History */}
                      <div>
                        <div className="font-semibold text-gray-800 mb-3 text-base">
                          Prompt Version History
                        </div>
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
                                <div className="font-semibold text-gray-900 text-base mb-1">
                                  {prompt.title}
                                </div>
                                <div className="text-sm text-gray-600 mb-2">
                                  {prompt.description}
                                </div>
                                <div className="text-xs text-gray-400 mb-2">
                                  {prompt.timestamp}
                                </div>
                                {pipelinePrompts[promptPipeline?.id]
                                  ?.content === prompt.content ? (
                                  <span className="ml-2 bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded">
                                    Currently in use
                                  </span>
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
          <Dialog
            open={showPromptReviewModal}
            onOpenChange={setShowPromptReviewModal}
          >
            <DialogContent className="sm:max-w-[600px] bg-white rounded-lg shadow-lg p-6">
              <DialogHeader>
                <DialogTitle className="text-gray-900">
                  Review & Apply AI Prompt
                </DialogTitle>
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
                onChange={(e) => setReviewPromptContent(e.target.value)}
                maxLength={1000}
              />
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowPromptReviewModal(false)}
                >
                  Cancel
                </Button>
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
          <Dialog
            open={showRunPipelineModal}
            onOpenChange={setShowRunPipelineModal}
          >
            <DialogContent className="sm:max-w-[400px] bg-white rounded-lg shadow-lg p-6 flex flex-col items-center">
              <DialogHeader>
                <DialogTitle className="text-gray-900 w-full text-center">
                  {runPipelineStatus === "running"
                    ? "Pipeline Running"
                    : "Pipeline Completed"}
                </DialogTitle>
              </DialogHeader>
              {runPipelineStatus === "running" ? (
                <>
                  <Loader2 className="animate-spin h-12 w-12 text-blue-500 my-6" />
                  <div className="text-gray-700 text-center">
                    Your pipeline is being processed...
                  </div>
                </>
              ) : (
                <>
                  <div className="text-green-600 text-3xl my-6">✔</div>
                  <div className="text-gray-700 text-center mb-2">
                    Pipeline completed successfully!
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => setShowRunPipelineModal(false)}
                    >
                      Close
                    </Button>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                      onClick={() => {
                        setRunPipelineStatus("running");
                        if (runTimeoutRef.current)
                          clearTimeout(runTimeoutRef.current);
                        runTimeoutRef.current = setTimeout(() => {
                          setRunPipelineStatus("completed");
                          setPipelines((users) =>
                            users.map((p) =>
                              p.id ===
                              (reviewPromptPipeline?.id || promptPipeline?.id)
                                ? { ...p, status: "Completed" }
                                : p
                            )
                          );
                        }, 2500);
                      }}
                    >
                      <RefreshCcw className="h-4 w-4 text-blue-500" /> Re-run
                    </Button>
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>
          {/* Prompt Applied Confirmation Modal */}
          <Dialog
            open={showPromptAppliedModal}
            onOpenChange={setShowPromptAppliedModal}
          >
            <DialogContent className="sm:max-w-[400px] bg-white rounded-lg shadow-lg p-6 flex flex-col items-center">
              <DialogHeader>
                <DialogTitle className="text-gray-900 w-full text-center">
                  Changes Applied
                </DialogTitle>
              </DialogHeader>
              <div className="text-gray-700 text-center my-4">
                The prompt has been applied and the pipeline configuration is
                updated.
              </div>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white mt-2"
                onClick={() => setShowPromptAppliedModal(false)}
              >
                Close
              </Button>
            </DialogContent>
          </Dialog>
          {showSurroundAI && pipelineForWidget && (
            <SurroundAIWidget pipeline={pipelineForWidget} onClose={() => setShowSurroundAI(false)} />
          )}
        </>
      )}
    </div>
  );
}

export default UserManagement;