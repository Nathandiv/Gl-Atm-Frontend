import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AccountService } from '../../services/account.service';
import { Account, WithdrawRequest } from '../../models/account.model';

@Component({
  selector: 'app-withdraw',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './withdraw.component.html',
  styleUrls: ['./withdraw.component.css']
})
export class WithdrawComponent implements OnInit {
  currentAccount: Account | null = null;
  currentBalance: number = 0;
  amount: number = 0;
  pin: number = 0;
  isLoading = false;
  message = '';
  messageType = '';

  constructor(private accountService: AccountService, private router: Router) {}

  ngOnInit() {
    this.currentAccount = this.accountService.getCurrentAccount();
    if (!this.currentAccount) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadBalance();
  }

  loadBalance() {
    if (this.currentAccount) {
      this.accountService.getBalance(this.currentAccount.id).subscribe({
        next: (balance) => {
          this.currentBalance = balance;
          console.log('Current balance loaded:', balance);
        },
        error: (error) => {
          console.error('Error loading balance:', error);
        }
      });
    }
  }

  onWithdraw() {
    if (!this.currentAccount) return;

    if (!this.amount || this.amount <= 0) {
      this.showMessage('Please enter a valid amount', 'error');
      return;
    }

    if (this.amount > this.currentBalance) {
      this.showMessage('Insufficient funds', 'error');
      return;
    }

    this.isLoading = true;
    this.message = '';
const withdrawRequest: WithdrawRequest = {
  accountId: this.currentAccount.id,
  amount: this.amount,
  pin: this.pin 
};

    console.log('Withdraw request:', withdrawRequest);
    console.log('Attempting withdraw with request body...');

    // First try with request body
    this.accountService.withdraw(withdrawRequest).subscribe({
      next: (response) => {
        console.log('Withdraw response:', response);
        this.showMessage('Withdrawal successful!', 'success');
        this.amount = 0;
        this.loadBalance(); // Reload balance to show updated amount
        this.isLoading = false;
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 2000);
      },
      error: (error) => {
        console.error('Withdraw with body failed:', error);
        console.log('Trying withdraw with query parameters...');
        
        // If body method fails, try with query parameters
        this.accountService.withdrawWithParams(this.currentAccount!.id, this.amount).subscribe({
          next: (response) => {
            console.log('Withdraw with params response:', response);
            this.showMessage('Withdrawal successful!', 'success');
            this.amount = 0;
            this.loadBalance();
            this.isLoading = false;
            setTimeout(() => {
              this.router.navigate(['/dashboard']);
            }, 2000);
          },
          error: (paramError) => {
            console.error('Withdraw with params also failed:', paramError);
            this.showMessage('Withdrawal failed. Please check your backend connection.', 'error');
            this.isLoading = false;
          }
        });
      }
    });
  }

  showMessage(text: string, type: string) {
    this.message = text;
    this.messageType = type;
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}