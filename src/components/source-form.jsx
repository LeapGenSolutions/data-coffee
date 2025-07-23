/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "../components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { toast } from "./ui/toaster.jsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  ChevronRight,
  Database,
  Server,
  Globe,
  CheckCircle,
  RefreshCcw,
} from "lucide-react";
import ToggleButton from "./ui/toggle-button";
import { useTestAzureBlobConnection } from "../hooks/useTestAzureBlobConnection";
import { useListAzureBlobFiles } from "../hooks/useListAzureBlobFiles";
import { cn } from "../lib/utils";
import { useSaveSource } from "../hooks/useSaveSource";
import { usePatchSource } from "../hooks/usePatchSource.js";
import { useSelector } from "react-redux";
import { navigate } from "wouter/use-browser-location";


// Define basic schema and schemas for each source type and location
const baseSchema = z.object({
  step: z.number(),
  sourceName: z.string().min(1, "Source name is required"),
  sourceType: z.string().min(1, "Source type is required"),
  location: z.string().min(1, "Location is required"),

});


// Create schema based on the source type and location
const getValidationSchema = (sourceType, location) => {
  let schema = baseSchema;

  // Add fields based on source type and location
  if (sourceType === "sql" && location === "on-prem") {
    return schema.extend({
      host: z.string().min(1, "Host is required"),
      port: z.string().min(1, "Port is required"),
      dbName: z.string().min(1, "Database name is required"),
      username: z.string().min(1, "Username is required"),
      password: z.string().min(1, "Password is required"),
    });
  }

  if (sourceType === "sql" && location === "cloud") {
    return schema.extend({
      connectionString: z.string().min(1, "Connection string is required"),
      cloudProvider: z.string().min(1, "Cloud provider is required"),
      authMethod: z.string().min(1, "Auth method is required"),
    });
  }

  if (sourceType === "oracle" && location === "on-prem") {
    return schema.extend({
      host: z.string().min(1, "Host is required"),
      port: z.string().min(1, "Port is required"),
      sid: z.string().min(1, "SID/Service name is required"),
      username: z.string().min(1, "Username is required"),
      password: z.string().min(1, "Password is required"),
    });
  }

  if (sourceType === "oracle" && location === "cloud") {
    return schema.extend({
      connectionString: z.string().min(1, "Connection string is required"),
      cloudProvider: z.string().min(1, "Cloud provider is required"),
      authMethod: z.string().min(1, "Auth method is required"),
    });
  }

  if (sourceType === "postgresql" && location === "on-prem") {
    return schema.extend({
      host: z.string().min(1, "Host is required"),
      port: z.string().min(1, "Port is required"),
      dbName: z.string().min(1, "Database name is required"),
      username: z.string().min(1, "Username is required"),
      password: z.string().min(1, "Password is required"),
    });
  }

  if (sourceType === "postgresql" && location === "cloud") {
    return schema.extend({
      connectionString: z.string().min(1, "Connection string is required"),
      cloudProvider: z.string().min(1, "Cloud provider is required"),
      authMethod: z.string().min(1, "Auth method is required"),
    });
  }

  if (sourceType === "mongodb" && location === "on-prem") {
    return schema.extend({
      host: z.string().min(1, "Host is required"),
      port: z.string().min(1, "Port is required"),
      database: z.string().min(1, "Database name is required"),
      username: z.string().min(1, "Username is required"),
      password: z.string().min(1, "Password is required"),
    });
  }

  if (sourceType === "mongodb" && location === "cloud") {
    return schema.extend({
      atlasUri: z.string().min(1, "MongoDB Atlas URI is required"),
      authMethod: z.string().min(1, "Auth method is required"),
    });
  }

  if (sourceType === "files" && location === "on-prem") {
    return schema.extend({
      filePath: z.string().min(1, "File path is required"),
      fileFormat: z.string().min(1, "File format is required"),
    });
  }

  if (sourceType === "files" && location === "cloud") {
    return schema
      .extend({
        cloudProvider: z.string().min(1, "Cloud provider is required"),
        containerName: z.string().min(1, "Container name is required"),
        fileFormat: z.string().min(1, "File format is required"),
        pathPrefix: z.string().min(1, "Path Prefix is required"),
        connectionString: z.string().optional(),
        authType: z.string().optional(),
      })
      .superRefine((data, ctx) => {
        if (!data.authType || data.authType.trim() === "") {
            ctx.addIssue({
              path: ["authType"],
              message: "Auth type is required",
              code: z.ZodIssueCode.custom,
            });
          }
      });
  }

  if (sourceType === "blob" && location === "on-prem") {
    return schema.extend({
      uncPath: z.string().min(1, "UNC/Mount path is required"),
      fileAuth: z.string().optional(),
    });
  }

  if (sourceType === "blob" && location === "cloud") {
    return schema.extend({
      blobUri: z.string().min(1, "Blob URI / S3 bucket URL is required"),
      accessKey: z.string().min(1, "Access key is required"),
      sasToken: z.string().optional(),
    });
  }

  if (sourceType === "rest" && location === "on-prem") {
    return schema.extend({
      baseUrl: z.string().min(1, "Base URL is required"),
      headers: z.string().optional(),
      authType: z.string().min(1, "Auth type is required"),
      proxy: z.string().optional(),
    });
  }

  if (sourceType === "rest" && location === "cloud") {
    return schema.extend({
      baseUrl: z.string().min(1, "Base URL is required"),
      authType: z.string().min(1, "Auth type is required"),
      region: z.string().optional(),
    });
  }

  if (sourceType === "datawarehouse" && location === "on-prem") {
    return schema.extend({
      host: z.string().min(1, "Host is required"),
      port: z.string().min(1, "Port is required"),
      dbName: z.string().min(1, "Database is required"),
      username: z.string().min(1, "Username is required"),
      password: z.string().min(1, "Password is required"),
    });
  }

  if (sourceType === "datawarehouse" && location === "cloud") {
    return schema.extend({
      cloudDwUri: z.string().min(1, "Cloud DW URI is required"),
      authKey: z.string().optional(),
      oauthToken: z.string().optional(),
      region: z.string().min(1, "Region is required"),
    });
  }

  return schema;
};

