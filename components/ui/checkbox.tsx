"use client"

import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox"
import { Check, Minus } from "lucide-react"

import { cn } from "@/lib/utils"

function Checkbox({
  className,
  ...props
}: CheckboxPrimitive.Props) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer flex size-4 shrink-0 items-center justify-center rounded-sm border border-input bg-background outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[checked]:border-primary data-[checked]:bg-primary data-[checked]:text-primary-foreground data-[indeterminate]:border-primary data-[indeterminate]:bg-primary data-[indeterminate]:text-primary-foreground dark:bg-input/30 dark:data-[checked]:bg-primary",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
        <Check className="size-3.5 transition-all scale-100 data-[unchecked]:scale-0" />
        <Minus className="size-3.5 transition-all scale-0 data-[indeterminate]:scale-100" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
