import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false
})
export class HomePage implements OnInit {
  showSuccess = false;

  constructor(private router: Router) { }

  ngOnInit() {}

  onProfileClick() {
    // Navegar a la página de actualización de usuario
    this.router.navigate(['/update-user-info']);
  }

  onAddWallpaperClick() {
    // Acción para agregar fondo
    this.showSuccess = true;
    setTimeout(() => this.showSuccess = false, 2000);
  }

  onLogoutClick() {
    // Acción para desloguear
  }
}
