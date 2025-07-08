import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
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

  private handleError(error: HttpErrorResponse) {
    console.error('HTTP Error:', error);
    console.error('Error status:', error.status);
    console.error('Error message:', error.message);
    console.error('Error body:', error.error);
    return throwError(() => error);
  }

  register(request: RegisterRequest): Observable<Account> {
    console.log('Register request:', request);
    return this.http.post<Account>(`${this.baseUrl}/register`, request)
      .pipe(catchError(this.handleError));
  }

  login(loginRequest: LoginRequest): Observable<Account> {
    console.log('Login request:', loginRequest);
    return this.http.post<Account>(`${this.baseUrl}/login`, loginRequest)
      .pipe(catchError(this.handleError));
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
    console.log('Getting all accounts from:', `${this.baseUrl}/accounts`);
    return this.http.get<Account[]>(`${this.baseUrl}/accounts`)
      .pipe(catchError(this.handleError));
  }

  getBalance(accountId: number): Observable<number> {
    console.log('Getting balance for account:', accountId);
    return this.http.get<number>(`${this.baseUrl}/balance/${accountId}`)
      .pipe(catchError(this.handleError));
  }

  deposit(accountId: number, amount: number): Observable<string> {
    const params = new HttpParams()
      .set('accountId', accountId.toString())
      .set('amount', amount.toString());
    console.log('Deposit request - URL:', `${this.baseUrl}/deposit`, 'Params:', params.toString());
    return this.http.post(`${this.baseUrl}/deposit`, null, { params, responseType: 'text' })
      .pipe(catchError(this.handleError));
  }

  withdraw(request: WithdrawRequest): Observable<string> {
    console.log('Withdraw request - URL:', `${this.baseUrl}/withdraw`, 'Body:', request);
    return this.http.post(`${this.baseUrl}/withdraw`, request, { responseType: 'text' })
      .pipe(catchError(this.handleError));
  }

  // Alternative withdraw method using query parameters (in case backend expects params)
  withdrawWithParams(accountId: number, amount: number): Observable<string> {
    const params = new HttpParams()
      .set('accountId', accountId.toString())
      .set('amount', amount.toString());
    console.log('Withdraw with params - URL:', `${this.baseUrl}/withdraw`, 'Params:', params.toString());
    return this.http.post(`${this.baseUrl}/withdraw`, null, { params, responseType: 'text' })
      .pipe(catchError(this.handleError));
  }

  transfer(senderId: number, recipientId: number, amount: number): Observable<string> {
    const params = new HttpParams()
      .set('senderId', senderId.toString())
      .set('recipientId', recipientId.toString())
      .set('amount', amount.toString());
    console.log('Transfer request - URL:', `${this.baseUrl}/transfer`, 'Params:', params.toString());
    return this.http.post(`${this.baseUrl}/transfer`, null, { params, responseType: 'text' })
      .pipe(catchError(this.handleError));
  }

  // Alternative transfer method using request body (in case backend expects body)
  transferWithBody(senderId: number, recipientId: number, amount: number): Observable<string> {
    const body = {
      senderId: senderId,
      recipientId: recipientId,
      amount: amount
    };
    console.log('Transfer with body - URL:', `${this.baseUrl}/transfer`, 'Body:', body);
    return this.http.post(`${this.baseUrl}/transfer`, body, { responseType: 'text' })
      .pipe(catchError(this.handleError));
  }

  addBeneficiary(request: AddBeneficiaryRequest): Observable<string> {
    console.log('Add beneficiary request - URL:', `${this.baseUrl}/beneficiaries`, 'Body:', request);
    return this.http.post(`${this.baseUrl}/beneficiaries`, request, { responseType: 'text' })
      .pipe(catchError(this.handleError));
  }

  deleteBeneficiary(senderId: number, recipientId: number): Observable<string> {
    const params = new HttpParams()
      .set('senderId', senderId.toString())
      .set('recipientId', recipientId.toString());
    console.log('Delete beneficiary request - URL:', `${this.baseUrl}/beneficiaries`, 'Params:', params.toString());
    return this.http.delete(`${this.baseUrl}/beneficiaries`, { params, responseType: 'text' })
      .pipe(catchError(this.handleError));
  }

  getAllBeneficiaries(): Observable<Beneficiary[]> {
    console.log('Getting all beneficiaries from:', `${this.baseUrl}/beneficiaries`);
    return this.http.get<Beneficiary[]>(`${this.baseUrl}/beneficiaries`)
      .pipe(catchError(this.handleError));
  }

  getTransactions(accountId: number): Observable<BankTransaction[]> {
    console.log('Getting transactions for account:', accountId);
    return this.http.get<BankTransaction[]>(`${this.baseUrl}/transactions/${accountId}`)
      .pipe(catchError(this.handleError));
  }
}