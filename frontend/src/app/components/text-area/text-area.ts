import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-text-area',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="textarea-container glass-panel" [class.readonly]="readonly">
      <textarea
        [ngModel]="value"
        (ngModelChange)="onInput($event)"
        [placeholder]="placeholder"
        [readonly]="readonly"
        class="custom-textarea">
      </textarea>
      <div *ngIf="loading" class="loader">
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
      </div>
    </div>
  `,
  styles: [`
    .textarea-container {
      position: relative;
      width: 100%;
      height: 250px;
      border-radius: 12px;
      transition: all 0.3s ease;
      display: flex;
      flex-direction: column;
    }
    .textarea-container:focus-within {
      border-color: var(--accent);
      box-shadow: 0 0 0 2px rgba(88, 166, 255, 0.2);
    }
    .textarea-container.readonly {
      background: rgba(22, 27, 34, 0.4);
    }
    .custom-textarea {
      width: 100%;
      height: 100%;
      padding: 16px;
      background: transparent;
      border: none;
      color: var(--text-main);
      font-size: 18px;
      line-height: 1.5;
      resize: none;
      outline: none;
      font-family: inherit;
    }
    .custom-textarea::placeholder {
      color: var(--text-muted);
      opacity: 0.7;
    }
    
    /* Loading Animation */
    .loader {
      position: absolute;
      bottom: 16px;
      right: 16px;
      display: flex;
      gap: 4px;
    }
    .dot {
      width: 6px;
      height: 6px;
      background-color: var(--accent);
      border-radius: 50%;
      animation: bounce 1.4s infinite ease-in-out both;
    }
    .dot:nth-child(1) { animation-delay: -0.32s; }
    .dot:nth-child(2) { animation-delay: -0.16s; }
    @keyframes bounce {
      0%, 80%, 100% { transform: scale(0); opacity: 0.3; }
      40% { transform: scale(1); opacity: 1; }
    }
  `]
})
export class TextAreaComponent implements OnInit, OnDestroy {
  @Input() value: string = '';
  @Input() placeholder: string = 'Type to translate...';
  @Input() readonly: boolean = false;
  @Input() loading: boolean = false;

  @Output() valueChange = new EventEmitter<string>();
  
  private inputSubject = new Subject<string>();

  ngOnInit() {
    // Only debounce if to emit up
    if (!this.readonly) {
      this.inputSubject.pipe(
        debounceTime(400),
        distinctUntilChanged()
      ).subscribe(val => {
        this.valueChange.emit(val);
      });
    }
  }

  onInput(text: string) {
    this.value = text;
    if (!this.readonly) {
      this.inputSubject.next(text);
    }
  }

  ngOnDestroy() {
    this.inputSubject.complete();
  }
}
