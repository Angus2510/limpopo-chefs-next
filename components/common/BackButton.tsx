// Add this import at the top of the file with other imports
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

// Add this component before the main StudentBalancePage component
const BackButton = () => {
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      size="sm"
      className="mb-4"
      onClick={() => router.back()}
    >
      <ArrowLeft className="w-4 h-4 mr-2" />
      Back
    </Button>
  );
};

export default BackButton;
// Modify the ContentLayout section in the return statement to include the BackButton
