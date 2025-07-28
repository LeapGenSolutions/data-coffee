import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { StatisticsCards } from "../components/statistics-cards";
import { SourceForm } from "../components/source-form";
import SourceList from "../components/source-list";
import { ReportGrid } from "../components/report-grid";
import DashboardLayout from "../layouts/dashboard-layout";
import { useSelector } from "react-redux";
import useFetchSources from "../hooks/useFetchSources";
import { useLocation } from "wouter";
import useDeleteSource from '../hooks/useDeleteSource';

export default function AdminPanel() {
  const [location, setLocation] = useLocation();
  const [sources, setSources] = useState([]);

  const isAdd = location === "/admin/source";
  const isEdit = location.startsWith("/admin/source/edit/");
  const editingId = isEdit ? location.split("/").pop() : null;


  //const currentUserEmail = useSelector((state) => state.me.me?.email);
  const workspaces = useSelector((state) => state.workspaces.workspaces);
  const [selectedWorkspace, setSelectedWorkspace] = useState(() => workspaces[0] || []);
  const { sources: fetchedSources, isLoading, error, refetch } = useFetchSources(selectedWorkspace?.id);

  const deleteSourceMutation = useDeleteSource();
  
  useEffect(() => {
    if (!isLoading) {
      setSources(fetchedSources);
    }
  }, [isLoading, fetchedSources]);

  const editingSource = isEdit
    ? sources.find((s) => String(s.id) === editingId)
    : null;
  //console.log("Selected workspace ID:", selectedWorkspace?.id);

  // Set default workspace
  useEffect(() => {
    if (Array.isArray(workspaces) && workspaces.length > 0 && !selectedWorkspace?.id) {
      setSelectedWorkspace(workspaces[0]);
    }
  }, [workspaces, selectedWorkspace?.id]);

  // Fetch data sources from Cosmos

  const handleSourceSaved = () => {
    refetch();
    setLocation("/admin");
  };

  const handleDeleteSource = async (id, userId) => {
    try {
      await deleteSourceMutation.mutateAsync({ id, userId });
      console.log("Source deleted. Refetching...");
      refetch();
    } catch (err) {
      console.error("Error deleting source:", err);
    }
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

            {isAdd || isEdit ? (
              <SourceForm
                initialSource={editingSource}
                mode={isEdit ? "edit" : "add"}
                onSourceSaved={() => {
                  handleSourceSaved();
                }}
                onCancel={() => {
                  setLocation("/admin");
                }}
                currentWorkspace={selectedWorkspace}
              />
            ) : isLoading ? (
              <div className="text-gray-500">Loading sources...</div>
            ) : error ? (
              <div className="text-red-500">Failed to load sources</div>
            ) : (
              <SourceList
                sources={fetchedSources}
                onAddSource={() => setLocation("/admin/source")}
                onEditSource={(source) => setLocation(`/admin/source/edit/${source.id}`)}
                onDeleteSource={handleDeleteSource}
                selectedWorkspace={selectedWorkspace}
                setSelectedWorkspace={setSelectedWorkspace}
                onRefresh={refetch}
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