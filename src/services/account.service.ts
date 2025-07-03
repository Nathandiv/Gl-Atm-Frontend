import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Account, LoginRequest, RegisterRequest, WithdrawRequest, AddBeneficiaryRequest, Beneficiary, BankTransaction } from '../models/account.model';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private baseUrl = 'http://localhost:8080/api';
  private currentAccountSubject = new BehaviorSubject<Account | null>(null);
  public currentAccount$ = this.currentAccountSubject.asObservable();

  constructor(private http: HttpClient) {
    // Load current account from localStorage if available
    const savedAccount = localStorage.getItem('currentAccount');
    if (savedAccount) {
      this.currentAccountSubject.next(JSON.parse(savedAccount));
    }
  }

  register(request: RegisterRequest): Observable<Account> {
    return this.http.post<Account>(`${this.baseUrl}/register`, request);
  }

  login(loginRequest: LoginRequest): Observable<Account> {
    return this.http.post<Account>(`${this.baseUrl}/login`, loginRequest);
  }

  setCurrentAccount(account: Account): void {
    this.currentAccountSubject.next(account);
    localStorage.setItem('currentAccount', JSON.stringify(account));
  }

  getCurrentAccount(): Account | null {
    return this.currentAccountSubject.value;
  }

  logout(): void {
    this.currentAccountSubject.next(null);
    localStorage.removeItem('currentAccount');
  }

  getAllAccounts(): Observable<Account[]> {
    return this.http.get<Account[]>(`${this.baseUrl}/accounts`);
  }

  getBalance(accountId: number): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/balance/${accountId}`);
  }

  deposit(accountId: number, amount: number): Observable<string> {
    const params = new HttpParams()
      .set('accountId', accountId.toString())
      .set('amount', amount.toString());
    return this.http.post<string>(`${this.baseUrl}/deposit`, null, { params });
  }

  withdraw(request: WithdrawRequest): Observable<string> {
    return this.http.post<string>(`${this.baseUrl}/withdraw`, request);
  }

  transfer(senderId: number, recipientId: number, amount: number): Observable<string> {
    const params = new HttpParams()
      .set('senderId', senderId.toString())
      .set('recipientId', recipientId.toString())
      .set('amount', amount.toString());
    return this.http.post<string>(`${this.baseUrl}/transfer`, null, { params });
  }

  addBeneficiary(request: AddBeneficiaryRequest): Observable<string> {
    return this.http.post<string>(`${this.baseUrl}/beneficiaries`, request);
  }

  getAllBeneficiaries(): Observable<Beneficiary[]> {
    return this.http.get<Beneficiary[]>(`${this.baseUrl}/beneficiaries`);
  }

  getTransactions(accountId: number): Observable<BankTransaction[]> {
    return this.http.get<BankTransaction[]>(`${this.baseUrl}/transactions/${accountId}`);
  }
}