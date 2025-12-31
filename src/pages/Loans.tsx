import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Download,
  Filter,
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
} from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { StatusBadge } from '@/components/StatusBadge';
import { CurrencyToggle } from '@/components/CurrencyToggle';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Loan, Currency, LoanStatus, InterestType } from '@/types';
import { format } from 'date-fns';

export default function Loans() {
  const { loans, addLoan, updateLoan, deleteLoan } = useData();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    borrowerName: '',
    borrowerEmail: '',
    borrowerPhone: '',
    currency: 'USD' as Currency,
    amount: '',
    interestRate: '',
    interestType: 'Monthly' as InterestType,
    startDate: '',
    dueDate: '',
  });

  const filteredLoans = loans.filter(loan => {
    const matchesSearch = 
      loan.borrowerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loan.borrowerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loan.borrowerPhone.includes(searchQuery);
    
    const matchesStatus = statusFilter === 'all' || loan.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount: number, currency: string) => {
    if (currency === 'USD') {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    }
    return new Intl.NumberFormat('rw-RW', { style: 'currency', currency: 'RWF', maximumFractionDigits: 0 }).format(amount);
  };

  const resetForm = () => {
    setFormData({
      borrowerName: '',
      borrowerEmail: '',
      borrowerPhone: '',
      currency: 'USD',
      amount: '',
      interestRate: '',
      interestType: 'Monthly',
      startDate: '',
      dueDate: '',
    });
    setEditingLoan(null);
  };

  const handleOpenModal = (loan?: Loan) => {
    if (loan) {
      setEditingLoan(loan);
      setFormData({
        borrowerName: loan.borrowerName,
        borrowerEmail: loan.borrowerEmail,
        borrowerPhone: loan.borrowerPhone,
        currency: loan.currency,
        amount: loan.amount.toString(),
        interestRate: loan.interestRate.toString(),
        interestType: loan.interestType,
        startDate: loan.startDate,
        dueDate: loan.dueDate,
      });
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const loanData = {
      borrowerName: formData.borrowerName,
      borrowerEmail: formData.borrowerEmail,
      borrowerPhone: formData.borrowerPhone,
      currency: formData.currency,
      amount: parseFloat(formData.amount),
      interestRate: parseFloat(formData.interestRate),
      interestType: formData.interestType,
      startDate: formData.startDate,
      dueDate: formData.dueDate,
      paymentStatus: 'Pending' as const,
      status: 'Active' as LoanStatus,
      paidAmount: 0,
      lateFee: 0,
    };

    if (editingLoan) {
      updateLoan(editingLoan.id, loanData);
      toast({
        title: 'Loan Updated',
        description: 'The loan has been updated successfully.',
      });
    } else {
      addLoan(loanData);
      toast({
        title: 'Loan Created',
        description: 'New loan has been created successfully.',
      });
    }

    setIsModalOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    deleteLoan(id);
    toast({
      title: 'Loan Deleted',
      description: 'The loan has been deleted successfully.',
      variant: 'destructive',
    });
  };

  const handleExportCSV = () => {
    const headers = ['Borrower Name', 'Email', 'Phone', 'Currency', 'Amount', 'Interest Rate', 'Interest Type', 'Start Date', 'Due Date', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filteredLoans.map(loan => [
        loan.borrowerName,
        loan.borrowerEmail,
        loan.borrowerPhone,
        loan.currency,
        loan.amount,
        loan.interestRate,
        loan.interestType,
        loan.startDate,
        loan.dueDate,
        loan.status,
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'loans.csv';
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: 'Export Successful',
      description: 'Loans have been exported to CSV.',
    });
  };

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
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Loans Management</h1>
            <p className="text-muted-foreground mt-1">Manage and track all loan records.</p>
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
              Add New Loan
            </Button>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Overdue">Overdue</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Borrower</TableHead>
                    <TableHead>Currency</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Interest</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[60px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLoans.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-12">
                        <div className="flex flex-col items-center gap-2">
                          <Search className="w-8 h-8 text-muted-foreground/50" />
                          <p>No loans found</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLoans.map((loan, index) => (
                      <motion.tr
                        key={loan.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-border hover:bg-muted/50"
                      >
                        <TableCell>
                          <div>
                            <p className="font-medium text-foreground">{loan.borrowerName}</p>
                            <p className="text-xs text-muted-foreground">{loan.borrowerEmail}</p>
                            <p className="text-xs text-muted-foreground">{loan.borrowerPhone}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="px-2 py-1 rounded bg-muted text-xs font-medium">
                            {loan.currency}
                          </span>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(loan.amount, loan.currency)}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{loan.interestRate}%</p>
                            <p className="text-xs text-muted-foreground">{loan.interestType}</p>
                          </div>
                        </TableCell>
                        <TableCell>{format(new Date(loan.dueDate), 'MMM dd, yyyy')}</TableCell>
                        <TableCell><StatusBadge status={loan.paymentStatus} /></TableCell>
                        <TableCell><StatusBadge status={loan.status} /></TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-card border-border">
                              <DropdownMenuItem onClick={() => handleOpenModal(loan)}>
                                <Pencil className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(loan.id)}
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
          <DialogContent className="max-w-2xl bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                {editingLoan ? 'Edit Loan' : 'Add New Loan'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Borrower Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Borrower Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="borrowerName">Full Name</Label>
                    <Input
                      id="borrowerName"
                      value={formData.borrowerName}
                      onChange={(e) => setFormData({ ...formData, borrowerName: e.target.value })}
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="borrowerEmail">Email</Label>
                    <Input
                      id="borrowerEmail"
                      type="email"
                      value={formData.borrowerEmail}
                      onChange={(e) => setFormData({ ...formData, borrowerEmail: e.target.value })}
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="borrowerPhone">Phone Number</Label>
                    <Input
                      id="borrowerPhone"
                      value={formData.borrowerPhone}
                      onChange={(e) => setFormData({ ...formData, borrowerPhone: e.target.value })}
                      placeholder="+250 788 123 456"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Loan Details */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Loan Details
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Label>Currency</Label>
                    <CurrencyToggle
                      value={formData.currency}
                      onChange={(value) => setFormData({ ...formData, currency: value })}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Loan Amount</Label>
                      <Input
                        id="amount"
                        type="number"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        placeholder="5000"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="interestRate">Interest Rate (%)</Label>
                      <Input
                        id="interestRate"
                        type="number"
                        step="0.1"
                        value={formData.interestRate}
                        onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                        placeholder="5"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="interestType">Interest Type</Label>
                      <Select
                        value={formData.interestType}
                        onValueChange={(value: InterestType) => setFormData({ ...formData, interestType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Daily">Daily</SelectItem>
                          <SelectItem value="Monthly">Monthly</SelectItem>
                          <SelectItem value="Fixed">Fixed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="dueDate">Due Date</Label>
                      <Input
                        id="dueDate"
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  {editingLoan ? 'Update Loan' : 'Create Loan'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
