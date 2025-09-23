import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { onAuthStateChanged, deleteUser } from 'firebase/auth';
import { AuthService } from 'src/app/core/services/auth';
import { Query } from 'src/app/core/services/query';
import { AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-update-user-info',
  templateUrl: './update-user-info.page.html',
  styleUrls: ['./update-user-info.page.scss'],
  standalone: false
})
export class UpdateUserInfoPage implements OnInit, OnDestroy {
  profileForm!: FormGroup;
  errorMsg: string = '';
  successMsg: string = '';
  private unsubscribeAuth?: () => void;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private query: Query,
    private router: Router,
    private ngAuth: Auth,
    private alertController: AlertController,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      lastName: ['', Validators.required],
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]] // 🔹 email solo lectura
    });

    this.unsubscribeAuth = onAuthStateChanged(this.ngAuth, async (user) => {
      if (user) {
        let userDoc = await this.query.getUser(user.uid);
        console.log('📌 Documento Firestore:', userDoc);

        if (userDoc) {
          this.profileForm.patchValue({
            name: userDoc['name'] ?? '',
            lastName: userDoc['lastName'] ?? userDoc['lastname'] ?? '',
            email: user.email ?? userDoc['email'] ?? ''
          });

          // 🔹 Corrige email si no coincide
          if (user.email && userDoc['email'] !== user.email) {
            await this.query.updateUser({ uid: user.uid, email: user.email });
          }
        } else {
          const userData = {
            name: '',
            lastName: '',
            email: user.email ?? '',
            uid: user.uid
          };
          await this.query.create('users', userData);

          userDoc = await this.query.getUser(user.uid);
          this.profileForm.patchValue({
            name: userDoc?.['name'] ?? '',
            lastName: userDoc?.['lastName'] ?? userDoc?.['lastname'] ?? '',
            email: user.email ?? userDoc?.['email'] ?? ''
          });
        }

        if (this.unsubscribeAuth) {
          this.unsubscribeAuth();
          this.unsubscribeAuth = undefined;
        }
      }
    });
  }

  ngOnDestroy() {
    if (this.unsubscribeAuth) {
      this.unsubscribeAuth();
    }
  }

  async onUpdate() {
    const { name, lastName } = this.profileForm.getRawValue(); // 🔹 getRawValue para leer email aunque esté disabled

    try {
      const user = this.ngAuth.currentUser;

      if (user) {
        const userData = {
          name,
          lastName,
          email: user.email, // 🔹 siempre usamos el email real
          uid: user.uid
        };
        await this.query.updateUser(userData);
      }

      this.errorMsg = '';
      this.successMsg = this.translate.instant('PROFILE.UPDATE_SUCCESS');
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => {
        this.successMsg = '';
      }, 3000);
    } catch (err: any) {
      console.error(err);
      this.errorMsg = err.message || this.translate.instant('PROFILE.UPDATE_ERROR');
    }
  }

  goHome() {
    this.router.navigate(['/home']);
  }

  async onDeleteAccount() {
    const alert = await this.alertController.create({
      header: this.translate.instant('PROFILE.DELETE_CONFIRM_TITLE'),
      message: this.translate.instant('PROFILE.DELETE_CONFIRM_MESSAGE'),
      buttons: [
        {
          text: this.translate.instant('PROFILE.CANCEL'),
          role: 'cancel'
        },
        {
          text: this.translate.instant('PROFILE.DELETE'),
          role: 'destructive',
          handler: async () => {
            try {
              const user = this.ngAuth.currentUser;
              if (user) {
                await this.query.deleteUser(user.uid);
                await deleteUser(user);
                await this.auth.logout();
                this.router.navigate(['/login']);
              }
            } catch (err: any) {
              console.error(err);
              this.errorMsg = err.message || this.translate.instant('PROFILE.DELETE_ERROR');
            }
          }
        }
      ]
    });

    await alert.present();
  }
}