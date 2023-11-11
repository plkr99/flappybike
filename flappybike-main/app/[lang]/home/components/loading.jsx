import React from "react";

export default function LoadingSettings() {
  return (
    <div role="status" className="space-y-10 animate-pulse">
      {[...Array(3)].map((element) => (
        <div key={Math.random()} className="space-y-3">
          <div className="h-2.5 bg-gray-200 rounded-md dark:bg-gray-700 w-32"></div>
          <div className="flex items-center w-full">
            <div className="h-10 bg-gray-200 rounded-md dark:bg-gray-700 w-full "></div>
          </div>
        </div>
      ))}

      <span className="sr-only">Loading...</span>
    </div>
  );
}
