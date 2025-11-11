import { Skeleton } from "./ui/skeleton";
import { Card, CardContent, CardHeader } from "./ui/card";
import { motion } from "motion/react";

export function LoadingSkeleton() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-background pb-4 pt-0 px-4 md:p-6 lg:p-8"
    >
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Sticky Header for Mobile - matches App.tsx layout */}
        <div className="md:static sticky top-0 z-50 bg-background md:pt-0 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 space-y-4 md:space-y-8 md:shadow-none shadow-sm border-b md:border-b-0 pt-[40px] pr-[16px] pb-[16px] pl-[16px]">
          {/* Desktop: Split layout (Title left | Controls right) | Mobile: Stacked */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 md:gap-8">
            {/* LEFT SECTION: Title & Subtitle */}
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-left space-y-2 pt-2 relative flex-shrink-0"
            >
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-5 w-full max-w-xs md:max-w-md" />
            </motion.div>

            {/* RIGHT SECTION: Month Selector with Controls */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="md:flex-shrink-0"
            >
              <Skeleton className="h-12 w-full md:w-auto md:min-w-[400px] rounded-lg" />
            </motion.div>
          </div>
        </div>

        {/* Budget Overview Cards - Cleaner Mobile Layout */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4"
        >
          {/* Card 1: Total Pemasukan & Pengeluaran */}
          <Card>
            <CardContent className="p-4 md:p-6 space-y-4 md:space-y-5">
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-7 w-32 md:h-8 md:w-40" />
              </div>
              <Skeleton className="h-px w-full" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-7 w-32 md:h-8 md:w-40" />
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Sisa Budget */}
          <Card>
            <CardHeader className="pb-3 px-4 pt-4 md:px-6 md:pt-6">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="size-7 rounded-md" />
              </div>
            </CardHeader>
            <CardContent className="pt-0 px-4 pb-4 md:px-6 md:pb-6 space-y-3">
              <Skeleton className="h-9 w-36 md:h-10 md:w-48" />
              <Skeleton className="h-5 w-16 md:h-6 md:w-20 rounded-full" />
            </CardContent>
          </Card>
        </motion.div>

        {/* Pockets Summary Section - Mobile Optimized */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          <Card>
            <CardHeader className="px-4 py-4 md:px-6 md:py-6">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-28 md:h-6 md:w-32" />
                <Skeleton className="size-7 md:size-8 rounded-md" />
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4 md:px-6 md:pb-6 space-y-3">
              {/* Pocket Cards - 2 items for mobile */}
              {[1, 2].map((i) => (
                <Card key={i} className="border border-border/50">
                  <CardContent className="p-3 md:p-4">
                    <div className="flex items-center justify-between mb-2.5 md:mb-3">
                      <div className="flex items-center gap-2">
                        <Skeleton className="size-7 md:size-8 rounded-md" />
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-24 md:w-32" />
                          <Skeleton className="h-3 w-16 md:w-24" />
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Skeleton className="size-6 md:size-7 rounded-md" />
                        <Skeleton className="size-6 md:size-7 rounded-md" />
                      </div>
                    </div>
                    <div className="space-y-1.5 md:space-y-2">
                      <div className="flex justify-between">
                        <Skeleton className="h-3 w-20 md:w-24" />
                        <Skeleton className="h-3 w-16 md:w-20" />
                      </div>
                      <Skeleton className="h-px w-full" />
                      <div className="flex justify-between">
                        <Skeleton className="h-4 w-24 md:w-28" />
                        <Skeleton className="h-4 w-20 md:w-24" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs Section - Simplified for Mobile */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="space-y-3">
            {/* Tab List */}
            <Skeleton className="h-10 w-full rounded-lg" />
            
            {/* Add Button - Hidden on mobile (FAB replaces it) */}
            <Skeleton className="h-10 w-full rounded-lg hidden md:block" />
            
            {/* List Content */}
            <Card>
              <CardHeader className="px-4 py-4 md:px-6 md:py-6">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-36 md:h-6 md:w-48" />
                  <div className="flex items-center gap-1.5 md:gap-2">
                    <Skeleton className="size-6 md:size-7 rounded-md" />
                    <Skeleton className="size-6 md:size-7 rounded-md" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4 md:px-6 md:pb-6 space-y-3">
                {/* Simplified for mobile - 1 group with 3 items */}
                <div className="space-y-2">
                  {/* Date Header */}
                  <div className="flex items-center justify-between px-2 py-1.5">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4 md:h-5 md:w-5" />
                      <Skeleton className="h-4 w-24 md:h-5 md:w-32" />
                    </div>
                    <Skeleton className="h-4 w-20 md:h-5 md:w-24" />
                  </div>
                  
                  {/* Expense Items */}
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between px-2 py-1.5 md:py-2"
                    >
                      <Skeleton className="h-4 w-32 md:w-40" />
                      <div className="flex items-center gap-1.5 md:gap-2">
                        <Skeleton className="h-4 w-20 md:w-24" />
                        <Skeleton className="size-5 md:size-6 rounded-md md:hidden" />
                        <Skeleton className="size-6 rounded-md hidden md:block" />
                        <Skeleton className="size-6 rounded-md hidden md:block" />
                      </div>
                    </div>
                  ))}
                </div>
                
                <Skeleton className="h-px w-full" />
                
                {/* Total */}
                <div className="flex justify-between px-2 py-1">
                  <Skeleton className="h-4 w-24 md:h-5 md:w-32" />
                  <Skeleton className="h-4 w-24 md:h-5 md:w-32" />
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Loading indicator - Subtle pulse animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="flex items-center justify-center gap-1.5 py-6 md:py-8"
        >
          <motion.div
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="size-1.5 rounded-full bg-primary/60"
          />
          <motion.div
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.15,
            }}
            className="size-1.5 rounded-full bg-primary/60"
          />
          <motion.div
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.3,
            }}
            className="size-1.5 rounded-full bg-primary/60"
          />
        </motion.div>
      </div>
    </motion.div>
  );
}
