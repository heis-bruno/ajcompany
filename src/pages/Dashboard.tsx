import { motion } from 'framer-motion';
import {
  DollarSign,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle,
  CreditCard,
  Users,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { SummaryCard } from '@/components/SummaryCard';
import { StatusBadge } from '@/components/StatusBadge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useData } from '@/contexts/DataContext';
import { calculateDashboardStats } from '@/data/mockData';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

export default function Dashboard() {
  const { loans } = useData();
  const stats = calculateDashboardStats(loans);
  const navigate = useNavigate();

  const activeLoans = loans.filter(l => l.status === 'Active').slice(0, 5);
  const overdueLoans = loans.filter(l => l.status === 'Overdue').slice(0, 5);

  const formatCurrency = (amount: number, currency: string) => {
    if (currency === 'USD') {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    }
    return new Intl.NumberFormat('rw-RW', { style: 'currency', currency: 'RWF', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Welcome back! Here's your financial overview.</p>
          </div>
          <Button
            onClick={() => navigate('/loans')}
            className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg shadow-accent/20"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Add New Loan
          </Button>
        </motion.div>

        {/* Currency Summaries */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* USD Summary */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6 bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-accent" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">USD Summary</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Total Loans</p>
                  <p className="text-xl font-bold text-foreground">{formatCurrency(stats.usdSummary.totalLoans, 'USD')}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Interest Earned</p>
                  <p className="text-xl font-bold text-success">{formatCurrency(stats.usdSummary.interestEarned, 'USD')}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Late Fees</p>
                  <p className="text-xl font-bold text-warning">{formatCurrency(stats.usdSummary.lateFees, 'USD')}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Unpaid Balance</p>
                  <p className="text-xl font-bold text-destructive">{formatCurrency(stats.usdSummary.unpaidBalance, 'USD')}</p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* RWF Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6 bg-gradient-to-br from-success/5 to-success/10 border-success/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
                  <span className="font-bold text-success">RF</span>
                </div>
                <h2 className="text-lg font-semibold text-foreground">RWF Summary</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Total Loans</p>
                  <p className="text-xl font-bold text-foreground">{formatCurrency(stats.rwfSummary.totalLoans, 'RWF')}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Interest Earned</p>
                  <p className="text-xl font-bold text-success">{formatCurrency(stats.rwfSummary.interestEarned, 'RWF')}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Late Fees</p>
                  <p className="text-xl font-bold text-warning">{formatCurrency(stats.rwfSummary.lateFees, 'RWF')}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Unpaid Balance</p>
                  <p className="text-xl font-bold text-destructive">{formatCurrency(stats.rwfSummary.unpaidBalance, 'RWF')}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard
            title="Total Loans"
            value={stats.totalLoans}
            icon={<Users className="w-5 h-5" />}
            variant="default"
          />
          <SummaryCard
            title="Active Loans"
            value={stats.activeLoans}
            icon={<TrendingUp className="w-5 h-5" />}
            variant="accent"
          />
          <SummaryCard
            title="Overdue Loans"
            value={stats.overdueLoans}
            icon={<AlertTriangle className="w-5 h-5" />}
            variant="destructive"
          />
          <SummaryCard
            title="Paid Loans"
            value={stats.paidLoans}
            icon={<CheckCircle className="w-5 h-5" />}
            variant="success"
          />
        </div>

        {/* Activity Tables */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Active Loans */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="overflow-hidden">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                  <h3 className="font-semibold text-foreground">Active Loans</h3>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate('/loans')}>
                  View All
                  <ArrowUpRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Borrower</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeLoans.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        No active loans
                      </TableCell>
                    </TableRow>
                  ) : (
                    activeLoans.map((loan) => (
                      <TableRow key={loan.id} className="cursor-pointer" onClick={() => navigate('/loans')}>
                        <TableCell className="font-medium">{loan.borrowerName}</TableCell>
                        <TableCell>{formatCurrency(loan.amount, loan.currency)}</TableCell>
                        <TableCell>{format(new Date(loan.dueDate), 'MMM dd, yyyy')}</TableCell>
                        <TableCell><StatusBadge status={loan.status} /></TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </motion.div>

          {/* Overdue Loans */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="overflow-hidden">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-destructive" />
                  <h3 className="font-semibold text-foreground">Overdue Loans</h3>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate('/loans')}>
                  View All
                  <ArrowDownRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Borrower</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Late Fee</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {overdueLoans.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        No overdue loans
                      </TableCell>
                    </TableRow>
                  ) : (
                    overdueLoans.map((loan) => (
                      <TableRow key={loan.id} className="cursor-pointer" onClick={() => navigate('/loans')}>
                        <TableCell className="font-medium">{loan.borrowerName}</TableCell>
                        <TableCell>{formatCurrency(loan.amount, loan.currency)}</TableCell>
                        <TableCell className="text-destructive">{format(new Date(loan.dueDate), 'MMM dd, yyyy')}</TableCell>
                        <TableCell className="text-warning font-medium">{formatCurrency(loan.lateFee, loan.currency)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
