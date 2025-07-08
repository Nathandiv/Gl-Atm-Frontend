import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AccountService } from '../../services/account.service';
import { Account, BankTransaction } from '../../models/account.model';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.css']
})
export class TransactionsComponent implements OnInit {
  currentAccount: Account | null = null;
  transactions: BankTransaction[] = [];
  isLoading = true;

  constructor(private accountService: AccountService, private router: Router) {}

  ngOnInit() {
    this.currentAccount = this.accountService.getCurrentAccount();
    if (!this.currentAccount) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadTransactions();
  }

  loadTransactions() {
    if (this.currentAccount) {
      this.accountService.getTransactions(this.currentAccount.id).subscribe({
        next: (transactions) => {
          this.transactions = transactions.sort((a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading transactions:', error);
          this.isLoading = false;
        }
      });
    }
  }

  getTransactionIcon(type: string): string {
    switch (type.toLowerCase()) {
      case 'deposit': return '💰';
      case 'withdrawal': return '💸';
      case 'transfer_out': return '📤';
      case 'transfer_in': return '📥';
      default: return '💳';
    }
  }

  getTransactionClass(type: string): string {
    switch (type.toLowerCase()) {
      case 'deposit':
      case 'transfer_in':
        return 'credit';
      case 'withdrawal':
      case 'transfer_out':
        return 'debit';
      default:
        return 'neutral';
    }
  }

  formatDate(timestamp: string): string {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}
