import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AccountService } from '../../services/account.service';
import { Account } from '../../models/account.model';

@Component({
  selector: 'app-transfer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transfer.component.html',
  styleUrls: ['./transfer.component.css']
})
export class TransferComponent implements OnInit {
  currentAccount: Account | null = null;
  currentBalance: number = 0;
  recipientId: number = 0;
  amount: number = 0;
  pin: number = 0;
  allAccounts: Account[] = [];
  isLoading = false;
  message = '';
  messageType = '';

  constructor(
    private accountService: AccountService, 
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.currentAccount = this.accountService.getCurrentAccount();
    if (!this.currentAccount) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadBalance();
    this.loadAllAccounts();
    
    // Check if recipientId is passed as query parameter (from beneficiaries page)
    this.route.queryParams.subscribe(params => {
      if (params['recipientId']) {
        this.recipientId = parseInt(params['recipientId'], 10);
      }
    });
  }

  loadBalance() {
    if (this.currentAccount) {
      this.accountService.getBalance(this.currentAccount.id).subscribe({
        next: (balance) => {
          this.currentBalance = balance;
        },
        error: (error) => {
          console.error('Error loading balance:', error);
        }
      });
    }
  }

  loadAllAccounts() {
    this.accountService.getAllAccounts().subscribe({
      next: (accounts) => {
        // Filter out current account from the list
        this.allAccounts = accounts.filter(account => account.id !== this.currentAccount?.id);
      },
      error: (error) => {
        console.error('Error loading accounts:', error);
      }
    });
  }

onTransfer() {
  if (!this.currentAccount) return;

  if (!this.recipientId) {
    this.showMessage('Please select a recipient', 'error');
    return;
  }

  if (!this.amount || this.amount <= 0) {
    this.showMessage('Please enter a valid amount', 'error');
    return;
  }

  if (this.amount > this.currentBalance) {
    this.showMessage('Insufficient funds', 'error');
    return;
  }

  if (this.recipientId === this.currentAccount.id) {
    this.showMessage('Cannot transfer to your own account', 'error');
    return;
  }

  if (!this.pin || this.pin.toString().length !== 4) {
    this.showMessage('Please enter a valid 4-digit PIN', 'error');
    return;
  }

  this.isLoading = true;
  this.message = '';

  console.log('Transfer request:', {
    senderId: this.currentAccount.id,
    recipientId: this.recipientId,
    amount: this.amount,
    pin: this.pin
  });

  this.accountService.transfer(
    this.currentAccount.id,
    this.recipientId,
    this.amount,
    this.pin // ✅ Include the required 4th argument
  ).subscribe({
    next: (response) => {
      console.log('Transfer response:', response);
      this.showMessage('Transfer successful!', 'success');
      this.amount = 0;
      this.recipientId = 0;
      this.pin = 0;
      this.loadBalance();
      this.isLoading = false;
      setTimeout(() => {
        this.router.navigate(['/dashboard']);
      }, 2000);
    },
    error: (error) => {
      console.error('Transfer error:', error);
      this.showMessage('Transfer failed. Please try again.', 'error');
      this.isLoading = false;
    }
  });
}


  getRecipientName(): string {
    const recipient = this.allAccounts.find(account => account.id === this.recipientId);
    return recipient ? recipient.name : '';
  }

  showMessage(text: string, type: string) {
    this.message = text;
    this.messageType = type;
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}