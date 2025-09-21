import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth';
import { SupabaseService } from '../../core/services/supabase';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { ActionSheetController, AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import MyCustomPlugin from '../../core/plugin/myCustomPlugin';

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
    private supabaseService: SupabaseService,
    private actionSheetCtrl: ActionSheetController,
    private alertCtrl: AlertController,
    private translate: TranslateService   
  ) {}

  async ngOnInit() {
    await this.loadWallpapers();
  }

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

  async onAddWallpaperClick() {
    if (Capacitor.isNativePlatform()) {
      try {
        const image = await Camera.getPhoto({
          quality: 80,
          allowEditing: false,
          resultType: CameraResultType.Uri,
          source: CameraSource.Prompt
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

  /** Mostrar opciones */
  async onWallpaperClick(url: string) {
    const actionSheet = await this.actionSheetCtrl.create({
      header: this.translate.instant('HOME.OPTIONS'),
      buttons: [
        {
          text: this.translate.instant('HOME.SET_HOME'),
          handler: () => this.onSetWallpaper(url, 'home')
        },
        {
          text: this.translate.instant('HOME.SET_LOCK'),
          handler: () => this.onSetWallpaper(url, 'lock')
        },
        {
          text: this.translate.instant('HOME.SET_BOTH'),
          handler: () => this.onSetWallpaper(url, 'both')
        },
        {
          text: this.translate.instant('HOME.DELETE'),
          role: 'destructive',
          handler: () => this.onDeleteWallpaper(url)
        },
        {
          text: this.translate.instant('HOME.CANCEL'),
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  async onSetWallpaper(url: string, type: 'home' | 'lock' | 'both' = 'home') {
    if (!Capacitor.isNativePlatform()) {
      alert(this.translate.instant('ALERTS.ONLY_NATIVE')); 
      return;
    }

    try {
      const result = await MyCustomPlugin.setWallpaper({ url, type });
      if (result.success) {
        console.log('Wallpaper cambiado con éxito');
      } else {
        console.error('Error al cambiar wallpaper:', result.error);
      }
    } catch (err) {
      console.error('Excepción al cambiar wallpaper:', err);
    }
  }

  async onDeleteWallpaper(url: string) {
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
              const filePath = url.split('/').slice(-2).join('/');
              await this.supabaseService.deleteFile('wallpapers', filePath);
              this.wallpapers = this.wallpapers.filter(w => w !== url);
            } catch (err) {
              console.error('Error al eliminar wallpaper:', err);
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
