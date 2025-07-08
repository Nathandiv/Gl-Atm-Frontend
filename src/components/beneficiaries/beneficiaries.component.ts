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

  ngOnInit(): void {
    this.currentAccount = this.accountService.getCurrentAccount();
    if (!this.currentAccount) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadBeneficiaries();
    this.loadAllAccounts();
  }

  loadBeneficiaries(): void {
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

  loadAllAccounts(): void {
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

  addBeneficiary(): void {
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
        console.error('Add beneficiary error:', error);
        this.showMessage('Failed to add beneficiary. Please try again.', 'error');
        this.isLoading = false;
      }
    });
  }

  deleteBeneficiary(recipientId: number): void {
    if (!this.currentAccount) return;

    if (confirm('Are you sure you want to delete this beneficiary?')) {
      this.accountService.deleteBeneficiary(this.currentAccount.id, recipientId).subscribe({
        next: (response) => {
          this.showMessage('Beneficiary deleted successfully!', 'success');
          this.loadBeneficiaries();
        },
        error: (error) => {
          console.error('Delete beneficiary error:', error);
          this.showMessage('Failed to delete beneficiary. Please try again.', 'error');
        }
      });
    }
  }

  getAvailableAccounts(): Account[] {
    const beneficiaryIds = this.beneficiaries.map(b => b.recipientId);
    return this.allAccounts.filter(account => !beneficiaryIds.includes(account.id));
  }

  transferToBeneficiary(recipientId: number): void {
    this.router.navigate(['/transfer'], { queryParams: { recipientId: recipientId } });
  }

  showMessage(text: string, type: string): void {
    this.message = text;
    this.messageType = type;
    setTimeout(() => {
      this.message = '';
    }, 5000);
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}