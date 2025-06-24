import React from "react";
import { Database } from "lucide-react";

export function DataCoffeeLogo({ className, size = "md", interactive = true }) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12", 
    lg: "w-16 h-16"
  };

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl"
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`${sizeClasses[size]} bg-gradient-to-br from-[#2196F3] to-[#1976D2] rounded-lg flex items-center justify-center ${interactive ? 'hover:scale-105 transition-transform' : ''}`}>
        <Database className="w-1/2 h-1/2 text-white" />
      </div>
      <div className="flex flex-col">
        <span className={`font-bold text-gray-900 ${textSizeClasses[size]}`}>
          Data Coffee
        </span>
        <span className="text-xs text-gray-600 font-medium">
          Optimize Data Compliance
        </span>
      </div>
    </div>
  );
}