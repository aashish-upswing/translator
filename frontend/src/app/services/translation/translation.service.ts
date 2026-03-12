import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface Language {
  code: string;
  name: string;
}

export interface TranslateRequest {
  q: string;
  source: string;
  target: string;
}

export interface TranslateResponse {
  translatedText?: string;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private apiUrl = 'http://localhost:8000';

  constructor(private http: HttpClient) { }

  getLanguages(): Observable<Language[]> {
    return this.http.get<any>(`${this.apiUrl}/languages`).pipe(
      map(res => {
        if (!Array.isArray(res) && res.error) {
          throw new Error(res.error);
        }
        return res as Language[];
      })
    );
  }

  translate(request: TranslateRequest): Observable<string> {
    return this.http.post<TranslateResponse>(`${this.apiUrl}/translate`, request).pipe(
      map(res => {
        if (res.error) throw new Error(res.error);
        return res.translatedText || '';
      })
    );
  }
}
