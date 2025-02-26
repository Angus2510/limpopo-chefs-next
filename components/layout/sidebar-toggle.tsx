import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SidebarToggleProps {
  isOpen: boolean | undefined; // Boolean to track whether the sidebar is open or not
  setIsOpen?: (value: boolean) => void; // Function to update the 'isOpen' state
}

export function SidebarToggle({ isOpen, setIsOpen }: SidebarToggleProps) {
  return (
    <div className="invisible lg:visible absolute top-[12px] -right-[16px] z-20">
      <Button
        onClick={() => setIsOpen?.(!isOpen)} // Toggle the state when clicked
        className="rounded-md w-8 h-8"
        variant="outline"
        size="icon"
      >
        <ChevronLeft
          className={cn(
            "h-4 w-4 transition-transform ease-in-out duration-700",
            isOpen ? "rotate-0" : "rotate-180" // Rotate based on open/closed state
          )}
        />
      </Button>
    </div>
  );
}
