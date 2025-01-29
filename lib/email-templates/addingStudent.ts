// emailTemplates.ts
export const studentCreationTemplate = (
  studentName: string,
  username: string,
  password: string
): string => `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Welcome to Limpopo Chefs Academy, ${studentName}!</h2>
      <p>Your student account has been created successfully. Below are your login details:</p>
      <ul>
        <li><strong>Username:</strong> ${username}</li>
        <li><strong>Password:</strong> ${password}</li>
      </ul>
      <p>Please log in and change your password as soon as possible.</p>
      <p>Best regards,</p>
      <p>The Limpopo Chefs Academy Team</p>
    </div>
  `;
