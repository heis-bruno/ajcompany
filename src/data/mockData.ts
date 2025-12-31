import { Loan, TicketRecord, DashboardStats, User } from '@/types';

export const mockUser: User = {
  id: '1',
  username: 'admin',
  role: 'Admin',
};

export const mockLoans: Loan[] = [
  {
    id: '1',
    borrowerName: 'Jean Pierre Habimana',
    borrowerEmail: 'jean.habimana@email.com',
    borrowerPhone: '+250 788 123 456',
    currency: 'USD',
    amount: 5000,
    interestRate: 5,
    interestType: 'Monthly',
    startDate: '2024-01-15',
    dueDate: '2024-07-15',
    paymentStatus: 'Pending',
    status: 'Active',
    paidAmount: 0,
    lateFee: 0,
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    borrowerName: 'Marie Claire Uwimana',
    borrowerEmail: 'marie.uwimana@email.com',
    borrowerPhone: '+250 788 234 567',
    currency: 'RWF',
    amount: 2500000,
    interestRate: 3,
    interestType: 'Monthly',
    startDate: '2024-02-01',
    dueDate: '2024-05-01',
    paymentStatus: 'Pending',
    status: 'Overdue',
    paidAmount: 500000,
    lateFee: 75000,
    createdAt: '2024-02-01',
  },
  {
    id: '3',
    borrowerName: 'Patrick Mugabo',
    borrowerEmail: 'patrick.mugabo@email.com',
    borrowerPhone: '+250 788 345 678',
    currency: 'USD',
    amount: 3000,
    interestRate: 4,
    interestType: 'Monthly',
    startDate: '2023-10-01',
    dueDate: '2024-01-01',
    paymentStatus: 'Completed',
    status: 'Paid',
    paidAmount: 3360,
    lateFee: 0,
    createdAt: '2023-10-01',
  },
  {
    id: '4',
    borrowerName: 'Diane Mukamana',
    borrowerEmail: 'diane.mukamana@email.com',
    borrowerPhone: '+250 788 456 789',
    currency: 'RWF',
    amount: 1500000,
    interestRate: 100,
    interestType: 'Fixed',
    startDate: '2024-03-01',
    dueDate: '2024-09-01',
    paymentStatus: 'Partial',
    status: 'Active',
    paidAmount: 750000,
    lateFee: 0,
    createdAt: '2024-03-01',
  },
  {
    id: '5',
    borrowerName: 'Emmanuel Niyonzima',
    borrowerEmail: 'emmanuel.niyonzima@email.com',
    borrowerPhone: '+250 788 567 890',
    currency: 'USD',
    amount: 10000,
    interestRate: 0.1,
    interestType: 'Daily',
    startDate: '2024-04-01',
    dueDate: '2024-06-01',
    paymentStatus: 'Pending',
    status: 'Overdue',
    paidAmount: 0,
    lateFee: 500,
    createdAt: '2024-04-01',
  },
  {
    id: '6',
    borrowerName: 'Claudine Ingabire',
    borrowerEmail: 'claudine.ingabire@email.com',
    borrowerPhone: '+250 788 678 901',
    currency: 'RWF',
    amount: 800000,
    interestRate: 2.5,
    interestType: 'Monthly',
    startDate: '2024-01-10',
    dueDate: '2024-04-10',
    paymentStatus: 'Completed',
    status: 'Paid',
    paidAmount: 860000,
    lateFee: 0,
    createdAt: '2024-01-10',
  },
];

export const mockTicketRecords: TicketRecord[] = [
  {
    id: '1',
    buyerName: 'Alice Mutesi',
    ticketNumber: 'TK-2024-001',
    visaDestination: 'Dubai, UAE',
    currency: 'USD',
    moneyPaid: 850,
    serviceFee: 75,
    totalAmount: 925,
    createdAt: '2024-03-15',
  },
  {
    id: '2',
    buyerName: 'Robert Kamanzi',
    ticketNumber: 'TK-2024-002',
    visaDestination: 'Nairobi, Kenya',
    currency: 'RWF',
    moneyPaid: 250000,
    serviceFee: 25000,
    totalAmount: 275000,
    createdAt: '2024-03-20',
  },
  {
    id: '3',
    buyerName: 'Grace Uwamariya',
    ticketNumber: 'TK-2024-003',
    visaDestination: 'London, UK',
    currency: 'USD',
    moneyPaid: 1200,
    serviceFee: 150,
    totalAmount: 1350,
    createdAt: '2024-04-01',
  },
  {
    id: '4',
    buyerName: 'David Nsengimana',
    ticketNumber: 'TK-2024-004',
    visaDestination: 'Johannesburg, SA',
    currency: 'USD',
    moneyPaid: 600,
    serviceFee: 50,
    totalAmount: 650,
    createdAt: '2024-04-05',
  },
  {
    id: '5',
    buyerName: 'Jacqueline Mukeshimana',
    ticketNumber: 'TK-2024-005',
    visaDestination: 'Addis Ababa, Ethiopia',
    currency: 'RWF',
    moneyPaid: 180000,
    serviceFee: 20000,
    totalAmount: 200000,
    createdAt: '2024-04-10',
  },
];

export const calculateDashboardStats = (loans: Loan[]): DashboardStats => {
  const usdLoans = loans.filter(l => l.currency === 'USD');
  const rwfLoans = loans.filter(l => l.currency === 'RWF');

  const calculateInterest = (loan: Loan): number => {
    if (loan.interestType === 'Fixed') {
      return loan.interestRate;
    }
    const months = Math.ceil(
      (new Date(loan.dueDate).getTime() - new Date(loan.startDate).getTime()) / 
      (1000 * 60 * 60 * 24 * 30)
    );
    if (loan.interestType === 'Daily') {
      return loan.amount * (loan.interestRate / 100) * months * 30;
    }
    return loan.amount * (loan.interestRate / 100) * months;
  };

  return {
    totalLoans: loans.length,
    activeLoans: loans.filter(l => l.status === 'Active').length,
    overdueLoans: loans.filter(l => l.status === 'Overdue').length,
    paidLoans: loans.filter(l => l.status === 'Paid').length,
    usdSummary: {
      totalLoans: usdLoans.reduce((sum, l) => sum + l.amount, 0),
      interestEarned: usdLoans.filter(l => l.status === 'Paid').reduce((sum, l) => sum + calculateInterest(l), 0),
      lateFees: usdLoans.reduce((sum, l) => sum + l.lateFee, 0),
      unpaidBalance: usdLoans.filter(l => l.status !== 'Paid').reduce((sum, l) => sum + (l.amount + calculateInterest(l) - l.paidAmount), 0),
    },
    rwfSummary: {
      totalLoans: rwfLoans.reduce((sum, l) => sum + l.amount, 0),
      interestEarned: rwfLoans.filter(l => l.status === 'Paid').reduce((sum, l) => sum + calculateInterest(l), 0),
      lateFees: rwfLoans.reduce((sum, l) => sum + l.lateFee, 0),
      unpaidBalance: rwfLoans.filter(l => l.status !== 'Paid').reduce((sum, l) => sum + (l.amount + calculateInterest(l) - l.paidAmount), 0),
    },
  };
};
