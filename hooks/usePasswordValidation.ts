import { useState, useEffect } from "react";
import { validateAssignmentPassword } from "@/lib/actions/assignments/validateAssignmentPassword";
export function usePasswordValidation(assignmentId: string) {
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const checkPassword = async () => {
      try {
        // Get password from cookie specific to this assignment
        const cookies = document.cookie.split(";");
        const passwordCookie = cookies.find((c) =>
          c.trim().startsWith(`assignment_${assignmentId}_password=`)
        );

        if (!passwordCookie) {
          setIsValid(false);
          return;
        }

        const password = passwordCookie.split("=")[1];
        const validation = await validateAssignmentPassword(
          assignmentId,
          password
        );

        setIsValid(validation.valid);
      } catch (error) {
        console.error("Password validation error:", error);
        setIsValid(false);
      }
    };

    checkPassword();
  }, [assignmentId]);

  return isValid;
}
