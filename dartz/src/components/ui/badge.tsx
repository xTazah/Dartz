import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "tw-inline-flex tw-items-center tw-rounded-full tw-border tw-border-gray-200 tw-px-2.5 tw-py-0.5 tw-text-xs tw-font-semibold tw-transition-colors focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-gray-950 focus:tw-ring-offset-2 dark:tw-border-gray-800 dark:focus:tw-ring-gray-300",
  {
    variants: {
      variant: {
        default:
          "tw-border-transparent tw-bg-gray-900 tw-text-gray-50 hover:tw-bg-gray-900/80 dark:tw-bg-gray-50 dark:tw-text-gray-900 dark:hover:tw-bg-gray-50/80",
        secondary:
          "tw-border-transparent tw-bg-gray-100 tw-text-gray-900 hover:tw-bg-gray-100/80 dark:tw-bg-gray-800 dark:tw-text-gray-50 dark:hover:tw-bg-gray-800/80",
        destructive:
          "tw-border-transparent tw-bg-red-500 tw-text-gray-50 hover:tw-bg-red-500/80 dark:tw-bg-red-900 dark:tw-text-gray-50 dark:hover:tw-bg-red-900/80",
        outline: "tw-text-gray-950 dark:tw-text-gray-50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
