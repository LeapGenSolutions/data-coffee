import React, { useState } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Button } from "../components/ui/button";
import { Search, Plus } from "lucide-react";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";

// Report status and data types

// Mock data
const reports = [
  {
    id: 1,
    title: "Sales Performance",
    status: "published",
    lastUpdated: "2 days ago",
    collaborators: [
      { id: 1, name: "John Doe", initials: "JD", color: "bg-blue-500" },
      { id: 2, name: "Kate Lee", initials: "KL", color: "bg-green-500" },
      { id: 3, name: "Mark Smith", initials: "MS", color: "bg-yellow-500" },
      { id: 4, name: "Emily Chen", initials: "EC", color: "bg-pink-500" },
      { id: 5, name: "David Kim", initials: "DK", color: "bg-purple-500" },
    ],
    imageUrl: "https://placehold.co/600x400/e9ecef/495057?text=Sales+Performance&font=roboto",
  },
  {
    id: 2,
    title: "Marketing Analytics",
    status: "draft",
    lastUpdated: "5 days ago",
    collaborators: [
      { id: 6, name: "Tracy Smith", initials: "TS", color: "bg-purple-500" },
      { id: 7, name: "Alex Rowe", initials: "AR", color: "bg-pink-500" },
    ],
    imageUrl: "https://placehold.co/600x400/e9ecef/495057?text=Marketing+Analytics&font=roboto",
  },
  {
    id: 3,
    title: "Financial Summary",
    status: "published",
    lastUpdated: "1 week ago",
    collaborators: [
      { id: 8, name: "Madhu Chanthati", initials: "MC", color: "bg-red-500" },
      { id: 9, name: "Sarah Johnson", initials: "SJ", color: "bg-indigo-500" },
      { id: 10, name: "Tom Wilson", initials: "TW", color: "bg-green-500" },
    ],
    imageUrl: "https://placehold.co/600x400/e9ecef/495057?text=Financial+Summary&font=roboto",
  },
  {
    id: 4,
    title: "Customer Insights",
    status: "published",
    lastUpdated: "2 weeks ago",
    collaborators: [
      { id: 11, name: "Priya Patel", initials: "PP", color: "bg-orange-500" },
      { id: 12, name: "Wei Chen", initials: "WC", color: "bg-teal-500" },
    ],
    imageUrl: "https://placehold.co/600x400/e9ecef/495057?text=Customer+Insights&font=roboto",
  },
  {
    id: 5,
    title: "Inventory Analysis",
    status: "draft",
    lastUpdated: "3 weeks ago",
    collaborators: [
      { id: 13, name: "Carlos Rodriguez", initials: "CR", color: "bg-yellow-500" },
      { id: 14, name: "Lisa Wong", initials: "LW", color: "bg-blue-500" },
      { id: 15, name: "Mike Thompson", initials: "MT", color: "bg-green-500" },
    ],
    imageUrl: "https://placehold.co/600x400/e9ecef/495057?text=Inventory+Analysis&font=roboto",
  },
  {
    id: 6,
    title: "Supply Chain Dashboard",
    status: "published",
    lastUpdated: "1 month ago",
    collaborators: [
      { id: 16, name: "Anna Smith", initials: "AS", color: "bg-purple-500" },
      { id: 17, name: "Jack Brown", initials: "JB", color: "bg-pink-500" },
    ],
    imageUrl: "https://placehold.co/600x400/e9ecef/495057?text=Supply+Chain+Dashboard&font=roboto",
  },
];

export function ReportGrid() {
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isNewReportModalOpen, setIsNewReportModalOpen] = useState(false);

  // Filter reports
  const filteredReports = reports.filter((report) => {
    const matchesFilter = filter === "all" || report.status === filter;
    const matchesSearch = report.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Status badge color
  const getStatusBadge = (status) => {
    switch (status) {
      case "published":
        return <Badge variant="success">Published</Badge>;
      case "draft":
        return <Badge variant="secondary">Draft</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <Select
            value={filter}
            onValueChange={setFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Reports" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Reports</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>

          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search reports..."
              className="pl-8 w-[200px] md:w-[250px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Dialog open={isNewReportModalOpen} onOpenChange={setIsNewReportModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Report
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Report</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="report-name" className="text-sm font-medium">
                  Report Name
                </label>
                <Input id="report-name" placeholder="Enter report name" />
              </div>
              <div className="space-y-2">
                <label htmlFor="report-type" className="text-sm font-medium">
                  Report Type
                </label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dashboard">Dashboard</SelectItem>
                    <SelectItem value="analysis">Analysis</SelectItem>
                    <SelectItem value="summary">Summary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label htmlFor="report-description" className="text-sm font-medium">
                  Description
                </label>
                <textarea
                  id="report-description"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Enter report description"
                />
              </div>
              <div className="pt-4 flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsNewReportModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsNewReportModalOpen(false)}>
                  Create
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReports.map((report) => (
          <Card key={report.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-w-16 aspect-h-9 bg-muted">
              <div className="flex items-center justify-center h-48 bg-muted">
                <img 
                  src={report.imageUrl} 
                  alt={`${report.title} preview`} 
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-1">
                <h4 className="font-medium">{report.title}</h4>
                {getStatusBadge(report.status)}
              </div>
              <p className="text-sm text-muted-foreground">
                Last updated: {report.lastUpdated}
              </p>
              <div className="flex items-center justify-between mt-4">
                <div className="flex -space-x-2">
                  {report.collaborators.slice(0, 3).map((collab) => (
                    <Avatar key={collab.id} className={`${collab.color} border-2 border-background h-6 w-6`}>
                      <AvatarFallback className="text-xs text-white">
                        {collab.initials}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {report.collaborators.length > 3 && (
                    <Avatar className="bg-muted border-2 border-background h-6 w-6">
                      <AvatarFallback className="text-xs">
                        +{report.collaborators.length - 3}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
                <Button variant="link" size="sm">
                  {report.status === "draft" ? "Edit" : "View"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredReports.length === 0 && (
          <div className="col-span-full flex justify-center items-center h-48 bg-muted/20 rounded-lg border border-dashed">
            <div className="text-center">
              <p className="text-muted-foreground">No reports found</p>
              <Button 
                variant="link" 
                onClick={() => setIsNewReportModalOpen(true)}
                className="mt-2"
              >
                Create a new report
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
