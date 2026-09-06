import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

export function Shimmer({ className }: { className?: string }) {
  return <div className={cn("skeleton-shimmer rounded-md", className)} />;
}

function Fade({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function StatSkeletonRow({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <Fade key={index} delay={index * 0.06}>
          <div className="bento-card p-5">
            <Shimmer className="h-3 w-24" />
            <Shimmer className="mt-4 h-7 w-32" />
            <Shimmer className="mt-3 h-3 w-20" />
          </div>
        </Fade>
      ))}
    </div>
  );
}

export function CardSkeleton({ lines = 4, className }: { lines?: number; className?: string }) {
  return (
    <Fade>
      <div className={cn("bento-card p-5", className)}>
        <Shimmer className="h-4 w-40" />
        <div className="mt-5 space-y-3">
          {Array.from({ length: lines }).map((_, index) => (
            <Shimmer key={index} className={cn("h-3", index % 3 === 0 ? "w-full" : index % 3 === 1 ? "w-4/5" : "w-2/3")} />
          ))}
        </div>
      </div>
    </Fade>
  );
}

export function TableSkeleton({ rows = 6, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <Fade>
      <div className="bento-card overflow-hidden">
        <div className="flex gap-4 border-b border-border px-5 py-3">
          {Array.from({ length: columns }).map((_, index) => (
            <Shimmer key={index} className="h-3 flex-1" />
          ))}
        </div>
        <div className="divide-y divide-border">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={rowIndex} className="flex gap-4 px-5 py-3.5">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Shimmer
                  key={colIndex}
                  className={cn("h-3 flex-1", colIndex === 0 && "max-w-[9rem]")}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </Fade>
  );
}

export function PanelSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <Shimmer className="h-3 w-24" />
        <Shimmer className="mt-3 h-8 w-72" />
        <Shimmer className="mt-3 h-3 w-96 max-w-full" />
      </div>
      <StatSkeletonRow />
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3 lg:gap-4">
        <CardSkeleton className="lg:col-span-2" lines={6} />
        <CardSkeleton lines={5} />
      </div>
    </div>
  );
}
