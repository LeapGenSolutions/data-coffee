import React from "react";
import { Button } from "../components/ui/button";
import { cn } from "../lib/utils";

export default function SidebarNavButton({
  item,
  location,
  workspaces,
  wouterNavigate,
  onMobileClose,
  type // 'admin' or 'user-management'
}) {
  const isActive = type === 'admin'
    ? location.startsWith("/admin")
    : (location.startsWith("/user-management") || location.startsWith("/user"));
  const IconComponent = item.icon;
  const fallback = type === 'admin' ? '/admin' : '/user-management';
  return (
    <Button
      key={item.name}
      variant="ghost"
      className={cn(
        "w-full justify-start gap-2 h-10 transition-all duration-200",
        isActive
          ? "bg-gradient-to-r from-[#2196F3] to-[#1976D2] text-white shadow-md transform scale-105"
          : "text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 hover:text-[#2196F3] hover:shadow-sm"
      )}
      onClick={() => {
        onMobileClose && onMobileClose();
        const firstId = workspaces && workspaces.length > 0 ? (workspaces[0].id || workspaces[0]._id) : null;
        if (firstId) {
          wouterNavigate(`${fallback}`);
        } else {
          wouterNavigate(fallback);
        }
      }}
    >
      <IconComponent className="h-4 w-4" />
      {item.name}
    </Button>
  );
}
