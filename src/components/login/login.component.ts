import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AccountService } from '../../services/account.service';
import { LoginRequest } from '../../models/account.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  pin: number = 0;
  isLoading = false;
  errorMessage = '';

  constructor(private accountService: AccountService, private router: Router) {}

  onLogin() {
    if (!this.pin || this.pin.toString().length !== 4) {
      this.errorMessage = 'Please enter a valid 4-digit PIN';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const loginRequest: LoginRequest = { pin: this.pin };

    this.accountService.login(loginRequest).subscribe({
      next: (account) => {
        this.accountService.setCurrentAccount(account);
        this.router.navigate(['/dashboard']);
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Invalid PIN. Please try again.';
        this.isLoading = false;
      }
    });
  }

  navigateToRegister() {
    this.router.navigate(['/register']);
  }
}