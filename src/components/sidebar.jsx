import { useLocation } from "wouter";
import { cn } from "../lib/utils";
import { Button } from "../components/ui/button";
import Logo from "../components/alien-logo";
import {
  Home,
  Settings,
  Users,
  LayoutGrid,
  LogOut,
  X
} from "lucide-react";

import { useSelector } from "react-redux";
import { useLocation as useWouterLocation } from "wouter";
import SidebarNav from "./SidebarNav";

const navigationBase = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Admin Panel", href: "/admin", icon: Settings, role: "barista" },
  { name: "User Management", href: "/user-management", icon: Users },
  { name: "Control Panel", href: "/control-panel", icon: LayoutGrid },
];


export function Sidebar({ isMobileOpen = false, onMobileClose }) {
  const [location] = useLocation();
  const [, wouterNavigate] = useWouterLocation();
  const user = useSelector((state) => state.me.me);
  const workspaces = useSelector((state) => state.workspaces.workspaces);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    window.location.href = '/';
  };

  const navigation = navigationBase.filter(item => {
    if (!item.role) return true;
    if (!user || !user.roles) return false;
    return user.roles.includes(item.role);
  });

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <div className="flex">
        <div className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-white via-gray-50 to-gray-100 border-r border-gray-200 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white shadow-sm">
              <div className="flex items-center gap-3">
                <Logo size="small" />
                <div className="flex flex-col">
                  <span className="font-bold text-gray-900 text-lg">Data Coffee</span>
                  <span className="text-xs text-gray-600 font-medium">Optimize Data Compliance</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onMobileClose}
                className="lg:hidden"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Navigation */}
            <SidebarNav
              navigation={navigation}
              location={location}
              workspaces={workspaces}
              wouterNavigate={wouterNavigate}
              onMobileClose={onMobileClose}
            />

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 text-gray-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:text-red-600 transition-all duration-200"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}