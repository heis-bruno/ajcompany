import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Bell, Shield, Save, Moon, Sun, TestTube, Loader2, Clock, AlertTriangle } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface EmailSettings {
  id: string;
  smtp_host: string;
  smtp_port: number;
  smtp_username: string | null;
  smtp_password: string | null;
  from_email: string;
  from_name: string;
  reminder_days_before: number;
  max_overdue_reminders: number;
}

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  
  const [emailConfig, setEmailConfig] = useState<EmailSettings>({
    id: '',
    smtp_host: 'smtp.gmail.com',
    smtp_port: 587,
    smtp_username: '',
    smtp_password: '',
    from_email: '',
    from_name: 'AJ Company',
    reminder_days_before: 3,
    max_overdue_reminders: 7,
  });

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    overdueReminders: true,
    paymentConfirmations: true,
  });

  useEffect(() => {
    fetchEmailSettings();
  }, []);

  const fetchEmailSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('email_settings')
        .select('*')
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching email settings:', error);
        return;
      }

      if (data) {
        setEmailConfig({
          id: data.id,
          smtp_host: data.smtp_host || 'smtp.gmail.com',
          smtp_port: data.smtp_port || 587,
          smtp_username: data.smtp_username || '',
          smtp_password: data.smtp_password || '',
          from_email: data.from_email || '',
          from_name: data.from_name || 'AJ Company',
          reminder_days_before: data.reminder_days_before || 3,
          max_overdue_reminders: data.max_overdue_reminders || 7,
        });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveEmailConfig = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('email_settings')
        .update({
          smtp_host: emailConfig.smtp_host,
          smtp_port: emailConfig.smtp_port,
          smtp_username: emailConfig.smtp_username,
          smtp_password: emailConfig.smtp_password,
          from_email: emailConfig.from_email,
          from_name: emailConfig.from_name,
          reminder_days_before: emailConfig.reminder_days_before,
          max_overdue_reminders: emailConfig.max_overdue_reminders,
        })
        .eq('id', emailConfig.id);

      if (error) throw error;

      toast({
        title: 'Settings Saved',
        description: 'Email configuration has been updated successfully.',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save email configuration.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestReminders = async () => {
    setIsTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-payment-reminders');
      
      if (error) throw error;

      toast({
        title: 'Reminder Job Executed',
        description: data?.message || 'Payment reminders processed successfully.',
      });
    } catch (error) {
      console.error('Error running reminders:', error);
      toast({
        title: 'Error',
        description: 'Failed to run payment reminders. Check SMTP configuration.',
        variant: 'destructive',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
    toast({
      title: `${!isDarkMode ? 'Dark' : 'Light'} Mode Enabled`,
      description: `Switched to ${!isDarkMode ? 'dark' : 'light'} mode.`,
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your application preferences and configurations.</p>
        </motion.div>

        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Account Information</h2>
                <p className="text-sm text-muted-foreground">Your profile and role details</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Username</Label>
                <Input value={user?.username || ''} disabled className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Input value={user?.role || ''} disabled className="bg-muted" />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Appearance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                {isDarkMode ? <Moon className="w-5 h-5 text-accent" /> : <Sun className="w-5 h-5 text-accent" />}
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Appearance</h2>
                <p className="text-sm text-muted-foreground">Customize the look and feel</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div>
                <p className="font-medium text-foreground">Dark Mode</p>
                <p className="text-sm text-muted-foreground">Switch between light and dark themes</p>
              </div>
              <Switch checked={isDarkMode} onCheckedChange={toggleDarkMode} />
            </div>
          </Card>
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                <Bell className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Notifications</h2>
                <p className="text-sm text-muted-foreground">Configure alert preferences</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium text-foreground">Email Alerts</p>
                  <p className="text-sm text-muted-foreground">Receive important updates via email</p>
                </div>
                <Switch
                  checked={notifications.emailAlerts}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, emailAlerts: checked })}
                />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium text-foreground">Overdue Reminders</p>
                  <p className="text-sm text-muted-foreground">Get notified about overdue loans</p>
                </div>
                <Switch
                  checked={notifications.overdueReminders}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, overdueReminders: checked })}
                />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium text-foreground">Payment Confirmations</p>
                  <p className="text-sm text-muted-foreground">Receive confirmation for payments</p>
                </div>
                <Switch
                  checked={notifications.paymentConfirmations}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, paymentConfirmations: checked })}
                />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Email Configuration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                <Mail className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Email Configuration</h2>
                <p className="text-sm text-muted-foreground">SMTP settings for sending payment reminders</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="smtpHost">SMTP Host</Label>
                <Input
                  id="smtpHost"
                  value={emailConfig.smtp_host}
                  onChange={(e) => setEmailConfig({ ...emailConfig, smtp_host: e.target.value })}
                  placeholder="smtp.gmail.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtpPort">SMTP Port</Label>
                <Input
                  id="smtpPort"
                  type="number"
                  value={emailConfig.smtp_port}
                  onChange={(e) => setEmailConfig({ ...emailConfig, smtp_port: parseInt(e.target.value) || 587 })}
                  placeholder="587"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtpUser">SMTP Username</Label>
                <Input
                  id="smtpUser"
                  value={emailConfig.smtp_username || ''}
                  onChange={(e) => setEmailConfig({ ...emailConfig, smtp_username: e.target.value })}
                  placeholder="user@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtpPassword">SMTP Password</Label>
                <Input
                  id="smtpPassword"
                  type="password"
                  value={emailConfig.smtp_password || ''}
                  onChange={(e) => setEmailConfig({ ...emailConfig, smtp_password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fromEmail">From Email Address</Label>
                <Input
                  id="fromEmail"
                  type="email"
                  value={emailConfig.from_email}
                  onChange={(e) => setEmailConfig({ ...emailConfig, from_email: e.target.value })}
                  placeholder="noreply@ajcompany.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fromName">From Name</Label>
                <Input
                  id="fromName"
                  value={emailConfig.from_name}
                  onChange={(e) => setEmailConfig({ ...emailConfig, from_name: e.target.value })}
                  placeholder="AJ Company"
                />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Reminder Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-warning" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Reminder Settings</h2>
                <p className="text-sm text-muted-foreground">Configure automated payment reminder behavior</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reminderDays">Days Before Due Date</Label>
                <Input
                  id="reminderDays"
                  type="number"
                  min="1"
                  max="30"
                  value={emailConfig.reminder_days_before}
                  onChange={(e) => setEmailConfig({ ...emailConfig, reminder_days_before: parseInt(e.target.value) || 3 })}
                />
                <p className="text-xs text-muted-foreground">Send reminder X days before due date</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxReminders">Max Overdue Reminders</Label>
                <Input
                  id="maxReminders"
                  type="number"
                  min="1"
                  max="30"
                  value={emailConfig.max_overdue_reminders}
                  onChange={(e) => setEmailConfig({ ...emailConfig, max_overdue_reminders: parseInt(e.target.value) || 7 })}
                />
                <p className="text-xs text-muted-foreground">Stop sending after X overdue reminders</p>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-lg bg-warning/10 border border-warning/20">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
                <div>
                  <p className="font-medium text-foreground text-sm">Automated Email Reminders</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    The system will automatically send payment reminders:
                  </p>
                  <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
                    <li>{emailConfig.reminder_days_before} days before payment is due</li>
                    <li>Daily for up to {emailConfig.max_overdue_reminders} days after due date</li>
                    <li>Final notice on the last reminder day</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-3 justify-end"
        >
          <Button
            variant="outline"
            onClick={handleTestReminders}
            disabled={isTesting}
            className="border-warning/30 text-warning hover:bg-warning/10"
          >
            {isTesting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <TestTube className="w-4 h-4 mr-2" />
            )}
            Run Reminders Now
          </Button>
          <Button
            onClick={handleSaveEmailConfig}
            disabled={isSaving}
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Configuration
          </Button>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
