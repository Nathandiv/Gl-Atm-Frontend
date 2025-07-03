import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AccountService } from '../../services/account.service';
import { Account } from '../../models/account.model';

@Component({
  selector: 'app-deposit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './deposit.component.html',
  styleUrls: ['./deposit.component.css']
})
export class DepositComponent implements OnInit {
  currentAccount: Account | null = null;
  amount: number = 0;
  isLoading = false;
  message = '';
  messageType = '';

  constructor(private accountService: AccountService, private router: Router) {}

  ngOnInit() {
    this.currentAccount = this.accountService.getCurrentAccount();
    if (!this.currentAccount) {
      this.router.navigate(['/login']);
    }
  }

  onDeposit() {
    if (!this.currentAccount) return;

    if (!this.amount || this.amount <= 0) {
      this.showMessage('Please enter a valid amount', 'error');
      return;
    }

    this.isLoading = true;
    this.message = '';

    this.accountService.deposit(this.currentAccount.id, this.amount).subscribe({
      next: (response) => {
        this.showMessage('Deposit successful!', 'success');
        this.amount = 0;
        this.isLoading = false;
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 2000);
      },
      error: (error) => {
        this.showMessage('Deposit failed. Please try again.', 'error');
        this.isLoading = false;
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