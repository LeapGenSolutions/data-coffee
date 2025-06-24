/* eslint-disable */
import { useState } from "react";
import {
  Plus,
  MoreHorizontal,
  Shield,
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

  // Sample user data with medical context
  const [users, setUsers] = useState([
    {
      id: 1,
      name: "Medical Data Anonymization",
      source: "Patient",
      destination: "Analytics",
      technique: "Anonymization",
      status: "Active",
      created: "4/18/2023",
    },
    {
      id: 2,
      name: "Clinical Data Tokenization",
      source: "Clinical",
      destination: "Analytics",
      technique: "Tokenization",
      status: "Active",
      created: "4/15/2023",
    },
  ]);

  const [newUser, setNewUser] = useState({
    name: "",
    sourceDatabase: "",
    destinationDatabase: "",
    techniques: [],
    status: "Active",
  });

  // Filter users based on search term
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.department.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Sort users
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (sortDirection === "asc") {
      return aValue.localeCompare(bValue);
    } else {
      return bValue.localeCompare(aValue);
    }
  });

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
    if (checked) {
      setSelectedUsers(sortedUsers.map((user) => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { className: "bg-[#4CAF50] text-white", label: "Completed" },
      inactive: { className: "bg-[#F44336] text-white", label: "Inactive" },
      pending: { className: "bg-[#FF9800] text-white", label: "Pending" },
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

    const config = techniqueConfig[technique.toLowerCase()] || {
      className: "bg-[#4CAF50] text-white",
      label: technique,
    };

    return (
      <Badge className={`${config.className} text-xs px-2 py-1 rounded-md`}>
        {config.label}
      </Badge>
    );
  };

  const handleCreateUser = () => {
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
      if (!selectedProcessingAgent) {
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
        id: Date.now(),
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
        autoClose: runConfiguration.autoClose,
        status: "Active",
        created: new Date().toLocaleDateString(),
        destinationType,
        connectionString,
      };

      setUsers([...users, pipeline]);
      resetForm();
      setShowCreateUserDialog(false);

      toast({
        title: "Pipeline Created",
        description: `${pipeline.name} has been added to the system`,
      });
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
    const user = users.find((u) => u.id === userId);
    if (
      window.confirm(
        `Are you sure you want to delete "${user.name}"? This action cannot be undone.`,
      )
    ) {
      setUsers(users.filter((u) => u.id !== userId));
      toast({
        title: "User Deleted",
        description: `${user.name} has been removed from the system`,
        variant: "destructive",
      });
    }
  };

  const handleToggleStatus = (userId) => {
    setUsers(
      users.map((user) =>
        user.id === userId
          ? {
              ...user,
              status: user.status === "Active" ? "Inactive" : "Active",
            }
          : user,
      ),
    );
  };

  return (
    <div className="space-y-6">
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
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Data Pipelines
          </h2>

          <Dialog
            open={showCreateUserDialog}
            onOpenChange={(open) => {
              setShowCreateUserDialog(open);
              if (!open) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button className="bg-[#2196F3] hover:bg-[#1976D2] text-white flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Pipeline
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] bg-white max-h-[90vh] overflow-y-auto">
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
                    >
                      <SelectTrigger
                        className="!bg-white !border-gray-300 !focus:border-[#2196F3] !text-gray-900 h-12"
                        style={{ backgroundColor: "white", color: "#111827" }}
                      >
                        <SelectValue placeholder="Select a data source or connection string" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="Patient Data Source">
                          Patient Data Source
                        </SelectItem>
                        <SelectItem value="Clinical Data Source">
                          Clinical Data Source
                        </SelectItem>
                        <SelectItem value="Financial Data Source">
                          Financial Data Source
                        </SelectItem>
                        <SelectItem value="Research Data Source">
                          Research Data Source
                        </SelectItem>
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
                          className={`h-16 flex flex-col items-center gap-2 border-2 transition-all rounded-lg ${
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
                            <SelectItem value="Analytics Warehouse Dataset">
                              Analytics Warehouse Dataset
                            </SelectItem>
                            <SelectItem value="Secure Archive Dataset">
                              Secure Archive Dataset
                            </SelectItem>
                            <SelectItem value="Reporting Dataset">
                              Reporting Dataset
                            </SelectItem>
                            <SelectItem value="Test Environment Dataset">
                              Test Environment Dataset
                            </SelectItem>
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
                        <Select value={runConfiguration.schedule} onValueChange={(value) => setRunConfiguration({...runConfiguration, schedule: value})}>
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
                            onCheckedChange={(checked) => setRunConfiguration({...runConfiguration, notifications: checked})}
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
                            onCheckedChange={(checked) => setRunConfiguration({...runConfiguration, autoClose: checked})}
                            className="border-gray-400"
                          />
                          <Label htmlFor="autoClose" className="text-sm text-gray-700 font-medium">
                            Auto-close pipeline after successful completion
                          </Label>
                        </div>
                      </div>
                    </div>
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
                  onClick={handleCreateUser}
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
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <Table>
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
                <TableHead className="text-white font-medium">
                  Agent
                </TableHead>
                <TableHead className="text-white font-medium">
                  Schedule
                </TableHead>
                <TableHead className="text-white font-medium">Status</TableHead>
                <TableHead className="text-white font-medium">
                  Created
                </TableHead>
                <TableHead className="text-white font-medium">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((pipeline) => (
                <TableRow
                  key={pipeline.id}
                  className="bg-white hover:bg-gray-50 border-gray-200"
                >
                  <TableCell className="font-medium text-gray-900">
                    {pipeline.name}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {pipeline.source}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {pipeline.destination}
                  </TableCell>
                  <TableCell>{getTechniqueBadge(pipeline.technique)}</TableCell>
                  <TableCell className="text-gray-600">
                    {pipeline.processingAgent || "Not specified"}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {pipeline.schedule || "Not configured"}
                  </TableCell>
                  <TableCell>{getStatusBadge(pipeline.status)}</TableCell>
                  <TableCell className="text-gray-600">
                    {pipeline.created}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

export default UserManagement;
