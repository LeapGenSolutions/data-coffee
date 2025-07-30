import React from "react";
import UserManagement from "../components/user-management";
import DashboardLayout from "../layouts/dashboard-layout";

export default function PipelineManagementPage() {
  return (
    <DashboardLayout>
      <UserManagement />
    </DashboardLayout>
  );
}