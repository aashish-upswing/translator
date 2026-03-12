import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatorContainerComponent } from './components/translator-container/translator-container';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, TranslatorContainerComponent],
  template: `
    <main>
      <app-translator-container></app-translator-container>
    </main>
  `,
  styleUrls: ['./app.css']
})
export class AppComponent {
  title = 'frontend';
}
