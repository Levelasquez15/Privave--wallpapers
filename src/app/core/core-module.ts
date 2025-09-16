import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

@NgModule({
  imports: [
    HttpClientModule,
    TranslateModule.forRoot()
  ],
  providers: [
    provideTranslateHttpLoader() // <-- agrega este provider
  ],
  exports: [TranslateModule]
})
export class CoreModule {}