import { Injectable } from '@angular/core';
import { TranslateService as NgxTranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class TranslateService {
  constructor(private translate: NgxTranslateService) {}

  setLanguage(lang: string) {
    this.translate.use(lang);
  }

  get currentLang() {
    return this.translate.currentLang;
  }
}