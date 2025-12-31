import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Calendar, TrendingUp, PieChart as PieChartIcon, BarChart3, FileText } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  ResponsiveContainer,
} from 'recharts';

export default function Reports() {
  const { loans, ticketRecords } = useData();
  const { toast } = useToast();
  const [reportType, setReportType] = useState<'monthly' | 'yearly'>('monthly');

  // Calculate loan status distribution
  const statusDistribution = [
    { name: 'Active', value: loans.filter(l => l.status === 'Active').length, color: 'hsl(217, 91%, 60%)' },
    { name: 'Overdue', value: loans.filter(l => l.status === 'Overdue').length, color: 'hsl(350, 89%, 60%)' },
    { name: 'Paid', value: loans.filter(l => l.status === 'Paid').length, color: 'hsl(160, 84%, 39%)' },
  ].filter(item => item.value > 0);

  // Revenue breakdown by currency
  const usdLoans = loans.filter(l => l.currency === 'USD');
  const rwfLoans = loans.filter(l => l.currency === 'RWF');
  
  const usdTickets = ticketRecords.filter(t => t.currency === 'USD');
  const rwfTickets = ticketRecords.filter(t => t.currency === 'RWF');

  const revenueData = [
    {
      name: 'Loans',
      USD: usdLoans.reduce((sum, l) => sum + l.amount, 0),
      RWF: rwfLoans.reduce((sum, l) => sum + l.amount, 0) / 1000, // Divide by 1000 for display
    },
    {
      name: 'Interest',
      USD: usdLoans.filter(l => l.status === 'Paid').reduce((sum, l) => sum + (l.paidAmount - l.amount), 0),
      RWF: rwfLoans.filter(l => l.status === 'Paid').reduce((sum, l) => sum + (l.paidAmount - l.amount), 0) / 1000,
    },
    {
      name: 'Ticket Fees',
      USD: usdTickets.reduce((sum, t) => sum + t.serviceFee, 0),
      RWF: rwfTickets.reduce((sum, t) => sum + t.serviceFee, 0) / 1000,
    },
  ];

  // Monthly trends (mock data for visualization)
  const monthlyTrends = [
    { month: 'Jan', loans: 12, revenue: 15000 },
    { month: 'Feb', loans: 15, revenue: 18500 },
    { month: 'Mar', loans: 10, revenue: 12000 },
    { month: 'Apr', loans: 18, revenue: 22000 },
    { month: 'May', loans: 14, revenue: 17500 },
    { month: 'Jun', loans: 20, revenue: 25000 },
  ];

  // Calculate totals
  const totalUSDRevenue = usdLoans.reduce((sum, l) => sum + l.amount, 0) + usdTickets.reduce((sum, t) => sum + t.totalAmount, 0);
  const totalRWFRevenue = rwfLoans.reduce((sum, l) => sum + l.amount, 0) + rwfTickets.reduce((sum, t) => sum + t.totalAmount, 0);

  const formatCurrency = (amount: number, currency: string) => {
    if (currency === 'USD') {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    }
    return new Intl.NumberFormat('rw-RW', { style: 'currency', currency: 'RWF', maximumFractionDigits: 0 }).format(amount);
  };

  const handleExportJSON = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      reportType,
      summary: {
        totalLoans: loans.length,
        activeLoans: loans.filter(l => l.status === 'Active').length,
        overdueLoans: loans.filter(l => l.status === 'Overdue').length,
        paidLoans: loans.filter(l => l.status === 'Paid').length,
        totalUSDRevenue,
        totalRWFRevenue,
      },
      loans,
      ticketRecords,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `uj-management-report-${reportType}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: 'Report Exported',
      description: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report has been exported as JSON.`,
    });
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const primaryColor: [number, number, number] = [30, 41, 59]; // Navy
    const accentColor: [number, number, number] = [59, 130, 246]; // Blue
    const successColor: [number, number, number] = [16, 185, 129]; // Emerald
    const dangerColor: [number, number, number] = [244, 63, 94]; // Rose
    
    let yPos = 20;

    // Header with branding
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, 45, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('UJ Management', 15, 22);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Financial System', 15, 32);
    
    doc.setFontSize(10);
    doc.text(`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`, pageWidth - 15, 22, { align: 'right' });
    doc.text(new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }), pageWidth - 15, 32, { align: 'right' });

    yPos = 55;

    // Executive Summary Section
    doc.setTextColor(...primaryColor);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Executive Summary', 15, yPos);
    
    yPos += 10;
    
    // Summary boxes
    const boxWidth = (pageWidth - 40) / 2;
    
    // USD Revenue Box
    doc.setFillColor(240, 249, 255);
    doc.roundedRect(15, yPos, boxWidth, 25, 3, 3, 'F');
    doc.setDrawColor(...accentColor);
    doc.roundedRect(15, yPos, boxWidth, 25, 3, 3, 'S');
    doc.setTextColor(...accentColor);
    doc.setFontSize(10);
    doc.text('Total USD Revenue', 20, yPos + 8);
    doc.setTextColor(...primaryColor);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(formatCurrency(totalUSDRevenue, 'USD'), 20, yPos + 18);
    
    // RWF Revenue Box
    doc.setFillColor(240, 253, 244);
    doc.roundedRect(25 + boxWidth, yPos, boxWidth, 25, 3, 3, 'F');
    doc.setDrawColor(...successColor);
    doc.roundedRect(25 + boxWidth, yPos, boxWidth, 25, 3, 3, 'S');
    doc.setTextColor(...successColor);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Total RWF Revenue', 30 + boxWidth, yPos + 8);
    doc.setTextColor(...primaryColor);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(formatCurrency(totalRWFRevenue, 'RWF'), 30 + boxWidth, yPos + 18);

    yPos += 35;

    // Loan Statistics
    doc.setTextColor(...primaryColor);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Loan Statistics', 15, yPos);
    
    yPos += 8;

    const activeLoans = loans.filter(l => l.status === 'Active').length;
    const overdueLoans = loans.filter(l => l.status === 'Overdue').length;
    const paidLoans = loans.filter(l => l.status === 'Paid').length;

    autoTable(doc, {
      startY: yPos,
      head: [['Metric', 'Count', 'Percentage']],
      body: [
        ['Total Loans', loans.length.toString(), '100%'],
        ['Active Loans', activeLoans.toString(), `${loans.length > 0 ? ((activeLoans / loans.length) * 100).toFixed(1) : 0}%`],
        ['Overdue Loans', overdueLoans.toString(), `${loans.length > 0 ? ((overdueLoans / loans.length) * 100).toFixed(1) : 0}%`],
        ['Paid Loans', paidLoans.toString(), `${loans.length > 0 ? ((paidLoans / loans.length) * 100).toFixed(1) : 0}%`],
      ],
      headStyles: { 
        fillColor: primaryColor,
        fontSize: 10,
        fontStyle: 'bold'
      },
      bodyStyles: { fontSize: 9 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: 15, right: 15 },
      theme: 'grid',
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;

    // Loans Detail Table
    doc.setTextColor(...primaryColor);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Loan Details', 15, yPos);
    
    yPos += 8;

    autoTable(doc, {
      startY: yPos,
      head: [['Borrower', 'Currency', 'Amount', 'Interest', 'Due Date', 'Status']],
      body: loans.map(loan => [
        loan.borrowerName,
        loan.currency,
        formatCurrency(loan.amount, loan.currency),
        `${loan.interestRate}%`,
        new Date(loan.dueDate).toLocaleDateString(),
        loan.status
      ]),
      headStyles: { 
        fillColor: primaryColor,
        fontSize: 9,
        fontStyle: 'bold'
      },
      bodyStyles: { fontSize: 8 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: 15, right: 15 },
      theme: 'grid',
      didParseCell: (data) => {
        if (data.column.index === 5 && data.section === 'body') {
          const status = data.cell.raw as string;
          if (status === 'Paid') {
            data.cell.styles.textColor = successColor;
            data.cell.styles.fontStyle = 'bold';
          } else if (status === 'Overdue') {
            data.cell.styles.textColor = dangerColor;
            data.cell.styles.fontStyle = 'bold';
          } else {
            data.cell.styles.textColor = accentColor;
            data.cell.styles.fontStyle = 'bold';
          }
        }
      }
    });

    // Add new page for Ticket/Visa section
    doc.addPage();
    yPos = 20;

    // Ticket/Visa Section Header
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Ticket & Visa Accounting', 15, 20);

    yPos = 45;

    // Ticket Summary
    const usdTicketTotal = usdTickets.reduce((sum, t) => sum + t.totalAmount, 0);
    const rwfTicketTotal = rwfTickets.reduce((sum, t) => sum + t.totalAmount, 0);
    
    doc.setTextColor(...primaryColor);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`USD Transactions: ${formatCurrency(usdTicketTotal, 'USD')}`, 15, yPos);
    doc.text(`RWF Transactions: ${formatCurrency(rwfTicketTotal, 'RWF')}`, pageWidth / 2, yPos);

    yPos += 15;

    // Ticket Details Table
    autoTable(doc, {
      startY: yPos,
      head: [['Buyer', 'Ticket #', 'Destination', 'Currency', 'Paid', 'Fee', 'Total']],
      body: ticketRecords.map(ticket => [
        ticket.buyerName,
        ticket.ticketNumber,
        ticket.visaDestination,
        ticket.currency,
        formatCurrency(ticket.moneyPaid, ticket.currency),
        formatCurrency(ticket.serviceFee, ticket.currency),
        formatCurrency(ticket.totalAmount, ticket.currency),
      ]),
      headStyles: { 
        fillColor: primaryColor,
        fontSize: 9,
        fontStyle: 'bold'
      },
      bodyStyles: { fontSize: 8 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: 15, right: 15 },
      theme: 'grid',
    });

    // Footer on all pages
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFillColor(248, 250, 252);
      doc.rect(0, doc.internal.pageSize.getHeight() - 20, pageWidth, 20, 'F');
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(
        'UJ Management Financial System - Confidential Report',
        15,
        doc.internal.pageSize.getHeight() - 10
      );
      doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth - 15,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'right' }
      );
    }

    // Save the PDF
    doc.save(`uj-management-report-${reportType}-${new Date().toISOString().split('T')[0]}.pdf`);

    toast({
      title: 'PDF Report Generated',
      description: 'Your professional report has been downloaded successfully.',
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
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Reports & Analytics</h1>
            <p className="text-muted-foreground mt-1">Comprehensive financial insights and trends.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center p-1 bg-muted rounded-lg">
              <button
                onClick={() => setReportType('monthly')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  reportType === 'monthly'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Calendar className="w-4 h-4 inline mr-2" />
                Monthly
              </button>
              <button
                onClick={() => setReportType('yearly')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  reportType === 'yearly'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <TrendingUp className="w-4 h-4 inline mr-2" />
                Yearly
              </button>
            </div>
            <Button
              variant="outline"
              onClick={handleExportJSON}
              className="border-border"
            >
              <Download className="w-4 h-4 mr-2" />
              Export JSON
            </Button>
            <Button
              onClick={handleExportPDF}
              className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg shadow-accent/20"
            >
              <FileText className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </motion.div>

        {/* Revenue Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6 bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                  <span className="font-bold text-accent">$</span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total USD Revenue</p>
                  <p className="text-2xl font-bold text-foreground">{formatCurrency(totalUSDRevenue, 'USD')}</p>
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
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
                  <span className="font-bold text-success">RF</span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total RWF Revenue</p>
                  <p className="text-2xl font-bold text-foreground">{formatCurrency(totalRWFRevenue, 'RWF')}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Loan Status Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <PieChartIcon className="w-5 h-5 text-accent" />
                <h3 className="font-semibold text-foreground">Loan Status Distribution</h3>
              </div>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </motion.div>

          {/* Revenue Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <BarChart3 className="w-5 h-5 text-accent" />
                <h3 className="font-semibold text-foreground">Revenue Breakdown</h3>
              </div>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="USD" fill="hsl(217, 91%, 60%)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="RWF" name="RWF (÷1000)" fill="hsl(160, 84%, 39%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </motion.div>

          {/* Activity Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2"
          >
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-5 h-5 text-accent" />
                <h3 className="font-semibold text-foreground">
                  {reportType === 'monthly' ? 'Monthly' : 'Yearly'} Activity Trend
                </h3>
              </div>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                    <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" />
                    <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="loans"
                      name="New Loans"
                      stroke="hsl(217, 91%, 60%)"
                      strokeWidth={3}
                      dot={{ fill: 'hsl(217, 91%, 60%)', strokeWidth: 2, r: 4 }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="revenue"
                      name="Revenue (USD)"
                      stroke="hsl(160, 84%, 39%)"
                      strokeWidth={3}
                      dot={{ fill: 'hsl(160, 84%, 39%)', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
