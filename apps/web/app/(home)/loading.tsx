import React from "react";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Card, CardContent, CardHeader } from "@workspace/ui/components/card";

// Profile skeleton component
export function ProfileSkeleton() {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Profile Image Skeleton */}
          <div className="relative">
            <Skeleton className="w-32 h-32 rounded-full" />
          </div>

          {/* Profile Info Skeleton */}
          <div className="flex-1">
            <Skeleton className="h-7 w-48 mb-2 mx-auto sm:mx-0" />
            <Skeleton className="h-5 w-32 mb-4 mx-auto sm:mx-0" />

            <div className="mt-4 flex flex-wrap gap-2 justify-center sm:justify-start">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-14" />
            </div>
          </div>

          <Skeleton className="h-9 w-32 mt-4 sm:mt-0" />
        </div>
      </CardContent>
    </Card>
  );
}

// Stats skeleton component
export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-10 w-16 mb-2" />
            <Skeleton className="h-4 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Main loading component that combines both skeletons
export default function Loading() {
  return (
    <div className="container p-6">
      <h1 className="text-2xl font-bold mb-6 dark:text-white">Loading...</h1>
      <ProfileSkeleton />
      <StatsSkeleton />
    </div>
  );
}
