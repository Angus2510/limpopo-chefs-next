import { useState, useEffect } from "react";

export function usePasswordValidation(assignmentId: string) {
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const checkPassword = () => {
      // Get the password from cookies
      const cookies = document.cookie.split(";");
      const passwordCookie = cookies.find((cookie) =>
        cookie.trim().startsWith("assignment_password=")
      );

      if (passwordCookie) {
        const password = passwordCookie.split("=")[1];
        // You might want to verify the password here again
        setIsValid(true);
      } else {
        setIsValid(false);
      }
    };

    checkPassword();
  }, [assignmentId]);

  return isValid;
}
