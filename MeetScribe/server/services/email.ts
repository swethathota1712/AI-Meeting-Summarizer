import nodemailer from 'nodemailer';

// Configure email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || process.env.EMAIL_USER,
    pass: process.env.SMTP_PASS || process.env.EMAIL_PASS,
  },
});

export interface EmailOptions {
  recipients: string[];
  subject: string;
  message?: string;
  summaryHtml: string;
}

export async function sendSummaryEmail(options: EmailOptions): Promise<void> {
  const { recipients, subject, message, summaryHtml } = options;

  try {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 800px; margin: 0 auto; padding: 20px; }
          .header { border-bottom: 2px solid #2563EB; padding-bottom: 15px; margin-bottom: 20px; }
          .summary { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; font-size: 12px; color: #666; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 15px; }
          h1 { color: #2563EB; margin: 0; }
          h3, h4 { color: #1e293b; }
          ul { padding-left: 20px; }
          li { margin-bottom: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🤖 AI Meeting Summary</h1>
          </div>
          
          ${message ? `<p><strong>Message:</strong> ${message}</p>` : ''}
          
          <div class="summary">
            ${summaryHtml}
          </div>
          
          <div class="footer">
            <p>This summary was generated using AI Meeting Summarizer</p>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.SMTP_USER || process.env.EMAIL_USER,
      to: recipients.join(', '),
      subject: subject,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error(`Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
