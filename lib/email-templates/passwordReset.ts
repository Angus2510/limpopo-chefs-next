// lib/email-templates/passwordReset.ts
export const passwordResetTemplate = (resetCode: string) => {
  return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            .container {
              font-family: Arial, sans-serif;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: #f8f9fa;
              padding: 20px;
              text-align: center;
              border-radius: 5px;
            }
            .code {
              font-size: 32px;
              font-weight: bold;
              color: #0066cc;
              letter-spacing: 2px;
              padding: 20px;
              text-align: center;
              background-color: #f0f0f0;
              border-radius: 5px;
              margin: 20px 0;
            }
            .info {
              color: #666;
              line-height: 1.5;
            }
            .footer {
              margin-top: 30px;
              font-size: 12px;
              color: #999;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <p>You have requested to reset your password. Please use the following code to complete your password reset:</p>
            <div class="code">${resetCode}</div>
            <div class="info">
              <p><strong>Important:</strong></p>
              <ul>
                <li>This code will expire in 15 minutes</li>
                <li>If you didn't request this reset, please ignore this email</li>
                <li>Do not share this code with anyone</li>
              </ul>
            </div>
            <div class="footer">
              <p>This is an automated message, please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;
};
