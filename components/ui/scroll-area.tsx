"use client";

import * as React from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";

import { cn } from "@/lib/utils";

const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root> & {
    viewportClassName?: string;
    orientation?: "vertical" | "horizontal" | "both";
  }
>(
  (
    {
      className,
      children,
      viewportClassName,
      orientation = "vertical",
      ...props
    },
    ref
  ) => {
    // Create refs for programmatic scrolling if needed
    const viewportRef = React.useRef<HTMLDivElement>(null);

    // Handle wheel events explicitly if needed
    const handleWheel = React.useCallback((event: React.WheelEvent) => {
      // Prevent default only if scrolling vertically and we're at the top/bottom
      const viewport = viewportRef.current;
      if (!viewport) return;

      // Allow the event to propagate normally in most cases
      event.stopPropagation();
    }, []);

    return (
      <ScrollAreaPrimitive.Root
        ref={ref}
        type="auto"
        className={cn("relative overflow-hidden", className)}
        {...props}
      >
        <ScrollAreaPrimitive.Viewport
          ref={viewportRef}
          onWheel={handleWheel}
          className={cn("h-full w-full rounded-[inherit]", viewportClassName)}
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {children}
        </ScrollAreaPrimitive.Viewport>

        {orientation === "vertical" || orientation === "both" ? (
          <ScrollBar orientation="vertical" />
        ) : null}

        {orientation === "horizontal" || orientation === "both" ? (
          <ScrollBar orientation="horizontal" />
        ) : null}

        <ScrollAreaPrimitive.Corner />
      </ScrollAreaPrimitive.Root>
    );
  }
);
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;

const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = "vertical", ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      "flex touch-none select-none transition-colors",
      orientation === "vertical" &&
        "h-full w-2.5 border-l border-l-transparent p-[1px]",
      orientation === "horizontal" &&
        "h-2.5 flex-col border-t border-t-transparent p-[1px]",
      className
    )}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb
      className={cn(
        "relative rounded-full bg-border",
        orientation === "vertical" ? "flex-1" : "flex-[0_0_auto]"
      )}
    />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
));
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;

export { ScrollArea, ScrollBar };
