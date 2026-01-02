import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailSettings {
  smtp_host: string;
  smtp_port: number;
  smtp_username: string;
  smtp_password: string;
  from_email: string;
  from_name: string;
  reminder_days_before: number;
  max_overdue_reminders: number;
}

interface Loan {
  id: string;
  borrower_name: string;
  borrower_email: string;
  currency: string;
  amount: number;
  due_date: string;
  payment_status: string;
  reminder_count: number;
  last_reminder_sent_at: string | null;
  reminders_enabled: boolean;
  notes?: string;
}

function generateDueSoonEmailHTML(loan: Loan, settings: EmailSettings): string {
  const dueDate = new Date(loan.due_date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const amount = `${loan.currency} ${Number(loan.amount).toLocaleString()}`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Reminder</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f7fa;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); padding: 40px 40px 30px;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">${settings.from_name}</h1>
              <p style="color: #94a3b8; margin: 8px 0 0; font-size: 14px;">Payment Reminder</p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <div style="background: linear-gradient(135deg, #fef3c7 0%, #fef9c3 100%); border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                <h2 style="color: #92400e; margin: 0 0 8px; font-size: 18px;">⏰ Payment Due Soon</h2>
                <p style="color: #a16207; margin: 0; font-size: 14px;">Your payment is due in 3 days</p>
              </div>
              
              <p style="color: #334155; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                Dear <strong>${loan.borrower_name}</strong>,
              </p>
              
              <p style="color: #64748b; font-size: 15px; line-height: 1.6; margin: 0 0 30px;">
                This is a friendly reminder that your payment is approaching its due date. Please ensure timely payment to avoid any late fees.
              </p>
              
              <!-- Payment Details Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border-radius: 12px; overflow: hidden; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 25px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
                          <span style="color: #64748b; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Amount Due</span><br>
                          <span style="color: #1e293b; font-size: 24px; font-weight: 700;">${amount}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 15px 0 10px;">
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                            <tr>
                              <td width="50%">
                                <span style="color: #64748b; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Due Date</span><br>
                                <span style="color: #1e293b; font-size: 16px; font-weight: 600;">${dueDate}</span>
                              </td>
                              <td width="50%">
                                <span style="color: #64748b; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Status</span><br>
                                <span style="display: inline-block; background-color: #fef3c7; color: #92400e; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 600;">Pending</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 0;">
                If you have already made this payment, please disregard this notice. For any questions, please contact our support team.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 30px 40px; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 13px; margin: 0 0 10px; text-align: center;">
                This is an automated message from ${settings.from_name}
              </p>
              <p style="color: #94a3b8; font-size: 12px; margin: 0; text-align: center;">
                © ${new Date().getFullYear()} ${settings.from_name}. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function generateOverdueEmailHTML(loan: Loan, settings: EmailSettings, isFinalNotice: boolean): string {
  const dueDate = new Date(loan.due_date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const amount = `${loan.currency} ${Number(loan.amount).toLocaleString()}`;
  const daysOverdue = Math.floor((Date.now() - new Date(loan.due_date).getTime()) / (1000 * 60 * 60 * 24));

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${isFinalNotice ? 'Final Payment Notice' : 'Overdue Payment Reminder'}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f7fa;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, ${isFinalNotice ? '#7f1d1d' : '#1e293b'} 0%, ${isFinalNotice ? '#991b1b' : '#334155'} 100%); padding: 40px 40px 30px;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">${settings.from_name}</h1>
              <p style="color: ${isFinalNotice ? '#fecaca' : '#94a3b8'}; margin: 8px 0 0; font-size: 14px;">${isFinalNotice ? 'Final Payment Notice' : 'Overdue Payment Reminder'}</p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <div style="background: linear-gradient(135deg, ${isFinalNotice ? '#fef2f2' : '#fee2e2'} 0%, ${isFinalNotice ? '#fee2e2' : '#fecaca'} 100%); border-left: 4px solid ${isFinalNotice ? '#7f1d1d' : '#dc2626'}; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                <h2 style="color: #991b1b; margin: 0 0 8px; font-size: 18px;">
                  ${isFinalNotice ? '🚨 Final Notice – Immediate Action Required' : '⚠️ Payment Overdue'}
                </h2>
                <p style="color: #b91c1c; margin: 0; font-size: 14px;">Your payment is ${daysOverdue} day${daysOverdue > 1 ? 's' : ''} overdue</p>
              </div>
              
              <p style="color: #334155; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                Dear <strong>${loan.borrower_name}</strong>,
              </p>
              
              <p style="color: #64748b; font-size: 15px; line-height: 1.6; margin: 0 0 30px;">
                ${isFinalNotice 
                  ? 'This is your <strong style="color: #dc2626;">FINAL NOTICE</strong> regarding your overdue payment. Immediate action is required to avoid additional penalties and potential collection proceedings.'
                  : 'We would like to remind you that your payment has passed its due date. Please make your payment as soon as possible to avoid additional late fees.'
                }
              </p>
              
              <!-- Payment Details Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #fef2f2; border-radius: 12px; overflow: hidden; margin-bottom: 30px; border: 1px solid #fecaca;">
                <tr>
                  <td style="padding: 25px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #fecaca;">
                          <span style="color: #991b1b; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Amount Overdue</span><br>
                          <span style="color: #7f1d1d; font-size: 24px; font-weight: 700;">${amount}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 15px 0 10px;">
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                            <tr>
                              <td width="50%">
                                <span style="color: #991b1b; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Original Due Date</span><br>
                                <span style="color: #7f1d1d; font-size: 16px; font-weight: 600;">${dueDate}</span>
                              </td>
                              <td width="50%">
                                <span style="color: #991b1b; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Days Overdue</span><br>
                                <span style="display: inline-block; background-color: #dc2626; color: #ffffff; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 600;">${daysOverdue} Days</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 0;">
                ${isFinalNotice 
                  ? 'Please contact us immediately to arrange payment and discuss any concerns. Failure to respond may result in additional collection actions.'
                  : 'If you have already made this payment, please disregard this notice. For any questions or to discuss payment arrangements, please contact our support team.'
                }
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 30px 40px; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 13px; margin: 0 0 10px; text-align: center;">
                This is an automated message from ${settings.from_name}
              </p>
              <p style="color: #94a3b8; font-size: 12px; margin: 0; text-align: center;">
                © ${new Date().getFullYear()} ${settings.from_name}. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

async function sendEmail(
  settings: EmailSettings,
  to: string,
  subject: string,
  html: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const client = new SMTPClient({
      connection: {
        hostname: settings.smtp_host,
        port: settings.smtp_port,
        tls: true,
        auth: {
          username: settings.smtp_username,
          password: settings.smtp_password,
        },
      },
    });

    await client.send({
      from: `${settings.from_name} <${settings.from_email}>`,
      to: to,
      subject: subject,
      content: "Please view this email in an HTML-capable email client.",
      html: html,
    });

    await client.close();
    return { success: true };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Email sending failed:", error);
    return { success: false, error: errorMessage };
  }
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get email settings
    const { data: settingsData, error: settingsError } = await supabase
      .from("email_settings")
      .select("*")
      .limit(1)
      .single();

    if (settingsError || !settingsData) {
      console.error("Failed to fetch email settings:", settingsError);
      return new Response(
        JSON.stringify({ error: "Email settings not configured" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const settings: EmailSettings = settingsData;

    // Check if SMTP is configured
    if (!settings.smtp_username || !settings.smtp_password) {
      console.log("SMTP not configured, skipping email reminders");
      return new Response(
        JSON.stringify({ message: "SMTP not configured", sent: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split("T")[0];

    // Calculate reminder date (3 days before due)
    const reminderDate = new Date(today);
    reminderDate.setDate(reminderDate.getDate() + settings.reminder_days_before);
    const reminderDateStr = reminderDate.toISOString().split("T")[0];

    let emailsSent = 0;
    const results: { loanId: string; status: string; error?: string }[] = [];

    // 1. Send reminders for loans due soon (due date is X days away)
    const { data: dueSoonLoans, error: dueSoonError } = await supabase
      .from("loans")
      .select("*")
      .eq("payment_status", "pending")
      .eq("reminders_enabled", true)
      .eq("due_date", reminderDateStr)
      .not("borrower_email", "is", null);

    if (dueSoonError) {
      console.error("Error fetching due soon loans:", dueSoonError);
    } else if (dueSoonLoans) {
      for (const loan of dueSoonLoans) {
        // Check if already sent today
        if (loan.last_reminder_sent_at) {
          const lastSent = new Date(loan.last_reminder_sent_at);
          lastSent.setHours(0, 0, 0, 0);
          if (lastSent.getTime() === today.getTime()) {
            console.log(`Already sent reminder today for loan ${loan.id}`);
            continue;
          }
        }

        const html = generateDueSoonEmailHTML(loan, settings);
        const subject = "Payment Reminder – Due Soon";
        const result = await sendEmail(settings, loan.borrower_email, subject, html);

        // Log the email
        await supabase.from("email_reminder_logs").insert({
          loan_id: loan.id,
          email_type: "due_soon",
          recipient_email: loan.borrower_email,
          subject: subject,
          status: result.success ? "sent" : "failed",
          error_message: result.error || null,
        });

        if (result.success) {
          // Update loan reminder tracking
          await supabase
            .from("loans")
            .update({
              reminder_count: loan.reminder_count + 1,
              last_reminder_sent_at: new Date().toISOString(),
            })
            .eq("id", loan.id);

          emailsSent++;
          results.push({ loanId: loan.id, status: "sent" });
        } else {
          results.push({ loanId: loan.id, status: "failed", error: result.error });
        }
      }
    }

    // 2. Send reminders for overdue loans
    const { data: overdueLoans, error: overdueError } = await supabase
      .from("loans")
      .select("*")
      .eq("payment_status", "pending")
      .eq("reminders_enabled", true)
      .lt("due_date", todayStr)
      .lt("reminder_count", settings.max_overdue_reminders)
      .not("borrower_email", "is", null);

    if (overdueError) {
      console.error("Error fetching overdue loans:", overdueError);
    } else if (overdueLoans) {
      for (const loan of overdueLoans) {
        // Check if already sent today
        if (loan.last_reminder_sent_at) {
          const lastSent = new Date(loan.last_reminder_sent_at);
          lastSent.setHours(0, 0, 0, 0);
          if (lastSent.getTime() === today.getTime()) {
            console.log(`Already sent reminder today for loan ${loan.id}`);
            continue;
          }
        }

        const isFinalNotice = loan.reminder_count >= settings.max_overdue_reminders - 1;
        const html = generateOverdueEmailHTML(loan, settings, isFinalNotice);
        const subject = isFinalNotice ? "Final Payment Notice" : "Overdue Payment Reminder";
        const result = await sendEmail(settings, loan.borrower_email, subject, html);

        // Log the email
        await supabase.from("email_reminder_logs").insert({
          loan_id: loan.id,
          email_type: isFinalNotice ? "final_notice" : "overdue",
          recipient_email: loan.borrower_email,
          subject: subject,
          status: result.success ? "sent" : "failed",
          error_message: result.error || null,
        });

        if (result.success) {
          // Update loan reminder tracking and status
          await supabase
            .from("loans")
            .update({
              reminder_count: loan.reminder_count + 1,
              last_reminder_sent_at: new Date().toISOString(),
              status: "overdue",
            })
            .eq("id", loan.id);

          emailsSent++;
          results.push({ loanId: loan.id, status: "sent" });
        } else {
          results.push({ loanId: loan.id, status: "failed", error: result.error });
        }
      }
    }

    console.log(`Payment reminders processed. Emails sent: ${emailsSent}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${results.length} loans, sent ${emailsSent} emails`,
        results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error in send-payment-reminders function:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
