import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AccountService } from '../../services/account.service';
import { Account, Beneficiary, AddBeneficiaryRequest } from '../../models/account.model';

@Component({
  selector: 'app-beneficiaries',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './beneficiaries.component.html',
  styleUrls: ['./beneficiaries.component.css']
})
export class BeneficiariesComponent implements OnInit {
  currentAccount: Account | null = null;
  beneficiaries: Beneficiary[] = [];
  allAccounts: Account[] = [];
  selectedRecipientId: number = 0;
  isLoading = false;
  message = '';
  messageType = '';
  showAddForm = false;

  constructor(private accountService: AccountService, private router: Router) {}

  ngOnInit() {
    this.currentAccount = this.accountService.getCurrentAccount();
    if (!this.currentAccount) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadBeneficiaries();
    this.loadAllAccounts();
  }

  loadBeneficiaries() {
    this.accountService.getAllBeneficiaries().subscribe({
      next: (beneficiaries) => {
        // Filter beneficiaries where current account is the sender
        this.beneficiaries = beneficiaries.filter(b => b.senderId === this.currentAccount?.id);
      },
      error: (error) => {
        console.error('Error loading beneficiaries:', error);
      }
    });
  }

  loadAllAccounts() {
    this.accountService.getAllAccounts().subscribe({
      next: (accounts) => {
        // Filter out current account
        this.allAccounts = accounts.filter(account => account.id !== this.currentAccount?.id);
      },
      error: (error) => {
        console.error('Error loading accounts:', error);
      }
    });
  }

  getAccountName(accountId: number): string {
    const account = this.allAccounts.find(acc => acc.id === accountId);
    return account ? account.name : `Account ${accountId}`;
  }

  addBeneficiary() {
    if (!this.currentAccount) return;

    if (!this.selectedRecipientId) {
      this.showMessage('Please select a beneficiary', 'error');
      return;
    }

    // Check if beneficiary already exists
    const exists = this.beneficiaries.some(b => b.recipientId === this.selectedRecipientId);
    if (exists) {
      this.showMessage('This beneficiary already exists', 'error');
      return;
    }

    this.isLoading = true;
    this.message = '';

    const request: AddBeneficiaryRequest = {
      senderId: this.currentAccount.id,
      recipientId: this.selectedRecipientId
    };

    this.accountService.addBeneficiary(request).subscribe({
      next: (response) => {
        this.showMessage('Beneficiary added successfully!', 'success');
        this.selectedRecipientId = 0;
        this.showAddForm = false;
        this.loadBeneficiaries();
        this.isLoading = false;
      },
      error: (error) => {
        this.showMessage('Failed to add beneficiary. Please try again.', 'error');
        this.isLoading = false;
      }
    });
  }

  getAvailableAccounts(): Account[] {
    const beneficiaryIds = this.beneficiaries.map(b => b.recipientId);
    return this.allAccounts.filter(account => !beneficiaryIds.includes(account.id));
  }

  transferToBeneficiary(recipientId: number) {
    this.router.navigate(['/transfer'], { queryParams: { recipientId: recipientId } });
  }

  showMessage(text: string, type: string) {
    this.message = text;
    this.messageType = type;
    setTimeout(() => {
      this.message = '';
    }, 5000);
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}