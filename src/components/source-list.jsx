import React, { useState, useMemo } from "react";
import {
  Search,
  Plus,
  ArrowUpDown,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Database,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../components/ui/pagination";
import { useToast } from "../hooks/use-toast";

export default function SourceList({
  sources = [],
  onAddSource,
  onEditSource,
  onDeleteSource,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [selectedSources, setSelectedSources] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { toast } = useToast();

  // Filter sources based on search term
  const filteredSources = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return sources.filter(
      (source) =>
        (source.name ?? "").toLowerCase().includes(term) ||
        (source.type ?? "").toLowerCase().includes(term) ||
        (source.status ?? "").toLowerCase().includes(term)
    );
  }, [sources, searchTerm]);

  // Sort sources
  const sortedSources = useMemo(() => {
    return [...filteredSources].sort((a, b) => {
      const aValue = (a[sortField] ?? "").toString();
      const bValue = (b[sortField] ?? "").toString();

      if (sortDirection === "asc") {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });
  }, [filteredSources, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(sortedSources.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSources = sortedSources.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleSelectSource = (sourceId, checked) => {
    if (checked) {
      setSelectedSources([...selectedSources, sourceId]);
    } else {
      setSelectedSources(selectedSources.filter((id) => id !== sourceId));
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedSources(paginatedSources.map((source) => source.id));
    } else {
      setSelectedSources([]);
    }
  };

  const handleDelete = (source) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${source.name}"? This action cannot be undone.`
      )
    ) {
      if (onDeleteSource) {
        onDeleteSource(source.id);
        toast({
          title: "Source Deleted",
          description: `${source.name} has been removed from your data sources.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Delete Source",
          description: `${source.name} would be deleted here`,
          variant: "destructive",
        });
      }
    }
  };

  const handleView = (source) => {
    // Create a detailed view modal or navigate to details page
    const details = `
Source Details:
- Name: ${source.name}
- Type: ${source.type}
- Location: ${source.location}
- Status: ${source.status}
- Created: ${new Date(source.createdAt).toLocaleDateString()}
- Last Sync: ${new Date(source.lastSync).toLocaleDateString()}
${source.customPrompt ? `- Custom Prompt: ${source.customPrompt}` : ""}
${
  source.dataSelectionMode
    ? `- Data Selection: ${source.dataSelectionMode}`
    : ""
}
    `.trim();

    alert(details);

    toast({
      title: "Source Details",
      description: `Viewing configuration for ${source.name}`,
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { className: "bg-[#4CAF50] text-white" },
      maintenance: { className: "bg-[#FF9800] text-white" },
      inactive: { className: "bg-[#F44336] text-white" },
    };

    const config = statusConfig[status] || statusConfig.inactive;

    return (
      <Badge className={config.className}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Data Sources</h3>
          <p className="text-sm text-gray-600">
            Manage your connected data sources and brewing configurations
          </p>
        </div>
        <Button
          onClick={onAddSource}
          className="bg-[#2196F3] hover:bg-[#1976D2] text-white flex items-center gap-2 rounded-lg"
        >
          <Plus className="h-4 w-4" />
          Add Source
        </Button>
      </div>

      {filteredSources.length > 0 ? (
        <div className="space-y-4">
          {/* Search and filters */}
          <div className="flex items-center space-x-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search sources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-black text-white border-gray-600 placeholder-gray-400 focus:border-gray-400 focus:ring-gray-400"
              />
            </div>
          </div>

          {/* Table */}
          <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 border-gray-200">
                  <TableHead className="w-12 text-gray-700">
                    <Checkbox
                      checked={
                        selectedSources.length === paginatedSources.length &&
                        paginatedSources.length > 0
                      }
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead
                    className="cursor-pointer text-gray-700 font-medium"
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Name</span>
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer text-gray-700 font-medium"
                    onClick={() => handleSort("type")}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Type</span>
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="text-gray-700 font-medium">
                    Location
                  </TableHead>
                  <TableHead className="text-gray-700 font-medium">
                    Auth Type
                  </TableHead>
                  <TableHead
                    className="cursor-pointer text-gray-700 font-medium"
                    onClick={() => handleSort("status")}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Status</span>
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="text-gray-700 font-medium">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedSources.map((source) => (
                  <TableRow
                    key={source.id}
                    className="bg-white hover:bg-gray-50 border-gray-200"
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedSources.includes(source.id)}
                        onCheckedChange={(checked) =>
                          handleSelectSource(source.id, checked)
                        }
                      />
                    </TableCell>
                    <TableCell className="font-medium text-[#2196F3]">
                      {source.name}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {source.type}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {source.location || "N/A"}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {source.configuration?.authType ||
                        source.configuration?.authMethod ||
                        "N/A"}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(source.status?.toLowerCase() || "active")}
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
                        <DropdownMenuContent
                          align="end"
                          className="bg-white border-gray-200"
                        >
                          <DropdownMenuItem
                            onClick={() => handleView(source)}
                            className="text-gray-700 hover:bg-gray-100"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onEditSource(source)}
                            className="text-gray-700 hover:bg-gray-100"
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(source)}
                            className="text-red-600 hover:bg-gray-100"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {startIndex + 1} to{" "}
                {Math.min(startIndex + itemsPerPage, sortedSources.length)} of{" "}
                {sortedSources.length} sources
              </div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() =>
                        setCurrentPage(Math.max(1, currentPage - 1))
                      }
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCurrentPage(page)}
                          isActive={currentPage === page}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  )}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        setCurrentPage(Math.min(totalPages, currentPage + 1))
                      }
                      className={
                        currentPage === totalPages
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-50 flex items-center justify-center">
            <Database className="h-8 w-8 text-[#2196F3]" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No data sources yet
          </h3>
          <p className="text-gray-600 mb-4">
            Start by adding your first data source to begin analyzing data
          </p>
          <Button
            onClick={onAddSource}
            variant="outline"
            className="border-[#2196F3] text-[#2196F3] hover:bg-blue-50"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add your first source
          </Button>
        </div>
      )}
    </div>
  );
}
