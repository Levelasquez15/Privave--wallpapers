import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth';
import { SupabaseService } from '../../core/services/supabase';

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
    private authService: AuthService,
    private supabaseService: SupabaseService
  ) {}

  ngOnInit() {}

  onProfileClick() {
    this.router.navigate(['/update-user-info'], { state: { fromHome: true } });
  }

  /** Subir un wallpaper */
  async onAddWallpaperClick() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*'; // solo imágenes
    input.click();

    input.onchange = async () => {
      const file = (input.files as FileList)[0];
      if (!file) return;

      try {
        // path único dentro del bucket
        const filePath = `uploads/${Date.now()}-${file.name}`;

        // subir al bucket "wallpapers"
        await this.supabaseService.uploadImage('wallpapers', filePath, file);

        // obtener URL pública
        const publicUrl = this.supabaseService.getPublicUrl('wallpapers', filePath);
        console.log('Imagen subida con éxito. URL pública:', publicUrl);

        this.showSuccess = true;
        setTimeout(() => (this.showSuccess = false), 2000);
      } catch (err) {
        console.error('Error al subir imagen:', err);
      }
    };
  }

  /** Cerrar sesión */
  async onLogoutClick() {
    try {
      await this.authService.logout();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }
}
