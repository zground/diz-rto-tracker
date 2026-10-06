import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AdSlotComponent, AD_SLOTS, isAdSlotConfigured } from '../ad-slot/ad-slot.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, AdSlotComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  readonly adSlot = AD_SLOTS.loginSidebar;
  readonly showAd = isAdSlotConfigured(this.adSlot);
  employeeNo = '';
  password   = '';
  error      = '';
  loading    = false;
  showPass   = false;

  constructor(private auth: AuthService, private router: Router) {}

  submit(): void {
    this.error = '';
    if (!this.employeeNo || !this.password) {
      this.error = 'Please fill in all fields.';
      return;
    }
    this.loading = true;
    this.auth.login({ employeeNo: this.employeeNo, password: this.password }).subscribe({
      next: () => this.router.navigate(['/']),
      error: err => {
        this.error   = err.error?.error ?? 'Login failed. Please try again.';
        this.loading = false;
      },
    });
  }
}
