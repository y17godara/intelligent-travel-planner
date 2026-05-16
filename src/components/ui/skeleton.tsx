import * as React from "react";
import { type VariantProps } from "class-variance-authority";
import { buttonVariants } from "@/components/ui/button";

const Skeleton = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof buttonVariants>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={`animate-pulse rounded-md bg-slate-900/10 dark:bg-slate-50/10 ${className}`}
    {...props}
  />
));
Skeleton.displayName = "Skeleton";

export { Skeleton };
