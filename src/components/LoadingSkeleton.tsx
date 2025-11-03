import { Skeleton } from "./ui/skeleton";
import { Card, CardContent, CardHeader } from "./ui/card";
import { motion } from "motion/react";

export function LoadingSkeleton() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-background p-4 md:p-8"
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center space-y-2"
        >
          <Skeleton className="h-10 w-64 mx-auto" />
          <Skeleton className="h-5 w-96 mx-auto" />
        </motion.div>

        {/* Month Selector */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          <Skeleton className="h-12 w-full max-w-md mx-auto" />
        </motion.div>

        {/* Budget Overview Cards - 2 columns */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {/* Card 1: Total Pemasukan & Pengeluaran */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardContent className="p-6 space-y-5">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="size-2 rounded-full" />
                  </div>
                  <Skeleton className="h-8 w-40" />
                </div>
                <Skeleton className="h-px w-full" />
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="size-2 rounded-full" />
                  </div>
                  <Skeleton className="h-8 w-40" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Card 2: Sisa Budget */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="size-7 rounded-md" />
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Budget Form Collapsible - Removed, now in dialog */}

        {/* Additional Income Section */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-48" />
                <div className="flex items-center gap-2">
                  <Skeleton className="size-7 rounded-md" />
                  <Skeleton className="size-7 rounded-md" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {[1, 2].map((i) => (
                <motion.div
                  key={i}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 + i * 0.05 }}
                  className="flex items-center justify-between p-2"
                >
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="size-6 rounded-md" />
                    <Skeleton className="size-6 rounded-md" />
                    <Skeleton className="size-6 rounded-md" />
                    <Skeleton className="size-6 rounded-md" />
                  </div>
                </motion.div>
              ))}
              <Skeleton className="h-px w-full" />
              <div className="flex items-center justify-between p-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-5 w-24" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Template Section */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Skeleton className="h-12 w-full rounded-md" />
        </motion.div>

        {/* Add Expense Button */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Skeleton className="h-14 w-full rounded-md" />
        </motion.div>

        {/* Expense List */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="space-y-4"
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-48" />
                <div className="flex items-center gap-2">
                  <Skeleton className="size-7 rounded-md" />
                  <Skeleton className="size-7 rounded-md" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Date Group 1 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-5 w-5" />
                    <Skeleton className="h-5 w-32" />
                  </div>
                  <Skeleton className="h-5 w-24" />
                </div>
                {[1, 2].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.7 + i * 0.05 }}
                    className="flex items-center justify-between p-2"
                  >
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-40" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="size-6 rounded-md" />
                      <Skeleton className="size-6 rounded-md" />
                      <Skeleton className="size-6 rounded-md" />
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Date Group 2 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-5 w-5" />
                    <Skeleton className="h-5 w-32" />
                  </div>
                  <Skeleton className="h-5 w-24" />
                </div>
                {[1, 2].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.8 + i * 0.05 }}
                    className="flex items-center justify-between p-2"
                  >
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-40" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="size-6 rounded-md" />
                      <Skeleton className="size-6 rounded-md" />
                      <Skeleton className="size-6 rounded-md" />
                    </div>
                  </motion.div>
                ))}
              </div>

              <Skeleton className="h-px w-full" />
              <div className="flex justify-between p-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-32" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Loading indicator with pulse animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center gap-2 py-8"
        >
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="size-2 rounded-full bg-primary"
          />
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.2,
            }}
            className="size-2 rounded-full bg-primary"
          />
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.4,
            }}
            className="size-2 rounded-full bg-primary"
          />
        </motion.div>
      </div>
    </motion.div>
  );
}
