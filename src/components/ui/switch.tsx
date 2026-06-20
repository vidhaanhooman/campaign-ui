"use client"

import { Switch as SwitchPrimitive } from "@base-ui/react/switch"

import { cn } from "@/lib/utils"

function Switch({
  className,
  size = "default",
  ...props
}: SwitchPrimitive.Root.Props & {
  size?: "sm" | "default"
}) {
  const dims =
    size === "sm"
      ? "h-[16px] w-[28px]"
      : "h-[20px] w-[34px]"
  const thumbBase =
    size === "sm"
      ? "h-3 w-3"
      : "h-3.5 w-3.5"
  const onLeft =
    size === "sm" ? "data-checked:left-[13px]" : "data-checked:left-[17px]"
  const offLeft = "data-unchecked:left-[2px]"

  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer relative inline-flex shrink-0 cursor-pointer items-center rounded-full border transition-colors outline-none after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:ring-2 focus-visible:ring-ring/40 data-checked:border-white data-checked:bg-white data-unchecked:border-border-strong data-unchecked:bg-surface data-disabled:cursor-not-allowed data-disabled:opacity-50",
        dims,
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none absolute top-1/2 -translate-y-1/2 rounded-full transition-all data-checked:bg-black data-unchecked:bg-text-muted",
          thumbBase,
          onLeft,
          offLeft,
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
