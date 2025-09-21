import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth';
import { SupabaseService } from '../../core/services/supabase';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { ActionSheetController, AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import MyCustomPlugin from '../../core/plugin/myCustomPlugin';
import { ToastService } from 'src/app/core/services/toast';

interface Wallpaper {
  url: string;
  path: string; // ruta real en Supabase (ej: uploads/1234.jpeg)
}

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false
})
export class HomePage implements OnInit {
  showSuccess = false;
  wallpapers: Wallpaper[] = [];

  constructor(
    private router: Router,
    private authService: AuthService,
    private supabaseService: SupabaseService,
    private actionSheetCtrl: ActionSheetController,
    private alertCtrl: AlertController,
    private translate: TranslateService,
    private toast: ToastService
  ) {}

  async ngOnInit() {
    await this.loadWallpapers();
  }

  /** Cargar wallpapers desde Supabase */
  async loadWallpapers() {
    try {
      console.log("📂 Listando archivos en bucket: wallpapers, carpeta: uploads");
      const files = await this.supabaseService.listFiles('wallpapers', 'uploads');

      if (!files) {
        this.wallpapers = [];
        return;
      }

      this.wallpapers = files.map(file => ({
        url: this.supabaseService.getPublicUrl('wallpapers', `uploads/${file.name}`),
        path: `uploads/${file.name}`
      }));

      console.log("✅ Archivos encontrados:", this.wallpapers);
    } catch (err) {
      console.error('❌ Error al cargar wallpapers:', err);
    }
  }

  onProfileClick() {
    this.router.navigate(['/update-user-info'], { state: { fromHome: true } });
  }

  /** Subir nuevo wallpaper */
  async onAddWallpaperClick() {
    if (Capacitor.isNativePlatform()) {
      await this.captureWithCamera();
    } else {
      this.pickFromFileInput();
    }
  }

  private async captureWithCamera() {
    try {
      const image = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Prompt
      });

      const response = await fetch(image.webPath!);
      const blob = await response.blob();
      const filePath = `uploads/${Date.now()}.jpeg`;

      await this.supabaseService.uploadImage('wallpapers', filePath, blob);
      const publicUrl = this.supabaseService.getPublicUrl('wallpapers', filePath);

      this.addWallpaper(publicUrl, filePath);
    } catch (err) {
      console.error('❌ Error al capturar imagen:', err);
    }
  }

  private pickFromFileInput() {
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

        this.addWallpaper(publicUrl, filePath);
      } catch (err) {
        console.error('❌ Error al subir imagen:', err);
      }
    };
  }

  private addWallpaper(url: string, path: string) {
    this.wallpapers.unshift({ url, path });
    this.showSuccess = true;
    setTimeout(() => (this.showSuccess = false), 2000);
  }

  /** Mostrar menú de opciones */
  async onWallpaperClick(wallpaper: Wallpaper) {
    const actionSheet = await this.actionSheetCtrl.create({
      header: this.translate.instant('HOME.OPTIONS'),
      buttons: [
        {
          text: this.translate.instant('HOME.SET_HOME'),
          handler: () => this.onSetWallpaper(wallpaper.url, 'home')
        },
        {
          text: this.translate.instant('HOME.SET_LOCK'),
          handler: () => this.onSetWallpaper(wallpaper.url, 'lock')
        },
        {
          text: this.translate.instant('HOME.SET_BOTH'),
          handler: () => this.onSetWallpaper(wallpaper.url, 'both')
        },
        {
          text: this.translate.instant('HOME.DELETE'),
          role: 'destructive',
          handler: () => this.onDeleteWallpaper(wallpaper)
        },
        {
          text: this.translate.instant('HOME.CANCEL'),
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  /** Cambiar wallpaper */
  /** Cambiar wallpaper */
async onSetWallpaper(url: string, type: 'home' | 'lock' | 'both' = 'home') {
  if (!Capacitor.isNativePlatform()) {
    await this.toast.show(this.translate.instant('ALERTS.ONLY_NATIVE'), 2000, 'warning');
    return;
  }

  console.log('➡️ Llamando plugin setWallpaper', { url, type });

  try {
    const result = await MyCustomPlugin.setWallpaper({ url, type });
    console.log('📌 Respuesta del plugin:', result);

    if (result && result.success) {
      await this.toast.show('✅ Wallpaper aplicado con éxito', 2000, 'success');
    } else {
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: result?.error || 'No se pudo aplicar el wallpaper',
        buttons: ['OK']
      });
      await alert.present();
    }
  } catch (err) {
    console.error('❌ Excepción al llamar plugin:', err);
    const alert = await this.alertCtrl.create({
      header: 'Excepción',
      message: String(err),
      buttons: ['OK']
    });
    await alert.present();
  }
}


  /** Eliminar wallpaper */
  async onDeleteWallpaper(wallpaper: Wallpaper) {
    const alert = await this.alertCtrl.create({
      header: this.translate.instant('HOME.DELETE_CONFIRM_TITLE'),
      message: this.translate.instant('HOME.DELETE_CONFIRM_MSG'),
      buttons: [
        { text: this.translate.instant('HOME.CANCEL'), role: 'cancel' },
        {
          text: this.translate.instant('HOME.DELETE'),
          role: 'destructive',
          handler: async () => {
            try {
              console.log("🗑 Eliminando:", wallpaper.path);
              await this.supabaseService.deleteFile('wallpapers', wallpaper.path);
              console.log("✅ Archivo eliminado correctamente:", wallpaper.path);

              // 🔄 Recargar lista para asegurar que no reaparezca
              await this.loadWallpapers();
            } catch (err) {
              console.error('❌ Error al eliminar wallpaper:', err);
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async onLogoutClick() {
    try {
      await this.authService.logout();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error(this.translate.instant('ALERTS.LOGOUT_ERROR'), error);
    }
  }
}
