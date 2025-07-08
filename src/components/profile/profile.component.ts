import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AccountService } from '../../services/account.service';
import { Account } from '../../models/account.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  currentAccount: Account | null = null;
  editMode = false;
  editedName: string = '';
  message = '';
  messageType = '';

  constructor(private accountService: AccountService, public router: Router) {}

  ngOnInit() {
    this.currentAccount = this.accountService.getCurrentAccount();
    if (!this.currentAccount) {
      this.router.navigate(['/login']);
      return;
    }
    this.editedName = this.currentAccount.name;
  }

  enableEditMode() {
    this.editMode = true;
    this.editedName = this.currentAccount?.name || '';
  }

  cancelEdit() {
    this.editMode = false;
    this.editedName = this.currentAccount?.name || '';
    this.message = '';
  }

saveChanges() {
  if (!this.editedName || this.editedName.trim().length < 2) {
    this.showMessage('Name must be at least 2 characters long', 'error');
    return;
  }

  if (this.currentAccount) {
    const updatedRequest = {
      name: this.editedName.trim()
    };

    this.accountService.updateAccount(this.currentAccount.id, updatedRequest).subscribe({
      next: (updatedAccount) => {
        this.currentAccount = updatedAccount;
        this.accountService.setCurrentAccount(updatedAccount);
        this.editMode = false;
        this.showMessage('Profile updated successfully!', 'success');
      },
      error: (err) => {
        this.showMessage('Failed to update profile', 'error');
        console.error('Update failed:', err);
      }
    });
  }
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