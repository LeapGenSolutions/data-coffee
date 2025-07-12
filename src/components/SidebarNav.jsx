import React from "react";
import { Button } from "../components/ui/button";
import { cn } from "../lib/utils";
import { Link } from "wouter";
import SidebarNavButton from "./SidebarNavButton";

export default function SidebarNav({ navigation, location, workspaces, wouterNavigate, onMobileClose }) {
  return (
    <nav className="flex-1 p-4 space-y-2 bg-gradient-to-b from-transparent to-gray-50/30">
      {navigation.map((item) => {
        const isActive = location === item.href;
        const IconComponent = item.icon;
        if (item.name === "Admin Panel") {
          return (
            <SidebarNavButton
              key={item.name}
              item={item}
              location={location}
              workspaces={workspaces}
              wouterNavigate={wouterNavigate}
              onMobileClose={onMobileClose}
              type="admin"
            />
          );
        }
        if (item.name === "User Management") {
          return (
            <SidebarNavButton
              key={item.name}
              item={item}
              location={location}
              workspaces={workspaces}
              wouterNavigate={wouterNavigate}
              onMobileClose={onMobileClose}
              type="user-management"
            />
          );
        }
        // Default for other items
        return (
          <Link key={item.name} href={item.href}>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-2 h-10 transition-all duration-200",
                isActive
                  ? "bg-gradient-to-r from-[#2196F3] to-[#1976D2] text-white shadow-md transform scale-105"
                  : "text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 hover:text-[#2196F3] hover:shadow-sm"
              )}
              onClick={onMobileClose}
            >
              <IconComponent className="h-4 w-4" />
              {item.name}
            </Button>
          </Link>
        );
      })}
    </nav>
  );
}
