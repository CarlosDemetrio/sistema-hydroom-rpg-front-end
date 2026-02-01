import { Component, inject } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CardModule, ButtonModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  private authService = inject(AuthService);

  loginWithGoogle() {
    this.authService.login();
  }
}
