import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FloatingButtonComponent } from './floating-button.component';

@NgModule({
  declarations: [FloatingButtonComponent],
  imports: [CommonModule, IonicModule],
  exports: [FloatingButtonComponent]
})
export class FloatingButtonModule {}
