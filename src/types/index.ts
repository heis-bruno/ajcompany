export type Currency = 'USD' | 'RWF';

export type LoanStatus = 'Active' | 'Overdue' | 'Paid';

export type InterestType = 'Daily' | 'Monthly' | 'Fixed';

export type PaymentStatus = 'Pending' | 'Partial' | 'Completed';

export interface Loan {
  id: string;
  borrowerName: string;
  borrowerEmail: string;
  borrowerPhone: string;
  currency: Currency;
  amount: number;
  interestRate: number;
  interestType: InterestType;
  startDate: string;
  dueDate: string;
  paymentStatus: PaymentStatus;
  status: LoanStatus;
  paidAmount: number;
  lateFee: number;
  createdAt: string;
}

export interface TicketRecord {
  id: string;
  buyerName: string;
  ticketNumber: string;
  visaDestination: string;
  currency: Currency;
  moneyPaid: number;
  serviceFee: number;
  totalAmount: number;
  createdAt: string;
}

export interface DashboardStats {
  totalLoans: number;
  activeLoans: number;
  overdueLoans: number;
  paidLoans: number;
  usdSummary: {
    totalLoans: number;
    interestEarned: number;
    lateFees: number;
    unpaidBalance: number;
  };
  rwfSummary: {
    totalLoans: number;
    interestEarned: number;
    lateFees: number;
    unpaidBalance: number;
  };
}

export interface User {
  id: string;
  username: string;
  role: 'Admin';
}
