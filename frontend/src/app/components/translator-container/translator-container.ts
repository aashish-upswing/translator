import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslationService, Language, TranslateRequest } from '../../services/translation/translation.service';
import { Subject, debounceTime, distinctUntilChanged, switchMap, of, catchError } from 'rxjs';

@Component({
  selector: 'app-translator-container',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="app-shell">
      <!-- Header -->
      <header class="header">
        <div class="logo">
          <div class="logo-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="url(#grad)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#6366f1"/><stop offset="100%" style="stop-color:#a78bfa"/></linearGradient></defs>
              <path d="M5 8l6 6M4 14l6-6 2-3M2 5h12M7 2h1M22 22l-5-10-5 10M14 18h6"/>
            </svg>
          </div>
          <div class="logo-text">
            <h1>Lingua<span>Sync</span></h1>
            <p class="tagline">Neural Machine Translation</p>
          </div>
        </div>
        <div class="header-badge">
          <span class="status-dot" [class.online]="!error"></span>
          {{ error ? 'Offline' : languages.length + ' languages' }}
        </div>
      </header>

      <!-- Error Bar -->
      <div *ngIf="error" class="error-bar" (click)="error = null">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
        <span>{{ error }}</span>
      </div>

      <!-- Main Translator Card -->
      <div class="translator-card glass-panel">

        <!-- Language Bar -->
        <div class="lang-bar">
          <div class="lang-selector">
            <select [(ngModel)]="sourceLang" (ngModelChange)="onSourceLangChange($event)">
              <option *ngFor="let lang of languages" [value]="lang.code">{{ lang.name }}</option>
            </select>
          </div>

          <button class="swap-btn" (click)="swapLangs()" [disabled]="isTranslating" title="Swap languages">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/>
              <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
            </svg>
          </button>

          <div class="lang-selector">
            <select [(ngModel)]="targetLang" (ngModelChange)="onTargetLangChange($event)">
              <option *ngFor="let lang of languages" [value]="lang.code">{{ lang.name }}</option>
            </select>
          </div>
        </div>

        <!-- Translator Panels -->
        <div class="panels">
          <!-- Source -->
          <div class="panel source-panel">
            <textarea
              [(ngModel)]="sourceText"
              (ngModelChange)="onSourceTextInput($event)"
              placeholder="Type or paste text here..."
              class="text-input"
              id="source-textarea"
              spellcheck="false">
            </textarea>
            <div class="panel-footer">
              <span class="char-count">{{ sourceText.length }} chars</span>
              <div class="panel-actions">
                <button class="icon-btn" (click)="clearSource()" title="Clear" *ngIf="sourceText.length > 0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            </div>
          </div>

          <div class="divider">
            <div class="divider-line"></div>
          </div>

          <!-- Target -->
          <div class="panel target-panel">
            <div class="text-output" id="target-textarea">
              <span *ngIf="!translatedText && !isTranslating" class="placeholder-text">Translation will appear here...</span>
              <span *ngIf="isTranslating && !translatedText" class="translating-indicator">
                <span class="wave-dot"></span>
                <span class="wave-dot"></span>
                <span class="wave-dot"></span>
              </span>
              <span *ngIf="translatedText" class="translated-text" [class.fade-in]="translatedText">{{ translatedText }}</span>
            </div>
            <div class="panel-footer">
              <span class="char-count" *ngIf="translatedText">{{ translatedText.length }} chars</span>
              <span class="char-count" *ngIf="!translatedText">&nbsp;</span>
              <div class="panel-actions">
                <button class="icon-btn" (click)="copyTranslation()" title="Copy" *ngIf="translatedText">
                  <svg *ngIf="!copied" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  <svg *ngIf="copied" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <footer class="footer">
        <p>Powered by <strong>CTranslate2</strong> · Argos Models · gRPC + FastAPI</p>
      </footer>
    </div>
  `,
  styles: [`
    .app-shell {
      position: relative;
      z-index: 1;
      max-width: 920px;
      margin: 0 auto;
      padding: 32px 20px;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    /* Header */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 4px;
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .logo-icon {
      width: 44px;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(99, 102, 241, 0.1);
      border-radius: var(--radius-md);
      border: 1px solid rgba(99, 102, 241, 0.15);
    }
    .logo-text h1 {
      font-size: 1.5rem;
      font-weight: 800;
      letter-spacing: -0.5px;
      line-height: 1.1;
    }
    .logo-text h1 span {
      background: linear-gradient(135deg, var(--accent-start), var(--accent-end));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .tagline {
      font-size: 0.75rem;
      color: var(--text-muted);
      font-weight: 400;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .header-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 14px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 100px;
      font-size: 0.8rem;
      color: var(--text-secondary);
      font-weight: 500;
    }
    .status-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--error);
      transition: background var(--transition);
    }
    .status-dot.online {
      background: var(--success);
      box-shadow: 0 0 8px rgba(52, 211, 153, 0.5);
      animation: pulse 2s ease-in-out infinite;
    }
    @keyframes pulse {
      0%, 100% { box-shadow: 0 0 4px rgba(52, 211, 153, 0.4); }
      50% { box-shadow: 0 0 12px rgba(52, 211, 153, 0.7); }
    }

    /* Error Bar */
    .error-bar {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 16px;
      background: var(--error-bg);
      border: 1px solid rgba(248, 113, 113, 0.15);
      border-radius: var(--radius-md);
      color: var(--error);
      font-size: 0.85rem;
      cursor: pointer;
      transition: opacity var(--transition);
    }
    .error-bar:hover { opacity: 0.8; }

    /* Translator Card */
    .translator-card {
      display: flex;
      flex-direction: column;
      overflow: hidden;
      box-shadow: var(--shadow-lg), var(--shadow-glow);
    }

    /* Language Bar */
    .lang-bar {
      display: flex;
      align-items: center;
      gap: 0;
      border-bottom: 1px solid var(--border);
    }
    .lang-selector {
      flex: 1;
      position: relative;
    }
    .lang-selector select {
      width: 100%;
      padding: 16px 20px;
      appearance: none;
      background: transparent;
      border: none;
      color: var(--text-primary);
      font-size: 0.95rem;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      outline: none;
      transition: background var(--transition);
    }
    .lang-selector select:hover {
      background: rgba(255,255,255,0.02);
    }
    .lang-selector select option {
      background: var(--bg-secondary);
      color: var(--text-primary);
      padding: 8px;
    }
    .swap-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      border: 1px solid var(--border);
      border-radius: 50%;
      background: var(--surface);
      color: var(--text-secondary);
      cursor: pointer;
      transition: all var(--transition);
      flex-shrink: 0;
    }
    .swap-btn:hover:not(:disabled) {
      background: rgba(99, 102, 241, 0.1);
      border-color: var(--border-active);
      color: var(--accent-start);
      transform: rotate(180deg);
    }
    .swap-btn:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    /* Panels */
    .panels {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      min-height: 300px;
    }
    @media (max-width: 640px) {
      .panels {
        grid-template-columns: 1fr;
        min-height: auto;
      }
      .divider { display: none; }
    }
    .panel {
      display: flex;
      flex-direction: column;
    }
    .divider {
      display: flex;
      align-items: stretch;
      padding: 0;
    }
    .divider-line {
      width: 1px;
      background: var(--border);
    }
    .text-input, .text-output {
      flex: 1;
      padding: 20px;
      font-size: 1.05rem;
      line-height: 1.65;
      color: var(--text-primary);
      font-family: inherit;
      min-height: 260px;
    }
    .text-input {
      background: transparent;
      border: none;
      resize: none;
      outline: none;
    }
    .text-input::placeholder {
      color: var(--text-muted);
    }
    .text-output {
      display: flex;
      align-items: flex-start;
    }
    .placeholder-text {
      color: var(--text-muted);
    }
    .translated-text {
      color: var(--text-primary);
    }
    .fade-in {
      animation: fadeIn 0.3s ease-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Wave Dots */
    .translating-indicator {
      display: flex;
      gap: 5px;
      align-items: center;
      padding-top: 4px;
    }
    .wave-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--accent-start), var(--accent-end));
      animation: wave 1.2s ease-in-out infinite;
    }
    .wave-dot:nth-child(2) { animation-delay: 0.15s; }
    .wave-dot:nth-child(3) { animation-delay: 0.3s; }
    @keyframes wave {
      0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
      30% { transform: translateY(-8px); opacity: 1; }
    }

    /* Panel Footer */
    .panel-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 20px;
      border-top: 1px solid var(--border);
    }
    .char-count {
      font-size: 0.75rem;
      color: var(--text-muted);
      font-variant-numeric: tabular-nums;
    }
    .panel-actions {
      display: flex;
      gap: 4px;
    }
    .icon-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border: none;
      border-radius: var(--radius-sm);
      background: transparent;
      color: var(--text-secondary);
      cursor: pointer;
      transition: all var(--transition);
    }
    .icon-btn:hover {
      background: rgba(255,255,255,0.06);
      color: var(--text-primary);
    }

    /* Footer */
    .footer {
      text-align: center;
      padding: 8px;
      margin-top: auto;
    }
    .footer p {
      font-size: 0.75rem;
      color: var(--text-muted);
      font-weight: 400;
    }
    .footer strong {
      color: var(--text-secondary);
      font-weight: 500;
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
  copied: boolean = false;

  private translateSubject = new Subject<string>();

  constructor(private translationService: TranslationService) {}

  ngOnInit() {
    this.fetchLanguages();

    // Debounced translation pipeline
    this.translateSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(text => {
        if (!text.trim()) {
          this.translatedText = '';
          this.isTranslating = false;
          return of('');
        }
        this.isTranslating = true;
        this.error = null;
        const req: TranslateRequest = {
          q: text,
          source: this.sourceLang,
          target: this.targetLang
        };
        return this.translationService.translate(req).pipe(
          catchError(err => {
            this.error = 'Translation failed. Check backend.';
            this.isTranslating = false;
            return of('');
          })
        );
      })
    ).subscribe(result => {
      this.translatedText = result;
      this.isTranslating = false;
    });
  }

  fetchLanguages() {
    this.translationService.getLanguages().subscribe({
      next: (langs) => {
        this.languages = langs;
        if (langs.length > 0) {
          if (!langs.find(l => l.code === this.sourceLang)) this.sourceLang = langs[0].code;
          if (!langs.find(l => l.code === this.targetLang) && langs.length > 1) {
            this.targetLang = langs.find(l => l.code !== this.sourceLang)?.code || langs[0].code;
          }
        }
      },
      error: () => {
        this.error = 'Could not connect to translation server.';
      }
    });
  }

  onSourceLangChange(lang: string) {
    this.sourceLang = lang;
    this.retranslate();
  }

  onTargetLangChange(lang: string) {
    this.targetLang = lang;
    this.retranslate();
  }

  onSourceTextInput(text: string) {
    this.sourceText = text;
    this.translateSubject.next(text);
  }

  retranslate() {
    if (this.sourceText.trim()) {
      this.translateSubject.next(this.sourceText);
    }
  }

  swapLangs() {
    const tmpLang = this.sourceLang;
    const tmpText = this.translatedText;
    this.sourceLang = this.targetLang;
    this.targetLang = tmpLang;
    this.sourceText = tmpText;
    this.translatedText = '';
    if (this.sourceText.trim()) {
      this.translateSubject.next(this.sourceText);
    }
  }

  clearSource() {
    this.sourceText = '';
    this.translatedText = '';
  }

  copyTranslation() {
    navigator.clipboard.writeText(this.translatedText);
    this.copied = true;
    setTimeout(() => this.copied = false, 2000);
  }
}
