import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth';
import { UploaderService } from '../../core/services/uploader'; // ✅ reemplazo de SupabaseService
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { ActionSheetController, AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import MyCustomPlugin from '../../core/plugin/myCustomPlugin';
import { ToastService } from 'src/app/core/services/toast';
import { User } from 'firebase/auth';

interface Wallpaper {
  url: string;
  path: string;
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
  private uid: string | null = null;

  constructor(
    private router: Router,
    private authService: AuthService,
    private uploaderService: UploaderService, // ✅ cambio principal
    private actionSheetCtrl: ActionSheetController,
    private alertCtrl: AlertController,
    private translate: TranslateService,
    private toast: ToastService
  ) {}

  async ngOnInit() {
    const user: User | null = await this.authService.getCurrentUser();

    if (!user) {
      console.warn("⚠️ No hay usuario autenticado, redirigiendo al login");
      this.router.navigate(['/login']);
      return;
    }

    this.uid = user.uid;
    await this.loadWallpapers();
  }

  /** Cargar wallpapers del usuario actual */
  async loadWallpapers() {
    try {
      this.wallpapers = await this.uploaderService.getUserWallpapers();
      console.log("✅ Wallpapers cargados:", this.wallpapers);
    } catch (err) {
      console.error('❌ Error al cargar wallpapers:', err);
      this.wallpapers = [];
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

  /** Captura desde cámara o galería */
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

      // ✅ usar uploaderService
      const result = await this.uploaderService.uploadWallpaper(blob);
      this.addWallpaper(result.url, result.path);
    } catch (err) {
      console.error('❌ Error al capturar imagen:', err);
      await this.toast.show('Error al subir imagen', 3000, 'danger');
    }
  }

  /** Subir desde input file */
  private pickFromFileInput() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.click();

    input.onchange = async () => {
      const file = (input.files as FileList)[0];
      if (!file) return;

      try {
        const result = await this.uploaderService.uploadWallpaper(file, file.name);
        this.addWallpaper(result.url, result.path);
      } catch (err) {
        console.error('❌ Error al subir imagen:', err);
        await this.toast.show('Error al subir imagen', 3000, 'danger');
      }
    };
  }

  private addWallpaper(url: string, path: string) {
    this.wallpapers.unshift({ url, path });
    this.showSuccess = true;
    setTimeout(() => (this.showSuccess = false), 2000);
  }

  /** Menú de opciones */
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
        await this.toast.show(this.translate.instant('ALERTS.WALLPAPER_SUCCESS'), 2000, 'success');
      } else {
        const alert = await this.alertCtrl.create({
          header: this.translate.instant('COMMON.ERROR'),
          message: result?.error || this.translate.instant('ALERTS.WALLPAPER_ERROR'),
          buttons: ['OK']
        });
        await alert.present();
      }
    } catch (err) {
      console.error('❌ Excepción al llamar plugin:', err);
      const alert = await this.alertCtrl.create({
        header: this.translate.instant('COMMON.ERROR'),
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
              await this.uploaderService.deleteWallpaper(wallpaper.path);
              await this.loadWallpapers();
            } catch (err) {
              console.error('❌ Error al eliminar wallpaper:', err);
              await this.toast.show('Error al eliminar wallpaper', 3000, 'danger');
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
