import React, { useState } from "react";
import { Button } from "../components/ui/button";

export default function WorkspaceSubSidebar({ workspaces, isLoading, selectedWorkspaceId, setSelectedWorkspaceId }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div
      className={
        `fixed inset-y-0 left-64 z-40 ${collapsed ? 'w-10' : 'w-56'} bg-gradient-to-b from-blue-50 via-white to-gray-100 border-r border-gray-200 shadow-md flex flex-col transition-all duration-300`
      }
    >
      <div className="flex items-center justify-between p-2 border-b font-semibold text-gray-700 bg-gradient-to-r from-blue-100 to-white">
        {!collapsed && <span>Workspaces</span>}
        <button
          className="ml-auto p-1 rounded hover:bg-blue-200 text-gray-600"
          title={collapsed ? 'Expand' : 'Collapse'}
          onClick={() => setCollapsed((c) => !c)}
        >
          {collapsed ? (
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
          ) : (
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
          )}
        </button>
      </div>
      {!collapsed && (
        <div className="flex-1 overflow-y-auto p-2">
          {isLoading ? (
            <div className="text-gray-500 text-sm p-2">Loading...</div>
          ) : workspaces && workspaces.length > 0 ? (
            <ul className="space-y-1">
              {workspaces.map((ws) => {
                const wsId = ws.id || ws._id;
                const isSelected = wsId === selectedWorkspaceId;
                return (
                  <li key={wsId}>
                    <Button
                      variant={isSelected ? "secondary" : "ghost"}
                      className={
                        "w-full justify-start text-gray-800 hover:bg-blue-100" +
                        (isSelected ? " bg-blue-200 font-semibold" : "")
                      }
                      onClick={() => setSelectedWorkspaceId(wsId)}
                    >
                      {ws.name || ws.workspaceName || ws.id}
                    </Button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="text-gray-400 text-sm p-2">No workspaces found.</div>
          )}
        </div>
      )}
    </div>
  );
}
