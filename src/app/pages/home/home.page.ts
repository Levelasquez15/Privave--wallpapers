import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth';
import { SupabaseService } from '../../core/services/supabase';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false
})
export class HomePage implements OnInit {
  showSuccess = false;
  wallpapers: string[] = [];

  constructor(
    private router: Router,
    private authService: AuthService,
    private supabaseService: SupabaseService
  ) {}

  async ngOnInit() {
    await this.loadWallpapers();
  }

  /** Cargar wallpapers del bucket */
  async loadWallpapers() {
    try {
      const files = await this.supabaseService.listFiles('wallpapers', 'uploads');
      this.wallpapers = files.map(file =>
        this.supabaseService.getPublicUrl('wallpapers', `uploads/${file.name}`)
      );
    } catch (err) {
      console.error('Error al cargar wallpapers:', err);
    }
  }

  onProfileClick() {
    this.router.navigate(['/update-user-info'], { state: { fromHome: true } });
  }

  /** Subir wallpaper desde cámara o galería (móvil) o input file (web) */
  async onAddWallpaperClick() {
    if (Capacitor.isNativePlatform()) {
      try {
        const image = await Camera.getPhoto({
          quality: 80,
          allowEditing: false,
          resultType: CameraResultType.Uri,
          source: CameraSource.Prompt // 👉 Muestra opción Cámara o Galería
        });

        const response = await fetch(image.webPath!);
        const blob = await response.blob();
        const fileName = `uploads/${Date.now()}.jpeg`;

        await this.supabaseService.uploadImage('wallpapers', fileName, blob);
        const publicUrl = this.supabaseService.getPublicUrl('wallpapers', fileName);

        this.wallpapers.unshift(publicUrl);
        this.showSuccess = true;
        setTimeout(() => (this.showSuccess = false), 2000);
      } catch (err) {
        console.error('Error al capturar imagen:', err);
      }
    } else {
      // 💻 Web → input file
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.click();

      input.onchange = async () => {
        const file = (input.files as FileList)[0];
        if (!file) return;

        try {
          const filePath = `uploads/${Date.now()}-${file.name}`;
          await this.supabaseService.uploadImage('wallpapers', filePath, file);
          const publicUrl = this.supabaseService.getPublicUrl('wallpapers', filePath);

          this.wallpapers.unshift(publicUrl);
          this.showSuccess = true;
          setTimeout(() => (this.showSuccess = false), 2000);
        } catch (err) {
          console.error('Error al subir imagen:', err);
        }
      };
    }
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
