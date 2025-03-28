import { useState, useEffect } from "react";
import { validateAssignmentPassword } from "@/lib/actions/assignments/validateAssignmentPassword";

export function usePasswordValidation(assignmentId: string) {
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const checkPassword = async () => {
      const assignmentPassword = document.cookie
        .split("; ")
        .find((row) => row.startsWith("assignment_password="))
        ?.split("=")[1];

      if (!assignmentPassword) {
        setIsValid(false);
        return;
      }

      try {
        const validation = await validateAssignmentPassword(
          assignmentId,
          assignmentPassword
        );
        setIsValid(validation.valid);
      } catch (error) {
        setIsValid(false);
      }
    };

    // Only check once when component mounts
    checkPassword();
  }, [assignmentId]);

  return isValid;
}
