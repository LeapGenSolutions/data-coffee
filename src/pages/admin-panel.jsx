import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { StatisticsCards } from "../components/statistics-cards";
import { SourceForm } from "../components/source-form";
import SourceList from "../components/source-list";
import { ReportGrid } from "../components/report-grid";
import DashboardLayout from "../layouts/dashboard-layout";
import { ErrorBoundary } from "../components/ErrorBoundary.jsx";

export default function AdminPanel() {
  const [showSourceForm, setShowSourceForm] = useState(false);
  const [sources, setSources] = useState([
    {
      id: 1,
      name: "Customer Database",
      type: "sql",
      location: "on-prem",
      status: "Active",
      lastSync: "2024-01-15T10:30:00Z",
      createdAt: "2024-01-10T09:00:00Z"
    },
    {
      id: 2,
      name: "Sales Analytics",
      type: "postgresql",
      location: "cloud",
      status: "Active",
      lastSync: "2024-01-15T11:45:00Z",
      createdAt: "2024-01-12T14:20:00Z"
    }
  ]);

  const handleSourceSaved = (newSource) => {
    console.log("AdminPanel: handleSourceSaved called with:", newSource);
    setSources(prevSources => {
      const updated = [...prevSources, newSource];
      console.log("AdminPanel: Updated sources list:", updated);
      return updated;
    });
  };

  const handleEditSource = (source) => {
    // For now, just show the edit form with pre-populated data
    // In a full implementation, you'd pass the source data to the form
    console.log("Editing source:", source);
    setShowSourceForm(true);
  };

  const handleDeleteSource = (sourceId) => {
    setSources(prevSources => prevSources.filter(source => source.id !== sourceId));
  };
  
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
      {/* Dashboard Summary */}
      <StatisticsCards />
      
      {/* Tabs Navigation */}
      <Tabs defaultValue="setup" className="space-y-6">
        <TabsList>
          <TabsTrigger value="setup" className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            Setup
          </TabsTrigger>
          <TabsTrigger value="report" className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            Report
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="setup" className="space-y-6">
          <p className="text-gray-600">
            Manage system settings and users here. Configure data sources and authentication methods.
          </p>
          
          {showSourceForm ? (
            <ErrorBoundary>
              <SourceForm
                onComplete={() => setShowSourceForm(false)}
                onCancel={() => setShowSourceForm(false)}
                onSourceSaved={handleSourceSaved}
              />
            </ErrorBoundary>
          ) : (
            <SourceList 
              sources={sources}
              onAddSource={() => setShowSourceForm(true)}
              onEditSource={handleEditSource}
              onDeleteSource={handleDeleteSource}
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