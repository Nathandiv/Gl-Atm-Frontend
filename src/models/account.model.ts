export interface Account {
  id: number;
  name: string;
  pin: number;
  balance: number;
}

export interface LoginRequest {
  pin: number;
}

export interface RegisterRequest {
  name: string;
  pin: number;
  initialBalance: number;
}

export interface WithdrawRequest {
  accountId: number;
  amount: number;
  pin: number;
}

export interface AddBeneficiaryRequest {
  senderId: number;
  recipientId: number;
}

export interface Beneficiary {
  senderId: number;
  recipientId: number;
}

export interface UpdateRequest {
  name?: string;
  pin?: number;
  balance?: number;
}

export interface BankTransaction {
  id: number;
  account: Account;
  type: string;
  amount: number;
  balanceAfter: number;
  timestamp: string;
}