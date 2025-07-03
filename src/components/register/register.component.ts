import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AccountService } from '../../services/account.service';
import { RegisterRequest } from '../../models/account.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  name: string = '';
  pin: number = 0;
  confirmPin: number = 0;
  initialBalance: number = 0;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(private accountService: AccountService, private router: Router) {}

  onRegister() {
    if (!this.name || this.name.trim().length < 2) {
      this.errorMessage = 'Name must be at least 2 characters long';
      return;
    }

    if (!this.pin || this.pin.toString().length !== 4) {
      this.errorMessage = 'PIN must be exactly 4 digits';
      return;
    }

    if (this.pin !== this.confirmPin) {
      this.errorMessage = 'PINs do not match';
      return;
    }

    if (this.initialBalance < 0) {
      this.errorMessage = 'Initial balance cannot be negative';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const registerRequest: RegisterRequest = {
      name: this.name.trim(),
      pin: this.pin,
      initialBalance: this.initialBalance
    };

    this.accountService.register(registerRequest).subscribe({
      next: (account) => {
        this.successMessage = 'Account created successfully!';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to create account. Please try again.';
        this.isLoading = false;
      }
    });
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}