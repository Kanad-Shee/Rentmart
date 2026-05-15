"use client";

import * as React from "react";
import { Popover as BasePopover } from "@base-ui/react/popover";
import { cn } from "@/lib/utils";

const Popover = BasePopover.Root;
const PopoverTrigger = BasePopover.Trigger;

const PopoverContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof BasePopover.Popup> & {
    sideOffset?: number;
  }
>(function PopoverContent(
  { className, sideOffset = 8, ...props },
  ref,
) {
  return (
    <BasePopover.Portal>
      <BasePopover.Positioner sideOffset={sideOffset}>
        <BasePopover.Popup
          ref={ref}
          className={cn(
            "z-50 rounded-xl border border-border bg-popover text-popover-foreground shadow-[0_16px_40px_rgba(0,0,0,0.12)] outline-none transition-[opacity,transform] duration-150 data-[ending-style]:opacity-0 data-[ending-style]:scale-[0.98] data-[starting-style]:opacity-0 data-[starting-style]:scale-[0.98]",
            className,
          )}
          {...props}
        />
      </BasePopover.Positioner>
    </BasePopover.Portal>
  );
});

export { Popover, PopoverTrigger, PopoverContent };
