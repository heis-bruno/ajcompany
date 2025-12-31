import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Loan, TicketRecord } from '@/types';
import { mockLoans, mockTicketRecords } from '@/data/mockData';

interface DataContextType {
  loans: Loan[];
  ticketRecords: TicketRecord[];
  addLoan: (loan: Omit<Loan, 'id' | 'createdAt'>) => void;
  updateLoan: (id: string, loan: Partial<Loan>) => void;
  deleteLoan: (id: string) => void;
  addTicketRecord: (record: Omit<TicketRecord, 'id' | 'createdAt' | 'totalAmount'>) => void;
  updateTicketRecord: (id: string, record: Partial<TicketRecord>) => void;
  deleteTicketRecord: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [loans, setLoans] = useState<Loan[]>(mockLoans);
  const [ticketRecords, setTicketRecords] = useState<TicketRecord[]>(mockTicketRecords);

  const addLoan = (loanData: Omit<Loan, 'id' | 'createdAt'>) => {
    const newLoan: Loan = {
      ...loanData,
      id: `loan-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setLoans(prev => [newLoan, ...prev]);
  };

  const updateLoan = (id: string, loanData: Partial<Loan>) => {
    setLoans(prev => prev.map(loan => 
      loan.id === id ? { ...loan, ...loanData } : loan
    ));
  };

  const deleteLoan = (id: string) => {
    setLoans(prev => prev.filter(loan => loan.id !== id));
  };

  const addTicketRecord = (recordData: Omit<TicketRecord, 'id' | 'createdAt' | 'totalAmount'>) => {
    const newRecord: TicketRecord = {
      ...recordData,
      id: `ticket-${Date.now()}`,
      totalAmount: recordData.moneyPaid + recordData.serviceFee,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setTicketRecords(prev => [newRecord, ...prev]);
  };

  const updateTicketRecord = (id: string, recordData: Partial<TicketRecord>) => {
    setTicketRecords(prev => prev.map(record => {
      if (record.id === id) {
        const updated = { ...record, ...recordData };
        if (recordData.moneyPaid !== undefined || recordData.serviceFee !== undefined) {
          updated.totalAmount = (recordData.moneyPaid ?? record.moneyPaid) + (recordData.serviceFee ?? record.serviceFee);
        }
        return updated;
      }
      return record;
    }));
  };

  const deleteTicketRecord = (id: string) => {
    setTicketRecords(prev => prev.filter(record => record.id !== id));
  };

  return (
    <DataContext.Provider value={{
      loans,
      ticketRecords,
      addLoan,
      updateLoan,
      deleteLoan,
      addTicketRecord,
      updateTicketRecord,
      deleteTicketRecord,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