export function SourceForm({ mode = "add", initialSource,  
  onCancel, onSourceSaved, currentWorkspace }) {
  const [, setErrors] = useState({});
  const [step, setStep] = useState(1);
  const [sourceType, setSourceType] = useState("");
  const [location, setLocation] = useState("on-prem");
  const [sourceStatus, setSourceStatus] = useState("Active");
  const testAzureBlobConnection = useTestAzureBlobConnection();
  const listAzureBlobFiles = useListAzureBlobFiles();
  const user = useSelector((state) => state.me.me);

  // Add uploadedFiles state at the top level
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // Create dynamic schema based on current selections
  const dynamicSchema = getValidationSchema(sourceType, location);

  const form = useForm({
    resolver: zodResolver(dynamicSchema),
    mode: "onChange",  // this enables live validation as user types/selects
    defaultValues: {
      step: 1,
      sourceName: "",
      sourceType: "",
      location: "on-prem",

      dataSelectionMode: "",
    },
  });

  // Watch for changes in form values to update state
  const watchSourceType = form.watch("sourceType");
  const watchLocation = form.watch("location");
  const watchFileFormat = form.watch("fileFormat");
  const watchContainerName = form.watch("containerName");
  const watchPathPrefix = form.watch("pathPrefix");
  const watchCloudProvider = form.watch("cloudProvider");


  useEffect(() => {
    if (watchSourceType !== sourceType) {
      setSourceType(watchSourceType);
    }
    if (watchLocation !== location) {
      setLocation(watchLocation);
    }
    // eslint-disable-next-line
  }, [watchSourceType, watchLocation]);

  useEffect(() => {
    if (initialSource) {
      form.reset({
        id: initialSource.id,
        createdAt: initialSource.createdAt,
        sourceName: initialSource.name || "",
        sourceType: initialSource.type || "",
        location: initialSource.location || "",
        authType: initialSource.authType || "",

        ...initialSource.configuration,
        step: 1,
      });
      setStep(1);
    } else {
      form.reset({ id: "", createdAt: "" });
      setStep(1);
    }
  }, [initialSource, form]);

  useEffect(() => {
    setAzureFiles([]);
    setSelectedTables([]);
    setIsAzureFilesLoaded(false);
  }, [watchFileFormat, watchContainerName, watchPathPrefix]);

  // Data selection state
  const [selectionMode, setSelectionMode] = useState("all");
  const [selectedTables, setSelectedTables] = useState([]);
  const [expandedTables, setExpandedTables] = useState([]);
  const [customQuery, setCustomQuery] = useState("");
  const [tableSearchQuery, setTableSearchQuery] = useState("");
  // For Azure Blob file listing
  const [azureFiles, setAzureFiles] = useState([]);
  const [isAzureFilesLoaded, setIsAzureFilesLoaded] = useState(false);

  const handleListFilesButtonClick = async () => {
    const connectionString = form.getValues("connectionString");
    const containerName = form.getValues("containerName");
    const blobPath = form.getValues("pathPrefix") || "";
    const fileType = form.getValues("fileFormat");
    if (!connectionString || !containerName || !fileType) {
      toast({
        title: "Missing Required Fields",
        description: "Please provide connection string, container name, and file format.",
        variant: "destructive",
      });
      return;
    }
    console.log({
      connectionString: form.getValues("connectionString"),
      containerName: form.getValues("containerName"),
      blobPath: form.getValues("pathPrefix"),
      fileType: form.getValues("fileFormat"),
    });
    listAzureBlobFiles.mutate(
      { connectionString, containerName, blobPath: blobPath || "", fileType },
      {
        onSuccess: (data) => {
          if (data.success && Array.isArray(data.files)) {
            setAzureFiles(data.files);
            setIsAzureFilesLoaded(true);
            setSelectedTables(data.files);
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
    const currentSourceType = form.getValues("sourceType");
    const currentLocation = form.getValues("location");
    const connectionString = form.getValues("connectionString");
    const containerName = form.getValues("containerName");
    const blobPath = form.getValues("pathPrefix");
    const fileType = form.getValues("fileFormat");

    if (
      step === 3 &&
      selectionMode === "specific" &&
      currentSourceType === "files" &&
      currentLocation === "cloud" &&
      watchCloudProvider === "azure" &&
      azureFiles.length === 0 &&
      watchFileFormat &&
      watchContainerName &&
      form.getValues("connectionString")
    ) {
      handleListFilesButtonClick({
        connectionString,
        containerName,
        blobPath,
        fileType
      });
    }
  }, [
    step,
    selectionMode,
    azureFiles.length,
    watchFileFormat,
    watchContainerName,
    watchPathPrefix,
    watchCloudProvider
  ]);

  const saveSourceMutation = useSaveSource();
  const patchSourceMutation = usePatchSource();  

  function handleSaveSource() {
    const currentData = form.getValues();
    console.log("Saving source with data:", currentData);

    // Create a new source object with all the form data
    const newSource = {
      id: Date.now(),
      name: currentData.sourceName || "Untitled Source",
      type: currentData.sourceType || "unknown",
      location: location || currentData.location || "on-prem",
      authType: currentData.authType || "",

      dataSelectionMode: currentData.dataSelectionMode || "all",
      selectedTables: currentData.selectedTables || selectedTables || [],
      customQuery: currentData.customPrompt || "",
      configuration: currentData,
      status: sourceStatus,
      lastSync: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      workspaceId: currentWorkspace.id,
      workspaceName: currentWorkspace.workspaceName
    };
    console.log("New source object:", newSource);
    

    if (!user || !user.email) {
      toast({
        title: "User Email Not Found",
        description: "Cannot save source because user email is missing.",
        variant: "destructive",
      });
      return;
    }

    const mutationFn = mode === "add" ? saveSourceMutation : patchSourceMutation;


    if (mode === "add") {
      mutationFn.mutate(
        { email: user.email, newSource },
        {
          onSuccess: (data) => {
            onSourceSaved?.(data); 
            navigate('/admin');
          },
          onError: (error) => {
            console.error("Failed to Save Data Source", error);
          },
        }
      );
    } 
    else {

      newSource.id = initialSource.id;

      mutationFn.mutate(
        { email: user.email, id: initialSource.id, updates: newSource },
        {
          onSuccess: (data) => {
            const savedSource = { ...newSource, ...data };
            onSourceSaved?.(savedSource);
            navigate(`/admin`);
          },
          onError: (error) => {
            console.error("Failed to update Data Source", error);
          },
        }
      );
    }
  }
  // Update form state when source type changes
  const handleSourceTypeChange = (value) => {
    setSourceType(value);
    form.setValue("sourceType", value);

    // Always reset to step 1 when changing source type
    setStep(1);
    form.setValue("step", 1);

    const currentValues = form.getValues();
    const newValues = {
      step: 1,
      sourceName: currentValues.sourceName,
      sourceType: value,
      location: currentValues.location,

    };

    form.reset(newValues);
  };

  // Update form state when location changes
  const handleLocationChange = (value) => {
    setLocation(value);
    form.setValue("location", value);

    // Always reset to step 1 when changing location
    setStep(1);
    form.setValue("step", 1);

    const currentValues = form.getValues();
    const newValues = {
      step: 1,
      sourceName: currentValues.sourceName,
      sourceType: currentValues.sourceType,
      location: value,

    };

    form.reset(newValues);
  };

  // Handle form submission
  const onSubmit = (data) => {
    console.log("onSubmit called with data:", data);
    console.log("Current form values:", form.getValues());
    console.log("Selection mode:", selectionMode);
    console.log("Selected tables:", selectedTables);

    // Create a new source object with all the form data
    const newSource = {
      id: Date.now(), // Simple ID generation
      name: data.sourceName || "Untitled Source",
      type: data.sourceType || "unknown",
      location: location || data.location || "on-prem",

      dataSelectionMode: selectionMode || "all",
      selectedTables: selectedTables || [],
      customQuery: customQuery || "",
      configuration: data, // Store all form data as configuration
      status: "Active",
      lastSync: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    console.log("New source object:", newSource);

    // Show success message
    toast({
      title: "Data Source Saved Successfully!",
      description: `${newSource.name} has been added to your data sources.`,
    });

    // Call the onSourceSaved callback to update the parent component
    if (onSourceSaved) {
      console.log("Calling onSourceSaved with:", newSource);
      onSourceSaved(newSource);
    } else {
      console.log("onSourceSaved callback not available");
    }
  };


  // Navigation between steps
  const nextStep = () => {
    const fieldsToValidate =
      step === 1
        ? ["sourceName", "sourceType", "location"]
        : Object.keys(form.getValues());

    form.trigger(fieldsToValidate).then((isValid) => {
      if (isValid) {
        setStep(step + 1);
        form.setValue("step", step + 1);
      } else {
        // Show toast for validation errors
        toast({
          title: "Validation Error",
          description: "Please complete all required fields correctly",
          variant: "destructive",
        });
      }
    });
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
      form.setValue("step", step - 1);
    }
  };

  // Get data selection options based on source type
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
          {
            value: "query",
            label: "Apply Row Filters - e.g., load rows with status = \"active\"",
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

  // Render data selection step
  const renderDataSelectionStep = () => {
    const currentSourceType = form.watch("sourceType");
    if (!currentSourceType) {
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
                Select Files: <span className="text-gray-500">({selectedTables.length} selected)</span>
              </p>
              <label className="inline-flex items-center space-x-1 text-sm">
                <input
                  type="radio"
                  name="fileSelection"
                  value="selectAll"
                  onChange={() => setSelectedTables([...azureFiles])}
                  checked={selectedTables.length === azureFiles.length}
                />
                <span>Select All</span>
              </label>
              <label className="inline-flex items-center space-x-1 text-sm">
                <input
                  type="radio"
                  name="fileSelection"
                  value="unselectAll"
                  onChange={() => setSelectedTables([])}
                  checked={selectedTables.length === 0}
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
                  checked={selectedTables.includes(file)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedTables([...selectedTables, file]);
                    } else {
                      setSelectedTables(selectedTables.filter((f) => f !== file));
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

    const terminology = getItemTerminology(currentSourceType);



    return (
      <div className="space-y-6">
        <div className="border rounded-md p-5 bg-gradient-to-r from-blue-50 to-white border-gray-200">
          <h4 className="text-md font-medium mb-3 text-gray-900">
            Data Selection Mode
          </h4>
          <p className="text-sm text-gray-600 mb-4">
            Choose how you want to extract data from your{" "}
            {currentSourceType.toUpperCase()} source.
          </p>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="select-all"
                name="selection-mode"
                value="all"
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                checked={selectionMode === "all"}
                onChange={() => setSelectionMode("all")}
              />
              <label
                htmlFor="select-all"
                className="text-sm font-medium text-gray-900"
              >
                {getDataSelectionOptions(currentSourceType)[0]?.label || "Select All Data"}
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="select-specific"
                name="selection-mode"
                value="specific"
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                checked={selectionMode === "specific"}
                onChange={() => setSelectionMode("specific")}
              />
              <label
                htmlFor="select-specific"
                className="text-sm font-medium text-gray-900"
              >
                {getDataSelectionOptions(currentSourceType)[1]?.label || "Select Specific Items"}
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="select-query"
                name="selection-mode"
                value="query"
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                checked={selectionMode === "query"}
                onChange={() => setSelectionMode("query")}
              />
              <label
                htmlFor="select-query"
                className="text-sm font-medium text-gray-900"
              >
                {getDataSelectionOptions(currentSourceType)[2]?.label || "Custom Query"}
              </label>
            </div>
          </div>

          {/* Show appropriate UI based on selection mode */}
          <div className="mt-6">
            {selectionMode === "all" && currentSourceType === "files" && (
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-md border border-gray-200">
                  <p className="text-sm text-gray-600">
                    All files will be uploaded and processed. Choose your file below:
                  </p>
                </div>

                {/* File Upload Component */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="mt-4">
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-gray-900">
                          Drop files here or click to upload
                        </span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          multiple
                          accept=".csv,.xlsx,.xls,.json,.parquet,.xml,.txt,.png,.jpeg,.jpg,.pdf"
                          onChange={(e) => {
                            const files = Array.from(e.target.files);
                            setUploadedFiles(files);
                            // Handle file upload logic here
                          }}
                        />
                      </label>
                      <p className="mt-1 text-xs text-gray-500">
                        Supports CSV, Excel, JSON, Parquet, XML, TXT, PNG, JPEG, JPG, PDF files
                      </p>
                    </div>
                    {/* Show selected files */}
                    {uploadedFiles.length > 0 && (
                      <div className="mt-4 text-left">
                        <p className="text-xs font-semibold text-gray-700 mb-1">Selected file{uploadedFiles.length > 1 ? 's' : ''}:</p>
                        <ul className="text-xs text-gray-600 space-y-1">
                          {uploadedFiles.map((file, idx) => (
                            <li key={file.name + idx} className="truncate">{file.name}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {selectionMode === "all" && currentSourceType !== "files" && (
              <div className="bg-white p-4 rounded-md border border-gray-200">
                <p className="text-sm text-gray-600">
                  All available {terminology.plural} will be extracted from this
                  source during data collection. This may include a large amount
                  of data depending on the source size.
                </p>
              </div>
            )}

            {selectionMode === "specific" && currentSourceType === "files" && (
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-md border border-gray-200">
                  {/* Azure Blob Storage: List files for selection */}
                  {location === "cloud" && form.getValues("cloudProvider") === "azure" ? (
                    <>
                      <div className="flex justify-end mt-4">
                        <button
                          type="button"
                          className="mb-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                          disabled={listAzureBlobFiles.isLoading}
                          onClick={() => {
                            handleListFilesButtonClick({
                              connectionString: form.getValues("connectionString"),
                              containerName: form.getValues("containerName"),
                              blobPath: form.getValues("pathPrefix"),
                              fileType: form.getValues("fileFormat")
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
                                  setSelectedTables(["Sheet1", "Sheet2", "Data"]);
                                  setExpandedTables(["Sheet1"]);
                                }
                              }}
                            />
                          </label>
                          <p className="text-xs text-gray-500 mt-1">Excel or CSV files only</p>
                        </div>
                      </div>
                      {/* Sheet/Column Selection (appears after file upload) */}
                      {selectedTables.length > 0 && (
                        <div className="mt-4 space-y-3">
                          <p className="text-sm font-medium text-gray-900">Select Sheets and Columns:</p>
                          {selectedTables.map((sheet) => (
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
                                    setExpandedTables(prev =>
                                      prev.includes(sheet)
                                        ? prev.filter(t => t !== sheet)
                                        : [...prev, sheet]
                                    );
                                  }}
                                  className="text-blue-600 text-xs hover:text-blue-800"
                                >
                                  {expandedTables.includes(sheet) ? "Hide Columns" : "Show Columns"}
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

            {selectionMode === "specific" && currentSourceType !== "files" && (
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
                      onClick={() => setSelectedTables([])}
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
                    {selectedTables.length} {terminology.plural} selected
                  </span>
                </div>
              </div>
            )}

            {selectionMode === "query" && (
              <div className="space-y-3">
                <p className="text-sm text-gray-900">
                  {getQueryDescription(currentSourceType)}
                </p>
                <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-1 border-b border-gray-200 bg-gray-50">
                    <span className="text-xs text-gray-700">
                      {getQueryEditorTitle(currentSourceType)}
                    </span>
                    <div className="flex space-x-1">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                  </div>
                  <Textarea
                    value={customQuery}
                    onChange={(e) => setCustomQuery(e.target.value)}
                    className="font-mono text-sm !text-gray-900 !bg-white border-0 focus:ring-0 h-40 resize-none p-3 placeholder:!text-gray-500"
                    style={{
                      backgroundColor: "white !important",
                      color: "#111827 !important",
                    }}
                    placeholder={getQueryPlaceholder(currentSourceType)}
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
                        title: `${getQueryType(currentSourceType)} syntax looks good`,
                        description: `The ${getQueryType(currentSourceType).toLowerCase()} has been validated.`,
                      });
                    }}
                  >
                    Validate {getQueryType(currentSourceType)}
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

  // Continue with other render methods...
  const renderConfirmationStep = () => {
    const data = form.getValues();
    const sourceTypeName =
      {
        sql: "SQL Database",
        oracle: "Oracle Database",
        postgresql: "PostgreSQL Database",
        mongodb: "MongoDB",
        files: "File System",
        blob: "Blob Storage",
        rest: "REST API",
        datawarehouse: "Data Warehouse",
      }[data.sourceType] || data.sourceType;

    const locationName = data.location === "on-prem" ? "On-Premises" : "Cloud";

    return (
      <Card className="bg-gradient-to-r from-blue-50 to-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Data Source Configuration Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Basic Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-700">Source Name</p>
                <p className="text-sm text-gray-900 bg-white p-2 rounded border border-gray-200">
                  {data.sourceName || '—'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-700">Source Type</p>
                <p className="text-sm text-gray-900 bg-white p-2 rounded border border-gray-200">
                  {sourceTypeName}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-700">Location</p>
                <p className="text-sm text-gray-900 bg-white p-2 rounded border border-gray-200">
                  {locationName}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-700">Collection Mode</p>
                <p className="text-sm text-gray-900 bg-white p-2 rounded border border-gray-200">
                  {selectionMode === 'all' ? 'Select All' : selectionMode === 'specific' ? 'Select Specific Items' : 'Custom Query/Rules'}
                </p>
              </div>
            </div>

            {/* Data Selection Summary */}
            {selectionMode === 'specific' && selectedTables.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700">Selected Items</h4>
                <div className="bg-white border border-gray-200 rounded-md">
                  <div className="divide-y divide-gray-200">
                    {selectedTables.map((table) => (
                      <div key={table} className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">{table}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Custom Query Summary */}
            {selectionMode === 'query' && customQuery && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700">Custom Query/Rules</h4>
                <div className="bg-white border border-gray-200 rounded-md p-3">
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
                    {customQuery.length > 200 ? customQuery.substring(0, 200) + '...' : customQuery}
                  </pre>
                </div>
              </div>
            )}



            <div className="bg-white p-4 rounded-md border border-gray-200">
              <h4 className="text-md font-medium mb-2 text-gray-900 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Review and Confirm Your Data Configuration
              </h4>
              <p className="text-sm text-gray-600">
                Your data source is configured and ready to be saved. Click
                "Save Source" below to complete the setup process.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Configuration step renderer
  const renderConfigurationStep = () => {
    const currentSourceType = form.watch("sourceType");
    const currentLocation = form.watch("location");

    if (!currentSourceType) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">
            Please select a source type in step 1 to continue
          </p>
        </div>
      );
    }

    const renderCommonFields = (fields) => (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((field, index) => (
          <FormField
            key={index}
            control={form.control}
            name={field.name}
            render={({ field: formField, fieldState }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-gray-800">
                  {field.label}
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    {field.type === "select" ? (
                      <Select
                        onValueChange={formField.onChange}
                        value={formField.value}
                      >
                        <SelectTrigger
                          className={cn(
                            "w-full pr-10 text-sm",
                            fieldState.error
                              ? "border-red-500 ring-1 ring-red-500 focus:ring-red-500"
                              : "border-gray-200"
                          )}
                        >
                          <SelectValue placeholder={field.placeholder} />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : field.type === "textarea" ? (
                      <Textarea
                        placeholder={field.placeholder}
                        {...formField}
                        className={cn(
                          "w-full text-sm pr-10",
                          fieldState.error
                            ? "border-red-500 ring-1 ring-red-500 focus:ring-red-500"
                            : "border-gray-200"
                        )}
                      />
                    ) : field.type === "toggle" ? (
                      <input
                        type="checkbox"
                        checked={formField.value || false}
                        onChange={(e) => formField.onChange(e.target.checked)}
                      />
                    ) : (
                      <Input
                        type={field.type || "text"}
                        placeholder={field.placeholder}
                        {...formField}
                        className={cn(
                          "w-full text-sm pr-10 transition-all duration-200 ease-in-out",
                          fieldState.error
                            ? "border-red-500 ring-1 ring-red-500 focus:ring-red-500"
                            : "border-gray-200 focus:ring-blue-500"
                        )}
                      />
                    )}

                    {fieldState.error && (
                      <div className="absolute right-2 top-2.5 text-red-500">
                      </div>
                    )}
                  </div>
                </FormControl>

                {fieldState.error ? (
                  <p className="text-sm text-red-600 mt-1">
                    {fieldState.error.message}
                  </p>
                ) : field.description ? (
                  <FormDescription className="text-xs text-gray-600">
                    {field.description}
                  </FormDescription>
                ) : null}
              </FormItem>
            )}
          />
        ))}
      </div>
    );

    // SQL Database Configuration
    if (currentSourceType === "sql") {
      const fields =
        currentLocation === "on-prem"
          ? [
            {
              name: "host",
              label: "Hostname / IP",
              placeholder: "localhost or IP address",
            },
            {
              name: "port",
              label: "Port",
              placeholder: "1433",
              type: "number",
            },
            {
              name: "authType",
              label: "Authentication Type",
              type: "select",
              placeholder: "Select authentication method",
              options: [
                { value: "windows", label: "Windows Authentication" },
                { value: "sql", label: "SQL Server Authentication" },
              ],
            },
            {
              name: "username",
              label: "Username",
              placeholder: "Database username",
            },
            {
              name: "password",
              label: "Password",
              placeholder: "Database password",
              type: "password",
            },
            {
              name: "dbName",
              label: "Database Name",
              placeholder: "Database name",
            },
            {
              name: "driver",
              label: "Driver",
              type: "select",
              placeholder: "Select driver type",
              options: [
                { value: "odbc", label: "ODBC" },
                { value: "jdbc", label: "JDBC" },
              ],
            },
          ]
          : [
            {
              name: "cloudProvider",
              label: "Cloud Provider",
              type: "select",
              placeholder: "Select cloud provider",
              options: [
                { value: "azure", label: "Azure SQL" },
                { value: "aws", label: "AWS RDS" },
                { value: "gcp", label: "Google Cloud SQL" },
              ],
            },
            {
              name: "connectionString",
              label: "Connection String",
              placeholder: "Full connection string",
              type: "textarea",
            },
            {
              name: "port",
              label: "Port",
              placeholder: "1433",
              type: "number",
            },
            {
              name: "authType",
              label: "Auth Type",
              type: "select",
              options: [
                { value: "managed", label: "Managed Identity" },
                { value: "sql", label: "SQL Authentication" },
              ],
            },
            {
              name: "sslRequired",
              label: "SSL Required",
              type: "toggle",
              toggleLabel: "Require SSL connection",
            },
          ];

      return (
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-medium text-gray-900 mb-2">
              SQL Database Configuration
            </h3>
            <p className="text-sm text-gray-600">
              {currentLocation === "on-prem"
                ? "Configure connection to your on-premises SQL Server database"
                : "Configure connection to your cloud-hosted SQL database"}
            </p>
          </div>
          {renderCommonFields(fields)}
          {currentLocation === "cloud" && (
            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Ensure your IP address is whitelisted in
                the cloud provider's firewall settings.
              </p>
            </div>
          )}
        </div>
      );
    }

    // Oracle Database Configuration
    if (currentSourceType === "oracle") {
      const fields =
        currentLocation === "on-prem"
          ? [
            {
              name: "host",
              label: "Hostname / IP",
              placeholder: "Oracle server hostname or IP",
            },
            {
              name: "port",
              label: "Port",
              placeholder: "1521",
              type: "number",
            },
            {
              name: "tnsAlias",
              label: "TNS Alias (Optional)",
              placeholder: "TNS service name",
            },
            {
              name: "authType",
              label: "Auth Type",
              type: "select",
              options: [
                { value: "userpass", label: "Username/Password" },
                { value: "kerberos", label: "Kerberos" },
              ],
            },
            {
              name: "username",
              label: "Username",
              placeholder: "Oracle username",
            },
            {
              name: "password",
              label: "Password",
              placeholder: "Oracle password",
              type: "password",
            },
          ]
          : [
            {
              name: "cloudProvider",
              label: "Cloud Provider",
              type: "select",
              options: [
                { value: "oci", label: "Oracle Cloud Infrastructure" },
                { value: "aws-rds", label: "AWS RDS for Oracle" },
              ],
            },
            {
              name: "connectionType",
              label: "Connection Type",
              value: "SSL + Wallet",
              disabled: true,
            },
            {
              name: "authType",
              label: "Auth Type",
              type: "select",
              options: [
                { value: "iam", label: "IAM" },
                { value: "oauth", label: "OAuth" },
              ],
            },
          ];

      return (
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-medium text-gray-900 mb-2">
              Oracle Database Configuration
            </h3>
            <p className="text-sm text-gray-600">
              Configure connection to your Oracle database instance
            </p>
          </div>
          {renderCommonFields(fields)}
        </div>
      );
    }

    // PostgreSQL Configuration
    if (currentSourceType === "postgresql") {
      const fields =
        currentLocation === "on-prem"
          ? [
            {
              name: "host",
              label: "Hostname / IP",
              placeholder: "PostgreSQL server hostname",
            },
            {
              name: "port",
              label: "Port",
              placeholder: "5432",
              type: "number",
            },
            {
              name: "username",
              label: "Username",
              placeholder: "PostgreSQL username",
            },
            {
              name: "password",
              label: "Password",
              placeholder: "PostgreSQL password",
              type: "password",
            },
            {
              name: "dbName",
              label: "Database Name",
              placeholder: "Database name",
            },
            {
              name: "ssl",
              label: "SSL Connection",
              type: "toggle",
              toggleLabel: "Enable SSL",
            },
          ]
          : [
            {
              name: "provider",
              label: "Provider",
              type: "select",
              options: [
                { value: "aws", label: "AWS RDS" },
                { value: "azure", label: "Azure Database" },
                { value: "gcp", label: "Google Cloud SQL" },
              ],
            },
            {
              name: "authMethod",
              label: "Auth Method",
              type: "select",
              options: [
                { value: "iam", label: "IAM" },
                { value: "userpass", label: "Username/Password" },
              ],
            },
            {
              name: "hostname",
              label: "Hostname",
              placeholder: "Cloud database hostname",
            },
            {
              name: "sslRequired",
              label: "SSL Required",
              type: "toggle",
              toggleLabel: "SSL is mandatory",
            },
          ];

      return (
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-medium text-gray-900 mb-2">
              PostgreSQL Configuration
            </h3>
            <p className="text-sm text-gray-600">
              Configure connection to your PostgreSQL database
            </p>
          </div>
          {renderCommonFields(fields)}
        </div>
      );
    }

    // MongoDB Configuration
    if (currentSourceType === "mongodb") {
      const fields =
        currentLocation === "on-prem"
          ? [
            {
              name: "host",
              label: "Host/IP",
              placeholder: "MongoDB server hostname",
            },
            {
              name: "port",
              label: "Port",
              placeholder: "27017",
              type: "number",
            },
            {
              name: "bindIPs",
              label: "Bind IPs",
              placeholder: "Comma-separated IP addresses",
              type: "textarea",
            },
            {
              name: "authType",
              label: "Auth Type",
              type: "select",
              options: [
                { value: "scram", label: "SCRAM" },
                { value: "x509", label: "x.509" },
              ],
            },
            {
              name: "ssl",
              label: "SSL",
              type: "toggle",
              toggleLabel: "Enable SSL",
            },
          ]
          : [
            {
              name: "provider",
              label: "Provider",
              type: "select",
              options: [
                { value: "atlas", label: "MongoDB Atlas" },
                { value: "documentdb", label: "Amazon DocumentDB" },
              ],
            },
            {
              name: "connectionString",
              label: "Connection String",
              placeholder: "MongoDB connection string",
              type: "textarea",
            },
            {
              name: "sslAlwaysOn",
              label: "SSL Always On",
              type: "toggle",
              toggleLabel: "SSL is always enabled",
            },
            {
              name: "vpcPeering",
              label: "VPC Peering",
              type: "toggle",
              toggleLabel: "Enable VPC peering",
            },
          ];

      return (
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-medium text-gray-900 mb-2">
              MongoDB Configuration
            </h3>
            <p className="text-sm text-gray-600">
              Configure connection to your MongoDB instance
            </p>
          </div>
          {renderCommonFields(fields)}
        </div>
      );
    }

    // Files Configuration
    if (currentSourceType === "files") {
      const isAzure = currentLocation === "cloud" && form.getValues("cloudProvider") === "azure";
      const authType = form.watch("authType");
      let fields = [];
      if (currentLocation === "on-prem") {
        fields = [
          {
            name: "filePath",
            label: "File Path",
            placeholder: "/path/to/files or \\server\\share (NFS/SMB URI)",
            description: "Local path or network file share path"
          },
          {
            name: "accessType",
            label: "Access Type",
            type: "select",
            placeholder: "Select access type",
            options: [
              { value: "shared", label: "Shared" },
              { value: "mount", label: "Mount" }
            ]
          },
          {
            name: "mountPath",
            label: "Mount Path",
            placeholder: "/mnt/data (if containerized)",
            description: "Container mount path if using containerized deployment"
          },
          {
            name: "authType",
            label: "Auth Type",
            type: "select",
            placeholder: "Select authentication type",
            options: [
              { value: "basic", label: "Basic Authentication" },
              { value: "sas", label: "SAS Token" },
              { value: "keyvault", label: "Azure Key Vault" }
            ]
          },
          // Show Variable Name if basic selected
          ...(authType === "basic"
            ? [{
                name: "variableName",
                label: "Variable Name",
                placeholder: "Enter variable name",
                description: "Variable name for basic authentication."
              }]
            : []),
          // Show connection string if SAS selected, or key vault name if keyvault selected
          ...(authType === "sas"
            ? [{
                name: "connectionString",
                label: "Connection String",
                type: "textarea",
                placeholder: "Paste your SAS connection string here",
                description: "SAS Token connection string."
              }]
            : authType === "keyvault"
              ? [{
                  name: "secretName",
                  label: "Secret Name",
                  placeholder: "Enter Azure Key Vault secret name",
                  description: "Azure Key Vault secret name."
                }]
              : []),
          {
            name: "fileFormat",
            label: "File Format",
            type: "select",
            placeholder: "Select file format",
            options: [
              { value: "all", label: "All Files" },
              { value: "csv", label: "CSV" },
              { value: "json", label: "JSON" },
              { value: "png", label: "PNG" },
              { value: "jpeg", label: "JPEG" },
              { value: "pdf", label: "PDF" },
              { value: "jpg", label: "JPG" }
            ]
          }
        ];
      } else {
        // Cloud
        fields = [
          {
            name: "cloudProvider",
            label: "Cloud Provider",
            type: "select",
            placeholder: "Select cloud provider",
            options: [
              { value: "s3", label: "Amazon S3" },
              { value: "azure", label: "Azure Blob Storage" },
              { value: "gcs", label: "Google Cloud Storage" }
            ]
          },
          // Show Storage Account Name before Container Name if Azure
          ...(isAzure
            ? [{
                name: "storageAccountName",
                label: "Storage Account Name",
                placeholder: "Enter Azure Storage Account Name",
                description: "Name of your Azure Storage Account."
              }]
            : []),
          {
            name: "containerName",
            label: "Container Name",
            placeholder: "my-data-container",
            description: "Name of your storage container"
          },
          {
            name: "pathPrefix",
            label: "Path Prefix",
            placeholder: "data/files/ ",
            description: "Optional path prefix within the container"
          },
          {
            name: "authType",
            label: "Auth Type",
            type: "select",
            placeholder: "Select authentication type",
            options: [
              { value: "basic", label: "Basic Authentication" },
              { value: "sas", label: "SAS Token" },
              { value: "keyvault", label: "Azure Key Vault" }
            ]
          },
          // Show connection string if SAS selected, or key vault name if keyvault selected
          ...(authType === "sas"
            ? [{
                name: "connectionString",
                label: "Connection String",
                type: "textarea",
                placeholder: "Paste your SAS connection string here",
                description: "SAS Token connection string."
              }]
            : authType === "keyvault"
              ? [{
                  name: "secretName",
                  label: "Secret Name",
                  placeholder: "Enter Azure Key Vault secret name",
                  description: "Azure Key Vault secret name."
                }]
              : []),
          {
            name: "fileFormat",
            label: "File Format",
            type: "select",
            placeholder: "Select file format",
            options: [
              { value: "csv", label: "CSV" },
              { value: "json", label: "JSON" },
              { value: "png", label: "PNG" },
              { value: "jpeg", label: "JPEG" },
              { value: "pdf", label: "PDF" },
              { value: "jpg", label: "JPG" }
            ]
          }
        ];
      }

      // Render the Test Connection button for Azure Blob Storage
      const renderTestConnectionButton = () => {
        if (isAzure && currentSourceType === "files") {
          return (
            <div className="flex justify-end mt-2">
              <button
                type="button"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onClick={handleTestConnection}
                disabled={testAzureBlobConnection.isLoading}
              >
                {testAzureBlobConnection.isLoading ? "Testing..." : "Test Connection"}
              </button>
            </div>
          );
        }
        return null;
      };

      return (
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-medium text-gray-900 mb-2">Files Configuration</h3>
            <p className="text-sm text-gray-600">
              Configure access to your file storage system
            </p>
          </div>
          {renderCommonFields(fields)}
          {renderTestConnectionButton()}
        </div>
      );
      // Move handleTestConnection to the bottom of the component so it can be referenced anywhere
      function handleTestConnection() {
        const currentSourceType = form.getValues("sourceType");
        const currentLocation = form.getValues("location");
        const isAzure = currentLocation === "cloud" && form.getValues("cloudProvider") === "azure";

        if (isAzure && currentSourceType === "files") {
          const connectionString = form.getValues("connectionString");
          const containerName = form.getValues("containerName");

          const newErrors = {};
          if (!containerName) newErrors.containerName = "Container Name is required";
          if (!connectionString) newErrors.connectionString = "Azure Connection String is required";

          if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast({
              title: "Missing Required Fields",
              description: "Please provide both Azure Connection String and Container Name.",
              variant: "destructive",
            });
            return;
          }

          setErrors({}); // Clear errors if all good

          testAzureBlobConnection.mutate(
            { connectionString, containerName },
            {
              onSuccess: (data) => {
                if (data.success) {
                  toast({
                    title: "Connection Successful",
                    description: data.message || "Connected to Azure Blob Storage!",
                    variant: "success",
                  });
                } else {
                  toast({
                    title: "Connection Failed",
                    description: data.message || "Could not connect.",
                    variant: "destructive",
                  });
                }
              },
              onError: (error) => {
                toast({
                  title: "Connection Failed",
                  description: error?.response?.data?.message || error.message || "Could not connect.",
                  variant: "destructive",
                });
              },
            }
          );
        }
      }
    }

    // REST API Configuration
    if (currentSourceType === "rest") {
      const fields = currentLocation === "on-prem"
        ? [
          {
            name: "apiUrl",
            label: "API URL",
            placeholder: "https://api.company.com/v1",
            description: "The base URL for your REST API"
          },
          {
            name: "authMethod",
            label: "Auth Method",
            type: "select",
            placeholder: "Select authentication method",
            options: [
              { value: "apikey", label: "API Key" },
              { value: "basic", label: "Basic Auth" },
              { value: "oauth2", label: "OAuth2" }
            ]
          },
          {
            name: "vpnRequired",
            label: "VPN Required",
            type: "toggle",
            toggleLabel: "VPN connection required"
          },
          {
            name: "corsNotes",
            label: "CORS/Internal Access Notes",
            type: "textarea",
            placeholder: "Notes about CORS configuration or internal access requirements",
            description: "Optional notes about network access requirements"
          }
        ]
        : [
          {
            name: "apiUrl",
            label: "API URL",
            placeholder: "https://api.service.com/v1",
            description: "The base URL for your cloud REST API"
          },
          {
            name: "authMethod",
            label: "Auth Method",
            type: "select",
            placeholder: "Select authentication method",
            options: [
              { value: "oauth2", label: "OAuth2" },
              { value: "jwt", label: "JWT" },
              { value: "apikey", label: "API Key" }
            ]
          },
          {
            name: "rateLimiting",
            label: "Rate Limiting",
            placeholder: "Requests per minute (optional)",
            type: "number",
            description: "Optional rate limiting configuration"
          },
          {
            name: "corsEnabled",
            label: "CORS Always Enforced",
            type: "toggle",
            toggleLabel: "CORS is always enforced",
            defaultValue: true,
            disabled: true
          },
          {
            name: "httpsOnly",
            label: "HTTPS Mandatory",
            type: "toggle",
            toggleLabel: "HTTPS is mandatory",
            defaultValue: true,
            disabled: true
          }
        ];

      return (
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-medium text-gray-900 mb-2">REST API Configuration</h3>
            <p className="text-sm text-gray-600">
              {currentLocation === "on-prem"
                ? "Configure connection to your on-premises REST API with custom network settings"
                : "Configure connection to your cloud REST API with standard security protocols"}
            </p>
          </div>
          {renderCommonFields(fields)}
        </div>
      );
    }

    // Blob Storage Configuration (Cloud Only)
    if (currentSourceType === "blob") {
      const fields = [
        {
          name: "cloudProvider",
          label: "Cloud Provider",
          type: "select",
          placeholder: "Select cloud provider",
          options: [
            { value: "aws", label: "Amazon S3" },
            { value: "azure", label: "Azure Blob" },
            { value: "gcp", label: "Google Cloud Storage" }
          ]
        },
        {
          name: "bucketName",
          label: "Bucket/Container Name",
          placeholder: "my-data-bucket",
          description: "Name of your storage bucket or container"
        },
        {
          name: "accessMethod",
          label: "Access Method",
          type: "select",
          placeholder: "Select access method",
          options: [
            { value: "accesskey", label: "Access Key" },
            { value: "sas", label: "SAS Token" },
            { value: "iam", label: "IAM Role" }
          ]
        },
        {
          name: "endpoint",
          label: "Endpoint Override",
          placeholder: "Optional custom endpoint URL",
          description: "Override default endpoint (optional)"
        },
        {
          name: "encryptionAtRest",
          label: "Encryption at Rest",
          type: "toggle",
          toggleLabel: "Enable encryption at rest"
        },
        {
          name: "encryptionInTransit",
          label: "Encryption in Transit",
          type: "toggle",
          toggleLabel: "Enable encryption in transit"
        },
        {
          name: "httpsOnly",
          label: "HTTPS Only Protocol",
          type: "toggle",
          toggleLabel: "HTTPS protocol only",
          defaultValue: true
        }
      ];

      return (
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-medium text-gray-900 mb-2">Blob Storage Configuration</h3>
            <p className="text-sm text-gray-600">
              Configure connection to your cloud blob storage with security options
            </p>
          </div>
          {renderCommonFields(fields)}
        </div>
      );
    }

    // Data Warehouse Configuration
    if (currentSourceType === "datawarehouse") {
      const fields = currentLocation === "on-prem"
        ? [
          {
            name: "warehouseType",
            label: "Data Warehouse Type",
            type: "select",
            placeholder: "Select warehouse type",
            options: [
              { value: "teradata", label: "Teradata" },
              { value: "netezza", label: "Netezza" },
              { value: "vertica", label: "Vertica" }
            ]
          },
          {
            name: "host",
            label: "Host",
            placeholder: "warehouse.company.com",
            description: "Data warehouse server hostname or IP"
          },
          {
            name: "port",
            label: "Port",
            type: "number",
            placeholder: "Default port for selected warehouse type"
          },
          {
            name: "connectionString",
            label: "JDBC/ODBC Connection String",
            type: "textarea",
            placeholder: "Full connection string with driver details",
            description: "Complete connection string including driver information"
          },
          {
            name: "authMethod",
            label: "Auth Method",
            type: "select",
            placeholder: "Select authentication method",
            options: [
              { value: "userpass", label: "Username/Password" },
              { value: "kerberos", label: "Kerberos" },
              { value: "ldap", label: "LDAP" }
            ]
          }
        ]
        : [
          {
            name: "provider",
            label: "Cloud Provider",
            type: "select",
            placeholder: "Select cloud data warehouse",
            options: [
              { value: "snowflake", label: "Snowflake" },
              { value: "redshift", label: "Amazon Redshift" },
              { value: "bigquery", label: "Google BigQuery" },
              { value: "synapse", label: "Azure Synapse" }
            ]
          },
          {
            name: "authMethod",
            label: "Auth Method",
            type: "select",
            placeholder: "Select authentication method",
            options: [
              { value: "iam", label: "IAM" },
              { value: "keypair", label: "Key Pair" },
              { value: "oauth", label: "OAuth" }
            ]
          },
          {
            name: "accountId",
            label: "Account ID / Project ID",
            placeholder: "Your account or project identifier",
            description: "Account ID for Snowflake, Project ID for BigQuery, etc."
          },
          {
            name: "database",
            label: "Database Name",
            placeholder: "Database name"
          },
          {
            name: "schema",
            label: "Schema Name",
            placeholder: "Schema name"
          },
          {
            name: "sslRequired",
            label: "SSL Required",
            type: "toggle",
            toggleLabel: "SSL connection required",
            defaultValue: true
          },
          {
            name: "vpcPeering",
            label: "VPC Peering",
            type: "toggle",
            toggleLabel: "Enable VPC peering"
          }
        ];

      return (
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-medium text-gray-900 mb-2">Data Warehouse Configuration</h3>
            <p className="text-sm text-gray-600">
              {currentLocation === "on-prem"
                ? "Configure connection to your on-premises data warehouse"
                : "Configure connection to your cloud data warehouse with enterprise security"}
            </p>
          </div>
          {renderCommonFields(fields)}
        </div>
      );
    }

    // Default fallback
    return (
      <div className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="font-medium text-gray-900 mb-2">
            Configuration Required
          </h3>
          <p className="text-sm text-gray-600">
            Configuration options for {currentSourceType} ({currentLocation})
            will be displayed here.
          </p>
        </div>
      </div>
    );
  };

  // Main render function continues...
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="sourceName"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">Source Name</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="Enter a name for this data source"
                          {...field}
                          className={cn(
                            "!bg-white !text-gray-900 placeholder:!text-gray-500 pr-10",
                            fieldState.error
                              ? "border-red-500 ring-1 ring-red-500 focus:ring-red-500"
                              : "border-gray-200"
                          )}
                        />
                        {fieldState.error && (
                          <div className="absolute right-2 top-2.5 text-red-500">
                          </div>
                        )}
                      </div>
                    </FormControl>
                    {fieldState.error ? (
                      <p className="text-sm text-red-600 mt-1">
                        The source name you entered is required. Please enter a valid name.
                      </p>
                    ) : (
                      <FormDescription className="text-xs text-gray-600">
                        A unique and descriptive name for your data source
                      </FormDescription>
                    )}
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sourceType"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">Source Type</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Select
                          onValueChange={(val) => {
                            field.onChange(val);
                            handleSourceTypeChange(val);
                          }}
                          value={field.value}
                        >
                          <SelectTrigger
                            className={cn(
                              "!bg-white !text-gray-900 placeholder:!text-gray-500 pr-10",
                              fieldState.error
                                ? "border-red-500 ring-1 ring-red-500 focus:ring-red-500"
                                : "border-gray-200"
                            )}
                          >
                            <SelectValue placeholder="Select source type" />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            <SelectItem value="sql" className="text-gray-900">SQL Database</SelectItem>
                            <SelectItem value="oracle" className="text-gray-900">Oracle DB</SelectItem>
                            <SelectItem value="postgresql" className="text-gray-900">PostgreSQL</SelectItem>
                            <SelectItem value="mongodb" className="text-gray-900">MongoDB</SelectItem>
                            <SelectItem value="files" className="text-gray-900">Files</SelectItem>
                            <SelectItem value="blob" className="text-gray-900">Blob Storage</SelectItem>
                            <SelectItem value="rest" className="text-gray-900">REST API</SelectItem>
                            <SelectItem value="datawarehouse" className="text-gray-900">Data Warehouse</SelectItem>
                          </SelectContent>
                        </Select>
                        {fieldState.error && (
                          <div className="absolute right-2 top-2.5 text-red-500">
                          </div>
                        )}
                      </div>
                    </FormControl>
                    {fieldState.error ? (
                      <p className="text-sm text-red-600 mt-1">
                        Please select a source type to continue.
                      </p>
                    ) : (
                      <FormDescription className="text-xs text-gray-600">
                        The type of data source you want to connect to
                      </FormDescription>
                    )}
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <FormLabel>Source Location</FormLabel>
              <Tabs
                defaultValue="on-prem"
                value={location}
                className="w-full"
                onValueChange={handleLocationChange}
              >
                <TabsList className="grid w-full grid-cols-2 bg-white border-gray-200">
                  <TabsTrigger
                    value="on-prem"
                    className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-[#2196F3] text-gray-600"
                  >
                    <Server className="h-4 w-4" />
                    On-Premises
                  </TabsTrigger>
                  <TabsTrigger
                    value="cloud"
                    className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-[#2196F3] text-gray-600"
                  >
                    <Globe className="h-4 w-4" />
                    Cloud
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="on-prem" className="mt-4">
                  <div className="bg-blue-50 p-4 rounded-md border border-gray-200">
                    <p className="text-sm text-gray-600">
                      Connect to data sources hosted in your local
                      infrastructure or private cloud.
                    </p>
                  </div>
                </TabsContent>
                <TabsContent value="cloud" className="mt-4">
                  <div className="bg-blue-50 p-4 rounded-md border border-gray-200">
                    <p className="text-sm text-gray-600">
                      Connect to cloud-hosted data sources like AWS RDS, Azure
                      SQL, or Google Cloud SQL.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        );
      case 2:
        return renderConfigurationStep();
      case 3:
        return renderDataSelectionStep();
      case 4:
        return renderConfirmationStep();
      default:
        return null;
    }
  };

  const stepTitles = {
    1: "Basic Information",
    2: "Configuration",
    3: "Data Selection",
    4: "Confirmation",
  };

  return (
    <Card className="w-full max-w-6xl mx-auto bg-white border-gray-200 shadow-lg">
      <CardHeader className="relative bg-gradient-to-r from-blue-50 to-white border-b border-gray-200">
        <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Database className="h-6 w-6 text-[#2196F3]" />
          Add Data Source - {stepTitles[step]}
        </CardTitle>
        <div className="absolute top-8 right-9 z-50 flex items-center gap-4">
          <ToggleButton
            checked={sourceStatus === "Active"}
            onChange={() =>
              setSourceStatus((prev) =>
                prev === "Active" ? "Inactive" : "Active"
              )
            }
          />
          {/* Status text */}
          <span
            className={`text-sm font-medium w-[40px] text-right ${sourceStatus === "Active" ? "text-green-600" : "text-red-500"
              }`}
          >
            {sourceStatus}
          </span>
        </div>



        {/* Progress indicator */}
        <div className="flex items-center space-x-2 mt-4">
          {[1, 2, 3, 4].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${stepNumber <= step
                  ? "bg-[#2196F3] text-white"
                  : "bg-gray-200 text-gray-500"
                  }`}
              >
                {stepNumber}
              </div>
              {stepNumber < 4 && (
                <ChevronRight
                  className={`h-4 w-4 mx-2 ${stepNumber < step ? "text-[#2196F3]" : "text-gray-300"
                    }`}
                />
              )}
            </div>
          ))}
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {renderStep()}
          </form>
        </Form>
      </CardContent>

      <CardFooter className="bg-blue-50 border-t border-gray-200 flex justify-between p-6">
        <div className="flex space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="border-gray-200 text-gray-600 hover:bg-white"
          >
            Cancel
          </Button>
          {step > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              className="border-gray-200 text-gray-600 hover:bg-white"
            >
              Previous
            </Button>
          )}
        </div>

        <div className="flex space-x-3">

          {step < 4 ? (
            <Button
              type="button"
              onClick={nextStep}
              className="bg-[#2196F3] hover:bg-[#1976D2] text-white"
            >
              Next
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSaveSource}
              className="bg-[#2196F3] hover:bg-[#1976D2] text-white"
            >
              {mode === "edit" ? "Edit Source" : "Save Source"}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}