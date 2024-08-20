// src/app/services/ocr.service.ts
import { Injectable } from '@angular/core';
import { createWorker, Worker  } from 'tesseract.js';

@Injectable({
  providedIn: 'root'
})
export class OcrService {
//   private worker = createWorker();
  private worker!: Worker;

  constructor() {
    this.initializeWorker();
  }

  private async initializeWorker() {
    this.worker = await createWorker();
    await this.worker.load();
    // await this.worker.loadLanguage('eng');
    // await this.worker.initialize('eng');
  }

  async scanImage(image: File | string): Promise<string> {
    const { data: { text } } = await this.worker.recognize(image);
    return text;
  }

  async terminateWorker() {
    await this.worker.terminate();
  }
}
