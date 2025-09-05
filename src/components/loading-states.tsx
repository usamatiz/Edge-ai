"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-gray-300 border-t-[#5046E5]",
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

interface LoadingSkeletonProps {
  className?: string;
  lines?: number;
}

export function LoadingSkeleton({ className, lines = 3 }: LoadingSkeletonProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={cn(
            "h-4 bg-gray-200 rounded animate-pulse",
            index === 0 ? "w-3/4" : index === 1 ? "w-1/2" : "w-5/6"
          )}
        />
      ))}
    </div>
  );
}

interface NavigationLoadingProps {
  className?: string;
}

export function NavigationLoading({ className }: NavigationLoadingProps) {
  return (
    <div className={cn("flex items-center justify-center p-4", className)}>
      <div className="flex items-center space-x-2">
        <LoadingSpinner size="sm" />
        <span className="text-sm text-gray-600">Loading...</span>
      </div>
    </div>
  );
}

interface ButtonLoadingProps {
  children: React.ReactNode;
  loading?: boolean;
  className?: string;
}

export function ButtonLoading({ children, loading, className }: ButtonLoadingProps) {
  return (
    <div className={cn("relative", className)}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
          <LoadingSpinner size="sm" />
        </div>
      )}
      <div className={cn(loading && "opacity-50 pointer-events-none")}>
        {children}
      </div>
    </div>
  );
}
