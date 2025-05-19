import React from "react";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Tabs, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";

export default function TasksLoading() {
  return (
    <div className="container p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <Skeleton className="h-8 w-48" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-10" />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <Skeleton className="h-10 flex-grow" />
        <Skeleton className="h-10 w-full md:w-[200px]" />
        <Skeleton className="h-10 w-full md:w-[180px]" />
      </div>

      <div className="h-full w-full flex flex-col gap-4 p-4 bg-white dark:bg-gray-900 rounded-lg shadow-sm">
        <div className="flex items-center gap-4 mb-2">
          <Skeleton className="h-6 w-24" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>

        <Card className="border dark:border-gray-700">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, colIndex) => (
                <div key={colIndex} className="space-y-4">
                  <Skeleton className="h-8 w-full" />
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Card
                      key={i}
                      className="p-3 mb-3 border dark:border-gray-700"
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Skeleton className="h-5 w-3/4" />
                          <Skeleton className="h-5 w-6 rounded-full" />
                        </div>
                        <Skeleton className="h-4 w-full" />
                        <div className="flex gap-2 mt-2">
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-4 w-20" />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
