"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { Table2, Home, X } from "lucide-react";
import { cn } from "@/lib/utils";
import HomeFloating from "./HomeFloating";
import TableFloating from "./TableFloating";

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  );
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg px-1",
        className
      )}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "data-[state=active]:bg-gradient-to-tl data-[state=active]:from-blue-500 data-[state=active]:to-blue-700 data-[state=active]:text-white hover:text-black focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring inline-flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  );
}

interface TabsFloatingProps {
  isVisible: boolean;
  defaultTab?: string;
  view: string;
  setView: React.Dispatch<React.SetStateAction<string>>;
  toggleTabs: () => void;
}

export default function TabsFloating({
  isVisible,
  defaultTab = "home",
  toggleTabs,
}: TabsFloatingProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-2xl bg-white rounded-lg shadow-xl">
      <div className="absolute top-2 right-2">
        <button
          onClick={toggleTabs}
          className="p-1 rounded-full hover:bg-gradient-to-r from-blue-500 to-blue-700 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <Tabs
        defaultValue={defaultTab}
        className="w-full mx-auto items-center border border-md rounded-lg p-4 bg-white shadow-xl"
      >
        <div className="flex items-center justify-center gap-4"></div>
        <TabsList className="grid grid-cols-2 mb-4 gap-4 shadow-md border-t">
          <TabsTrigger value="home" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            <span>Home</span>
          </TabsTrigger>
          <TabsTrigger value="table" className="flex items-center gap-2">
            <Table2 className="h-4 w-4" />
            <span>Data Table</span>
          </TabsTrigger>
        </TabsList>

        {/* Home and Data Table */}
        <div className="min-h-[310px] min-w-[300px]">
          <HomeFloating />
          <TableFloating />
        </div>
      </Tabs>
    </div>
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
