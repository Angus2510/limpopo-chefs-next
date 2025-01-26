import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ButtonLoadingProps {
  isLoading: boolean;
  children: React.ReactNode;
}

export function ButtonLoading({ isLoading, children }: ButtonLoadingProps) {
  return (
    <Button disabled={isLoading} className="w-full">
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </Button>
  );
}
