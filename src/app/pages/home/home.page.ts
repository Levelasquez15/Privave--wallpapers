import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth'; // <-- importa tu servicio de auth

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false
})
export class HomePage implements OnInit {
  showSuccess = false;

  constructor(
    private router: Router,
     private authService: AuthService, // <-- inyecta el servicio
  ) { }

  ngOnInit() {}

  onProfileClick() {
    this.router.navigate(['/update-user-info']);
  }

  onAddWallpaperClick() {
    this.showSuccess = true;
    setTimeout(() => this.showSuccess = false, 2000);
  }

  // 👇 aquí ya es async
  async onLogoutClick() {
    try {
      await this.authService.logout(); // <-- usa el servicio de logout
      this.router.navigate(['/login']); // redirige al login
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }
}
