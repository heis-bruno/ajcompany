import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  Download,
  MoreHorizontal,
  Pencil,
  Trash2,
  Plane,
  DollarSign,
} from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { CurrencyToggle } from '@/components/CurrencyToggle';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/hooks/use-toast';
import { TicketRecord, Currency } from '@/types';

export default function TicketVisa() {
  const { ticketRecords, addTicketRecord, updateTicketRecord, deleteTicketRecord } = useData();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<TicketRecord | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    buyerName: '',
    ticketNumber: '',
    visaDestination: '',
    currency: 'USD' as Currency,
    moneyPaid: '',
    serviceFee: '',
  });

  const filteredRecords = ticketRecords.filter(record => 
    record.buyerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.visaDestination.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate totals
  const usdTotal = ticketRecords
    .filter(r => r.currency === 'USD')
    .reduce((sum, r) => sum + r.totalAmount, 0);
  
  const rwfTotal = ticketRecords
    .filter(r => r.currency === 'RWF')
    .reduce((sum, r) => sum + r.totalAmount, 0);

  const formatCurrency = (amount: number, currency: string) => {
    if (currency === 'USD') {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    }
    return new Intl.NumberFormat('rw-RW', { style: 'currency', currency: 'RWF', maximumFractionDigits: 0 }).format(amount);
  };

  const resetForm = () => {
    setFormData({
      buyerName: '',
      ticketNumber: '',
      visaDestination: '',
      currency: 'USD',
      moneyPaid: '',
      serviceFee: '',
    });
    setEditingRecord(null);
  };

  const handleOpenModal = (record?: TicketRecord) => {
    if (record) {
      setEditingRecord(record);
      setFormData({
        buyerName: record.buyerName,
        ticketNumber: record.ticketNumber,
        visaDestination: record.visaDestination,
        currency: record.currency,
        moneyPaid: record.moneyPaid.toString(),
        serviceFee: record.serviceFee.toString(),
      });
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const recordData = {
      buyerName: formData.buyerName,
      ticketNumber: formData.ticketNumber,
      visaDestination: formData.visaDestination,
      currency: formData.currency,
      moneyPaid: parseFloat(formData.moneyPaid),
      serviceFee: parseFloat(formData.serviceFee),
    };

    if (editingRecord) {
      updateTicketRecord(editingRecord.id, recordData);
      toast({
        title: 'Record Updated',
        description: 'The ticket/visa record has been updated successfully.',
      });
    } else {
      addTicketRecord(recordData);
      toast({
        title: 'Record Created',
        description: 'New ticket/visa record has been created successfully.',
      });
    }

    setIsModalOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    deleteTicketRecord(id);
    toast({
      title: 'Record Deleted',
      description: 'The record has been deleted successfully.',
      variant: 'destructive',
    });
  };

  const handleExportCSV = () => {
    const headers = ['Buyer Name', 'Ticket Number', 'Visa/Destination', 'Currency', 'Money Paid', 'Service Fee', 'Total Amount'];
    const csvContent = [
      headers.join(','),
      ...filteredRecords.map(record => [
        record.buyerName,
        record.ticketNumber,
        record.visaDestination,
        record.currency,
        record.moneyPaid,
        record.serviceFee,
        record.totalAmount,
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ticket-visa-records.csv';
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: 'Export Successful',
      description: 'Records have been exported to CSV.',
    });
  };

  const calculatedTotal = parseFloat(formData.moneyPaid || '0') + parseFloat(formData.serviceFee || '0');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Ticket / Visa Accounting</h1>
            <p className="text-muted-foreground mt-1">Track travel ticket and visa transactions.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleExportCSV}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button
              onClick={() => handleOpenModal()}
              className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg shadow-accent/20"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Record
            </Button>
          </div>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6 bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total USD Transactions</p>
                  <p className="text-2xl font-bold text-foreground">{formatCurrency(usdTotal, 'USD')}</p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6 bg-gradient-to-br from-success/5 to-success/10 border-success/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center">
                  <span className="font-bold text-success text-lg">RF</span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total RWF Transactions</p>
                  <p className="text-2xl font-bold text-foreground">{formatCurrency(rwfTotal, 'RWF')}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by buyer name, ticket number, or destination..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </Card>
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Buyer Name</TableHead>
                    <TableHead>Ticket Number</TableHead>
                    <TableHead>Visa / Destination</TableHead>
                    <TableHead>Currency</TableHead>
                    <TableHead>Money Paid</TableHead>
                    <TableHead>Service Fee</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead className="w-[60px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-12">
                        <div className="flex flex-col items-center gap-2">
                          <Plane className="w-8 h-8 text-muted-foreground/50" />
                          <p>No records found</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRecords.map((record, index) => (
                      <motion.tr
                        key={record.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-border hover:bg-muted/50"
                      >
                        <TableCell className="font-medium">{record.buyerName}</TableCell>
                        <TableCell>
                          <span className="px-2 py-1 rounded bg-muted text-xs font-mono">
                            {record.ticketNumber}
                          </span>
                        </TableCell>
                        <TableCell>{record.visaDestination}</TableCell>
                        <TableCell>
                          <span className="px-2 py-1 rounded bg-muted text-xs font-medium">
                            {record.currency}
                          </span>
                        </TableCell>
                        <TableCell>{formatCurrency(record.moneyPaid, record.currency)}</TableCell>
                        <TableCell className="text-accent font-medium">
                          {formatCurrency(record.serviceFee, record.currency)}
                        </TableCell>
                        <TableCell className="font-bold text-success">
                          {formatCurrency(record.totalAmount, record.currency)}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-card border-border">
                              <DropdownMenuItem onClick={() => handleOpenModal(record)}>
                                <Pencil className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(record.id)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </motion.tr>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </motion.div>

        {/* Add/Edit Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-lg bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                {editingRecord ? 'Edit Record' : 'Add New Record'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="buyerName">Buyer Name</Label>
                <Input
                  id="buyerName"
                  value={formData.buyerName}
                  onChange={(e) => setFormData({ ...formData, buyerName: e.target.value })}
                  placeholder="Enter buyer name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ticketNumber">Ticket Number</Label>
                <Input
                  id="ticketNumber"
                  value={formData.ticketNumber}
                  onChange={(e) => setFormData({ ...formData, ticketNumber: e.target.value })}
                  placeholder="TK-2024-001"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="visaDestination">Visa / Destination</Label>
                <Input
                  id="visaDestination"
                  value={formData.visaDestination}
                  onChange={(e) => setFormData({ ...formData, visaDestination: e.target.value })}
                  placeholder="Dubai, UAE"
                  required
                />
              </div>

              <div className="flex items-center gap-4">
                <Label>Currency</Label>
                <CurrencyToggle
                  value={formData.currency}
                  onChange={(value) => setFormData({ ...formData, currency: value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="moneyPaid">Money Paid</Label>
                  <Input
                    id="moneyPaid"
                    type="number"
                    value={formData.moneyPaid}
                    onChange={(e) => setFormData({ ...formData, moneyPaid: e.target.value })}
                    placeholder="850"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="serviceFee">Service Fee</Label>
                  <Input
                    id="serviceFee"
                    type="number"
                    value={formData.serviceFee}
                    onChange={(e) => setFormData({ ...formData, serviceFee: e.target.value })}
                    placeholder="75"
                    required
                  />
                </div>
              </div>

              {/* Calculated Total */}
              <Card className="p-4 bg-success/10 border-success/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Total Amount</span>
                  <span className="text-xl font-bold text-success">
                    {formatCurrency(calculatedTotal, formData.currency)}
                  </span>
                </div>
              </Card>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  {editingRecord ? 'Update Record' : 'Create Record'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
