import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageSelectorComponent } from '../language-selector/language-selector';
import { TextAreaComponent } from '../text-area/text-area';
import { TranslationService, Language, TranslateRequest } from '../../services/translation/translation.service';

@Component({
  selector: 'app-translator-container',
  standalone: true,
  imports: [CommonModule, LanguageSelectorComponent, TextAreaComponent],
  template: `
    <div class="translator-app">
      <header class="app-header">
        <h1>Lingua<span>Sync</span></h1>
        <p>Dynamic custom backend translator</p>
      </header>

      <div class="main-container">
        <!-- Error Bar -->
        <div *ngIf="error" class="error-banner glass-panel">
          {{ error }}
          <button (click)="error = null" class="close-btn">&times;</button>
        </div>

        <div class="panels-grid">
          <!-- Source Panel -->
          <div class="panel">
            <div class="panel-header">
              <app-language-selector 
                [languages]="languages" 
                [selected]="sourceLang"
                (languageChange)="onSourceLangChange($event)">
              </app-language-selector>
            </div>
            <app-text-area 
              [placeholder]="'Type text to translate...'"
              (valueChange)="onSourceTextChange($event)">
            </app-text-area>
          </div>

          <!-- Target Panel -->
          <div class="panel">
            <div class="panel-header">
              <app-language-selector 
                [languages]="languages" 
                [selected]="targetLang"
                (languageChange)="onTargetLangChange($event)">
              </app-language-selector>
            </div>
            <app-text-area 
              [value]="translatedText"
              [readonly]="true"
              [loading]="isTranslating"
              [placeholder]="'Translation will appear here...'">
            </app-text-area>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .translator-app {
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 20px;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .app-header {
      text-align: center;
      margin-bottom: 40px;
    }

    .app-header h1 {
      font-size: 3rem;
      font-weight: 800;
      margin: 0 0 10px 0;
      letter-spacing: -1px;
    }

    .app-header h1 span {
      color: var(--accent);
    }

    .app-header p {
      color: var(--text-muted);
      font-size: 1.1rem;
      margin: 0;
    }

    .main-container {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .error-banner {
      background: rgba(255, 123, 114, 0.1);
      border-color: rgba(255, 123, 114, 0.2);
      color: var(--error);
      padding: 12px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .close-btn {
      background: transparent;
      border: none;
      color: var(--error);
      font-size: 1.5rem;
      cursor: pointer;
    }

    .panels-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      width: 100%;
    }

    @media (max-width: 768px) {
      .panels-grid {
        grid-template-columns: 1fr;
      }
    }

    .panel {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .panel-header {
      width: 100%;
    }
  `]
})
export class TranslatorContainerComponent implements OnInit {
  languages: Language[] = [];
  sourceLang: string = 'en';
  targetLang: string = 'ar';
  
  sourceText: string = '';
  translatedText: string = '';
  
  isTranslating: boolean = false;
  error: string | null = null;

  constructor(private translationService: TranslationService) {}

  ngOnInit() {
    this.fetchLanguages();
  }

  fetchLanguages() {
    this.translationService.getLanguages().subscribe({
      next: (langs) => {
        this.languages = langs;
        if (langs.length > 0) {
          // If default not found, pick first
          if (!langs.find(l => l.code === this.sourceLang)) {
            this.sourceLang = langs[0].code;
          }
          if (!langs.find(l => l.code === this.targetLang) && langs.length > 1) {
            this.targetLang = langs.find(l => l.code !== this.sourceLang)?.code || langs[0].code;
          }
        }
      },
      error: (err) => {
        this.error = "Could not connect to translation server. Is backend running?";
        console.error(err);
      }
    });
  }

  onSourceLangChange(lang: string) {
    this.sourceLang = lang;
    this.triggerTranslation();
  }

  onTargetLangChange(lang: string) {
    this.targetLang = lang;
    this.triggerTranslation();
  }

  onSourceTextChange(text: string) {
    this.sourceText = text;
    this.triggerTranslation();
  }

  triggerTranslation() {
    if (!this.sourceText.trim()) {
      this.translatedText = '';
      return;
    }

    this.isTranslating = true;
    this.error = null;

    const req: TranslateRequest = {
      q: this.sourceText,
      source: this.sourceLang,
      target: this.targetLang
    };

    this.translationService.translate(req).subscribe({
      next: (result) => {
        this.translatedText = result;
        this.isTranslating = false;
      },
      error: (err) => {
        this.error = "Translation failed.";
        this.isTranslating = false;
        console.error(err);
      }
    });
  }
}
