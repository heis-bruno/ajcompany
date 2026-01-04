import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Smartphone, Users, CreditCard, Bell, Trash2, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

interface Client {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  created_at: string;
}

interface Payment {
  id: string;
  client_id: string;
  due_date: string;
  amount: number;
  currency: string;
  status: string;
  reminder_count: number;
  clients?: { full_name: string } | null;
}

interface AdminDevice {
  id: string;
  admin_id: string;
  fcm_token: string;
  device_type: string;
  device_name: string | null;
  created_at: string;
}

interface NotificationLog {
  id: string;
  payment_id: string;
  notification_type: string;
  title: string;
  body: string;
  status: string;
  sent_at: string;
}

export default function AdminPanel() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('clients');
  const [isLoading, setIsLoading] = useState(false);
  
  // Data states
  const [clients, setClients] = useState<Client[]>([]);
  const [paymentClients, setPaymentClients] = useState<{ id: string; full_name: string }[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [devices, setDevices] = useState<AdminDevice[]>([]);
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  
  // Form states
  const [newClient, setNewClient] = useState({ full_name: '', email: '', phone: '' });
  const [newPayment, setNewPayment] = useState({ client_id: '', amount: '', due_date: '', currency: 'USD' });
  const [newDevice, setNewDevice] = useState({ fcm_token: '', device_type: 'android', device_name: '' });
  
  // Dialog states
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isDeviceDialogOpen, setIsDeviceDialogOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'clients') {
        const { data } = await supabase.from('clients').select('*').order('created_at', { ascending: false });
        setClients(data || []);
      } else if (activeTab === 'payments') {
        const { data } = await supabase.from('payments').select('*, clients(full_name)').order('due_date', { ascending: true });
        setPayments(data || []);
        // Also fetch clients for the dropdown
        const { data: clientData } = await supabase.from('clients').select('id, full_name');
        setPaymentClients(clientData || []);
      } else if (activeTab === 'devices') {
        const { data } = await supabase.from('admin_devices').select('*').order('created_at', { ascending: false });
        setDevices(data || []);
      } else if (activeTab === 'notifications') {
        const { data } = await supabase.from('notification_logs').select('*').order('sent_at', { ascending: false }).limit(100);
        setNotifications(data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddClient = async () => {
    if (!newClient.full_name.trim()) {
      toast({ title: 'Error', description: 'Client name is required', variant: 'destructive' });
      return;
    }
    
    try {
      const { error } = await supabase.from('clients').insert({
        full_name: newClient.full_name,
        email: newClient.email || null,
        phone: newClient.phone || null,
      });
      
      if (error) throw error;
      
      toast({ title: 'Success', description: 'Client added successfully' });
      setNewClient({ full_name: '', email: '', phone: '' });
      setIsClientDialogOpen(false);
      fetchData();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to add client';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    }
  };

  const handleAddPayment = async () => {
    if (!newPayment.client_id || !newPayment.amount || !newPayment.due_date) {
      toast({ title: 'Error', description: 'All fields are required', variant: 'destructive' });
      return;
    }
    
    try {
      const { error } = await supabase.from('payments').insert({
        client_id: newPayment.client_id,
        amount: parseFloat(newPayment.amount),
        due_date: newPayment.due_date,
        currency: newPayment.currency,
        status: 'PENDING',
      });
      
      if (error) throw error;
      
      toast({ title: 'Success', description: 'Payment added successfully' });
      setNewPayment({ client_id: '', amount: '', due_date: '', currency: 'USD' });
      setIsPaymentDialogOpen(false);
      fetchData();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to add payment';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    }
  };

  const handleRegisterDevice = async () => {
    if (!newDevice.fcm_token.trim()) {
      toast({ title: 'Error', description: 'FCM Token is required', variant: 'destructive' });
      return;
    }
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: 'Error', description: 'You must be logged in', variant: 'destructive' });
        return;
      }
      
      const { error } = await supabase.from('admin_devices').insert({
        admin_id: user.id,
        fcm_token: newDevice.fcm_token,
        device_type: newDevice.device_type,
        device_name: newDevice.device_name || null,
      });
      
      if (error) throw error;
      
      toast({ title: 'Success', description: 'Device registered for push notifications' });
      setNewDevice({ fcm_token: '', device_type: 'android', device_name: '' });
      setIsDeviceDialogOpen(false);
      fetchData();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to register device';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    }
  };

  const handleDeleteDevice = async (deviceId: string) => {
    try {
      const { error } = await supabase.from('admin_devices').delete().eq('id', deviceId);
      if (error) throw error;
      toast({ title: 'Success', description: 'Device removed' });
      fetchData();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to delete device';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    }
  };

  const handleMarkAsPaid = async (paymentId: string) => {
    try {
      const { error } = await supabase.from('payments').update({ status: 'PAID' }).eq('id', paymentId);
      if (error) throw error;
      toast({ title: 'Success', description: 'Payment marked as paid' });
      fetchData();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update payment';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    }
  };

  const handleTestNotification = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-payment-notifications');
      if (error) throw error;
      toast({ title: 'Success', description: `Notifications processed: ${data?.processed || 0} payments` });
      fetchData();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to send notifications';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Panel</h1>
            <p className="text-muted-foreground">Manage clients, payments, and notification devices</p>
          </div>
          <Button onClick={handleTestNotification} disabled={isLoading} variant="outline">
            <Bell className="w-4 h-4 mr-2" />
            Test Notifications
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 w-full max-w-2xl">
            <TabsTrigger value="clients" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Clients
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="devices" className="flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              Devices
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              History
            </TabsTrigger>
          </TabsList>

          {/* Clients Tab */}
          <TabsContent value="clients" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Clients</CardTitle>
                  <CardDescription>Manage your client database</CardDescription>
                </div>
                <Dialog open={isClientDialogOpen} onOpenChange={setIsClientDialogOpen}>
                  <DialogTrigger asChild>
                    <Button><Plus className="w-4 h-4 mr-2" />Add Client</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Client</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Full Name *</Label>
                        <Input 
                          value={newClient.full_name} 
                          onChange={(e) => setNewClient({ ...newClient, full_name: e.target.value })} 
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <Label>Email</Label>
                        <Input 
                          type="email"
                          value={newClient.email} 
                          onChange={(e) => setNewClient({ ...newClient, email: e.target.value })} 
                          placeholder="john@example.com"
                        />
                      </div>
                      <div>
                        <Label>Phone</Label>
                        <Input 
                          value={newClient.phone} 
                          onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })} 
                          placeholder="+1234567890"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleAddClient}>Add Client</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clients.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell className="font-medium">{client.full_name}</TableCell>
                        <TableCell>{client.email || '-'}</TableCell>
                        <TableCell>{client.phone || '-'}</TableCell>
                        <TableCell>{format(new Date(client.created_at), 'MMM d, yyyy')}</TableCell>
                      </TableRow>
                    ))}
                    {clients.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                          No clients found. Add your first client.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Payments</CardTitle>
                  <CardDescription>Track payment due dates and status</CardDescription>
                </div>
                <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
                  <DialogTrigger asChild>
                    <Button><Plus className="w-4 h-4 mr-2" />Add Payment</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Payment</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Client *</Label>
                        <Select value={newPayment.client_id} onValueChange={(v) => setNewPayment({ ...newPayment, client_id: v })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a client" />
                          </SelectTrigger>
                          <SelectContent>
                            {paymentClients.map((c) => (
                              <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Amount *</Label>
                        <Input 
                          type="number"
                          value={newPayment.amount} 
                          onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })} 
                          placeholder="100.00"
                        />
                      </div>
                      <div>
                        <Label>Currency</Label>
                        <Select value={newPayment.currency} onValueChange={(v) => setNewPayment({ ...newPayment, currency: v })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="EUR">EUR</SelectItem>
                            <SelectItem value="GBP">GBP</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Due Date *</Label>
                        <Input 
                          type="date"
                          value={newPayment.due_date} 
                          onChange={(e) => setNewPayment({ ...newPayment, due_date: e.target.value })} 
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleAddPayment}>Add Payment</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Reminders</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">{payment.clients?.full_name || 'Unknown'}</TableCell>
                        <TableCell>{payment.currency} {payment.amount.toLocaleString()}</TableCell>
                        <TableCell>{format(new Date(payment.due_date), 'MMM d, yyyy')}</TableCell>
                        <TableCell>
                          <Badge variant={payment.status === 'PAID' ? 'default' : 'destructive'}>
                            {payment.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{payment.reminder_count}/7</TableCell>
                        <TableCell>
                          {payment.status === 'PENDING' && (
                            <Button size="sm" variant="outline" onClick={() => handleMarkAsPaid(payment.id)}>
                              Mark Paid
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {payments.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          No payments found. Add your first payment.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Devices Tab */}
          <TabsContent value="devices" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Registered Devices</CardTitle>
                  <CardDescription>Manage devices for push notifications</CardDescription>
                </div>
                <Dialog open={isDeviceDialogOpen} onOpenChange={setIsDeviceDialogOpen}>
                  <DialogTrigger asChild>
                    <Button><Plus className="w-4 h-4 mr-2" />Register Device</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Register Device for Push Notifications</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>FCM Token *</Label>
                        <Input 
                          value={newDevice.fcm_token} 
                          onChange={(e) => setNewDevice({ ...newDevice, fcm_token: e.target.value })} 
                          placeholder="Enter FCM token from your mobile app"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Get this token from your Firebase-enabled mobile app
                        </p>
                      </div>
                      <div>
                        <Label>Device Type</Label>
                        <Select value={newDevice.device_type} onValueChange={(v) => setNewDevice({ ...newDevice, device_type: v })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="android">Android</SelectItem>
                            <SelectItem value="ios">iOS</SelectItem>
                            <SelectItem value="web">Web</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Device Name (Optional)</Label>
                        <Input 
                          value={newDevice.device_name} 
                          onChange={(e) => setNewDevice({ ...newDevice, device_name: e.target.value })} 
                          placeholder="My iPhone, Work Phone, etc."
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleRegisterDevice}>Register Device</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Device Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>FCM Token</TableHead>
                      <TableHead>Registered</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {devices.map((device) => (
                      <TableRow key={device.id}>
                        <TableCell className="font-medium">{device.device_name || 'Unnamed Device'}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{device.device_type}</Badge>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate font-mono text-xs">
                          {device.fcm_token.substring(0, 30)}...
                        </TableCell>
                        <TableCell>{format(new Date(device.created_at), 'MMM d, yyyy')}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteDevice(device.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {devices.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          No devices registered. Add your first device to receive push notifications.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Notification History</CardTitle>
                  <CardDescription>View recent push notification logs</CardDescription>
                </div>
                <Button variant="outline" onClick={fetchData} disabled={isLoading}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Sent At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {notifications.map((notification) => (
                      <TableRow key={notification.id}>
                        <TableCell>
                          <Badge variant="outline">{notification.notification_type}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">{notification.title}</TableCell>
                        <TableCell className="max-w-[300px] truncate">{notification.body}</TableCell>
                        <TableCell>
                          <Badge variant={notification.status === 'sent' ? 'default' : 'destructive'}>
                            {notification.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{format(new Date(notification.sent_at), 'MMM d, yyyy HH:mm')}</TableCell>
                      </TableRow>
                    ))}
                    {notifications.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          No notifications sent yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
