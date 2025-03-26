export const staffCreationTemplate = (
  firstName: string,
  username: string,
  password: string
): string => {
  if (!firstName || !username || !password) {
    throw new Error("Missing required parameters for email template");
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Welcome to Limpopo Chefs Academy</h2>
      <p>Dear ${firstName},</p>
      <p>Your staff account has been created successfully.</p>
      <div style="background-color: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px;">
        <p><strong>Username:</strong> ${username}</p>
        <p><strong>Temporary Password:</strong> ${password}</p>
      </div>
      <p>Please change your password upon your first login for security reasons.</p>
      <p>Best regards,<br>Limpopo Chefs Academy Team</p>
    </div>
  `.trim();

  return html;
};
