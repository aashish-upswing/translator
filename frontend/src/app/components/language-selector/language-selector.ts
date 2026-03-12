import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Language } from '../../services/translation/translation.service';

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="selector-container glass-panel">
      <select 
        [ngModel]="selectedCode()"
        (ngModelChange)="onSelect($event)"
        class="lang-select"
        [disabled]="disabled">
        <option *ngFor="let lang of languages" [value]="lang.code">
          {{ lang.name }}
        </option>
      </select>
      <div class="chevron"></div>
    </div>
  `,
  styles: [`
    .selector-container {
      position: relative;
      width: 100%;
      border-radius: 8px;
      overflow: hidden;
      transition: all 0.3s ease;
    }
    .selector-container:focus-within {
      border-color: var(--accent);
      box-shadow: 0 0 0 2px rgba(88, 166, 255, 0.3);
    }
    .lang-select {
      width: 100%;
      padding: 12px 16px;
      appearance: none;
      background: transparent;
      border: none;
      color: var(--text-main);
      font-size: 16px;
      font-weight: 500;
      cursor: pointer;
      outline: none;
    }
    .lang-select:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .lang-select option {
      background: var(--bg-color);
      color: var(--text-main);
    }
    .chevron {
      position: absolute;
      right: 16px;
      top: 50%;
      transform: translateY(-50%);
      width: 0;
      height: 0;
      border-left: 5px solid transparent;
      border-right: 5px solid transparent;
      border-top: 5px solid var(--text-muted);
      pointer-events: none;
    }
  `]
})
export class LanguageSelectorComponent {
  @Input() languages: Language[] = [];
  @Input() selected: string = 'en';
  @Input() disabled: boolean = false;
  
  @Output() languageChange = new EventEmitter<string>();

  // Use a getter for the template binding to ensure it reflects updates properly
  selectedCode() {
    return this.selected;
  }

  onSelect(code: string) {
    this.languageChange.emit(code);
  }
}
