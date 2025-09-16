import { Component, OnInit } from '@angular/core';
import { TranslateService } from 'src/app/core/services/translate';

@Component({
  selector: 'app-toggle-translate',
  templateUrl: './toggle-translate.component.html',
  styleUrls: ['./toggle-translate.component.scss'],
  standalone: false
})
export class ToggleTranslateComponent implements OnInit {
  currentLang: string = 'en';

  constructor(private translate: TranslateService) {}

  ngOnInit() {
    this.currentLang = this.translate.currentLang || 'en';
  }

 setLang(lang: string) {
  this.translate.setLanguage(lang);
  this.currentLang = lang;
}
}