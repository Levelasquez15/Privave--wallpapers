import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Importa tus componentes
import { InputComponent } from './components/input/input.component';
import { ButtonComponent } from './components/button/button.component';
import { LinkComponent } from './components/link/link.component';
import { ToggleTranslateComponent } from './components/toggle-translate/toggle-translate.component';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { CoreModule } from '../core/core-module';
import { TranslateModule } from '@ngx-translate/core';


@NgModule({
  declarations: [
    InputComponent,
    ButtonComponent,
    LinkComponent,
    ToggleTranslateComponent,
   
  ],
  imports: [
    CommonModule,
    IonicModule,
    RouterModule,
    TranslateModule
  ],
  exports: [
    InputComponent,
    ButtonComponent,
    LinkComponent,
    ToggleTranslateComponent,
    TranslateModule
    
  ]
})
export class SharedModule { }