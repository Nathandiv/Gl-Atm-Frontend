import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AccountService } from '../../services/account.service';
import { Account } from '../../models/account.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  currentAccount: Account | null = null;
  currentBalance: number = 0;

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
        },
        error: (error) => {
          console.error('Error loading balance:', error);
        }
      });
    }
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }

  logout() {
    this.accountService.logout();
    this.router.navigate(['/login']);
  }
}