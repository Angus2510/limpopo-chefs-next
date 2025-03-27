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
        title: "Session Expired",
        description: "Your test session has expired. You will be redirected.",
        variant: "destructive",
      });
      router.push("/student/assignments");
    };

    // Check initially
    checkPassword();

    // Check every minute
    const interval = setInterval(checkPassword, 60000);

    return () => clearInterval(interval);
  }, [assignmentId, router]);

  return isValid;
}
