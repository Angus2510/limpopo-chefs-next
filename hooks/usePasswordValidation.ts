import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { validateAssignmentPassword } from "@/lib/actions/assignments/validateAssignmentPassword";
import { useToast } from "@/components/ui/use-toast";

export function usePasswordValidation(assignmentId: string) {
  const router = useRouter();
  const { toast } = useToast();
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    const checkPassword = async () => {
      const assignmentPassword = document.cookie
        .split("; ")
        .find((row) => row.startsWith("assignment_password="))
        ?.split("=")[1];

      if (!assignmentPassword) {
        handleInvalidPassword();
        return;
      }

      try {
        const validation = await validateAssignmentPassword(
          assignmentId,
          assignmentPassword
        );
        if (!validation.valid) {
          handleInvalidPassword();
        }
      } catch (error) {
        handleInvalidPassword();
      }
    };

    const handleInvalidPassword = () => {
      setIsValid(false);
      toast({
        title: "Password Session Expired",
        description:
          "Your password session has expired. Please re-enter the password.",
        variant: "destructive",
      });
      router.push(`/student/assignments/${assignmentId}/password`); // Redirect to password page instead
    };

    // Initial check
    checkPassword();

    // Check every 20 minutes (1200000 ms)
    const interval = setInterval(checkPassword, 1200000);

    return () => clearInterval(interval);
  }, [assignmentId, router, toast]);

  return isValid;
}
