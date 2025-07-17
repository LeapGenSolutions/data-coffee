import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { StatisticsCards } from "../components/statistics-cards";
import { SourceForm } from "../components/source-form";
import SourceList from "../components/source-list";
import { ReportGrid } from "../components/report-grid";
import DashboardLayout from "../layouts/dashboard-layout";
import { ErrorBoundary } from "../components/ErrorBoundary.jsx";
import { useSelector } from "react-redux";
import useFetchSources from "../hooks/useFetchSources";

export default function AdminPanel() {
  const [showSourceForm, setShowSourceForm] = useState(false);

  //const currentUserEmail = useSelector((state) => state.me.me?.email);
  const workspaces = useSelector((state) => state.workspaces.workspaces);
  const [selectedWorkspace, setSelectedWorkspace] = useState([]);
  //console.log("Selected workspace ID:", selectedWorkspace?.id);

  // Set default workspace
  useEffect(() => {
    if (Array.isArray(workspaces) && workspaces.length > 0 && !selectedWorkspace?.id) {
      setSelectedWorkspace(workspaces[0]);
    }
  }, [workspaces, selectedWorkspace?.id]);

  // Fetch data sources from Cosmos
  const { sources, isLoading, error, refetch } = useFetchSources(selectedWorkspace?.id);

  const handleSourceSaved = () => {
    console.log("AdminPanel: New source saved. Triggering refetch.");
    refetch(); // re-fetch from Cosmos
  };

  const handleEditSource = (source) => {
    console.log("Editing source:", source);
    setShowSourceForm(true);
    // optionally set source in state if SourceForm supports editing
  };

  const handleDeleteSource = () => {
    console.log("Source deleted. Refetching...");
    refetch();
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <StatisticsCards />

        <Tabs defaultValue="setup" className="space-y-6">
          <TabsList>
            <TabsTrigger value="setup">Setup</TabsTrigger>
            <TabsTrigger value="report">Report</TabsTrigger>
          </TabsList>

          <TabsContent value="setup" className="space-y-6">
            <p className="text-gray-600">
              Manage system settings and users here. Configure data sources and authentication methods.
            </p>

            {showSourceForm ? (
              <ErrorBoundary>
                <SourceForm
                  onComplete={() => {
                    setShowSourceForm(false);
                    handleSourceSaved();
                  }}
                  onCancel={() => setShowSourceForm(false)}
                  currentWorkspace={selectedWorkspace}
                />
              </ErrorBoundary>
            ) : isLoading ? (
              <div className="text-gray-500">Loading sources...</div>
            ) : error ? (
              <div className="text-red-500">Failed to load sources</div>
            ) : (
              <SourceList
                sources={sources}
                onAddSource={() => setShowSourceForm(true)}
                onEditSource={handleEditSource}
                onDeleteSource={handleDeleteSource}
                selectedWorkspace={selectedWorkspace}
                setSelectedWorkspace={setSelectedWorkspace}
              />
            )}
          </TabsContent>

          <TabsContent value="report">
            <ReportGrid />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}