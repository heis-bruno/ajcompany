import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Payment {
  id: string;
  client_id: string;
  due_date: string;
  amount: number;
  currency: string;
  status: string;
  reminder_count: number;
  last_notification_sent_at: string | null;
  clients: {
    full_name: string;
  } | null;
  type?: string;
}

interface AdminDevice {
  id: string;
  admin_id: string;
  fcm_token: string;
  device_type: string;
}

// Send FCM push notification
async function sendFCMNotification(
  fcmToken: string,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<{ success: boolean; error?: string }> {
  const fcmServerKey = Deno.env.get('FCM_SERVER_KEY');
  
  if (!fcmServerKey) {
    console.error('FCM_SERVER_KEY not configured');
    return { success: false, error: 'FCM_SERVER_KEY not configured' };
  }

  try {
    const response = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Authorization': `key=${fcmServerKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: fcmToken,
        notification: {
          title,
          body,
          sound: 'default',
          badge: 1,
        },
        data: data || {},
        priority: 'high',
      }),
    });

    const result = await response.json();
    
    if (result.success === 1) {
      console.log('FCM notification sent successfully');
      return { success: true };
    } else {
      console.error('FCM send failed:', result);
      return { success: false, error: JSON.stringify(result.results) };
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('FCM send error:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

// Format currency
function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

// Format date
function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Check if already notified today
function wasNotifiedToday(lastNotificationSentAt: string | null): boolean {
  if (!lastNotificationSentAt) return false;
  
  const lastSent = new Date(lastNotificationSentAt);
  const today = new Date();
  
  return (
    lastSent.getFullYear() === today.getFullYear() &&
    lastSent.getMonth() === today.getMonth() &&
    lastSent.getDate() === today.getDate()
  );
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting payment notification check...');

    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const today = new Date().toISOString().split('T')[0];
    console.log('Today:', today);

    // Get all admin device tokens
    const { data: adminDevices, error: devicesError } = await supabase
      .from('admin_devices')
      .select('id, admin_id, fcm_token, device_type');

    if (devicesError) {
      console.error('Error fetching admin devices:', devicesError);
      throw devicesError;
    }

    if (!adminDevices || adminDevices.length === 0) {
      console.log('No admin devices registered for notifications');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No admin devices registered',
          processed: 0 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${adminDevices.length} admin devices`);

    // Get payments due today (status = PENDING)
    const { data: dueTodayPayments, error: dueTodayError } = await supabase
      .from('payments')
      .select(`
        id,
        client_id,
        due_date,
        amount,
        currency,
        status,
        reminder_count,
        last_notification_sent_at,
        clients (
          full_name
        )
      `)
      .eq('status', 'PENDING')
      .eq('due_date', today);

    if (dueTodayError) {
      console.error('Error fetching due today payments:', dueTodayError);
      throw dueTodayError;
    }

    // Get overdue payments (reminder_count < 7, not paid)
    const { data: overduePayments, error: overdueError } = await supabase
      .from('payments')
      .select(`
        id,
        client_id,
        due_date,
        amount,
        currency,
        status,
        reminder_count,
        last_notification_sent_at,
        clients (
          full_name
        )
      `)
      .eq('status', 'PENDING')
      .lt('due_date', today)
      .lt('reminder_count', 7);

    if (overdueError) {
      console.error('Error fetching overdue payments:', overdueError);
      throw overdueError;
    }

    const allPayments = [
      ...(dueTodayPayments || []).map((p) => ({ ...p, type: 'due_today' })),
      ...(overduePayments || []).map((p) => ({ ...p, type: 'overdue' })),
    ];

    console.log(`Found ${dueTodayPayments?.length || 0} payments due today`);
    console.log(`Found ${overduePayments?.length || 0} overdue payments`);

    const results = {
      processed: 0,
      notificationsSent: 0,
      skipped: 0,
      errors: [] as string[],
    };

    // Process each payment
    for (const payment of allPayments) {
      const typedPayment = payment as unknown as Payment;
      
      // Skip if already notified today
      if (wasNotifiedToday(typedPayment.last_notification_sent_at)) {
        console.log(`Payment ${typedPayment.id} already notified today, skipping`);
        results.skipped++;
        continue;
      }

      // Get client name safely
      const clientName = typedPayment.clients?.full_name || 'Unknown Client';
      const formattedAmount = formatCurrency(typedPayment.amount, typedPayment.currency);
      const formattedDate = formatDate(typedPayment.due_date);

      // Create notification content
      let title: string;
      let body: string;
      let notificationType: string;

      if (typedPayment.type === 'due_today') {
        title = 'Payment Due Today';
        body = `Client ${clientName} payment of ${formattedAmount} is due today.`;
        notificationType = 'due_today';
      } else {
        const daysOverdue = Math.floor(
          (new Date().getTime() - new Date(typedPayment.due_date).getTime()) / (1000 * 60 * 60 * 24)
        );
        title = 'Overdue Payment Reminder';
        body = `Client ${clientName} payment of ${formattedAmount} is ${daysOverdue} day(s) overdue. Due date was ${formattedDate}.`;
        notificationType = 'overdue';
      }

      // Send to all admin devices
      let sentToAtLeastOne = false;
      
      for (const device of adminDevices as AdminDevice[]) {
        const sendResult = await sendFCMNotification(
          device.fcm_token,
          title,
          body,
          {
            payment_id: typedPayment.id,
            type: notificationType,
          }
        );

        // Log the notification attempt
        await supabase.from('notification_logs').insert({
          payment_id: typedPayment.id,
          device_id: device.id,
          notification_type: notificationType,
          title,
          body,
          status: sendResult.success ? 'sent' : 'failed',
          error_message: sendResult.error || null,
        });

        if (sendResult.success) {
          sentToAtLeastOne = true;
          results.notificationsSent++;
        } else {
          results.errors.push(`Payment ${typedPayment.id} to device ${device.id}: ${sendResult.error}`);
        }
      }

      // Update payment reminder tracking if sent to at least one device
      if (sentToAtLeastOne) {
        const { error: updateError } = await supabase
          .from('payments')
          .update({
            reminder_count: typedPayment.reminder_count + 1,
            last_notification_sent_at: new Date().toISOString(),
          })
          .eq('id', typedPayment.id);

        if (updateError) {
          console.error(`Error updating payment ${typedPayment.id}:`, updateError);
          results.errors.push(`Failed to update payment ${typedPayment.id}`);
        }
      }

      results.processed++;
    }

    console.log('Notification processing complete:', results);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Payment notifications processed',
        ...results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in send-payment-notifications:', errorMessage);
    
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
