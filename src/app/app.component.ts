import { Component, ElementRef, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { OcrService } from './services/ocr.service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'poc-image-ocr';

  @ViewChild('video') video!: ElementRef;
  @ViewChild('canvas') canvas!: ElementRef;
  capturedImage: string | null = null;
  result: string | void = '';
  loading: boolean = false;
  mrzNotFound = 'MRZ not found';
  scanComplete = false;

  constructor(private ocrService: OcrService) {}

  ngAfterViewInit() {
    this.startCamera();
  }

  async startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      this.video.nativeElement.srcObject = stream;
      this.startPassportScan();

    } catch (err) {
      console.error('Error accessing camera:', err);
    }
  }

  startPassportScan() {
    try {
      this.captureImage();
      this.scanImage()
      setTimeout(() => {
        if(!this.scanComplete) {
          this.startPassportScan();
        }
        console.log("Im still in action")
      }, 2000);
    } catch (err) {
      console.error("error in passport scan", err);
    }

  }

  captureImage() {
    const videoElement = this.video.nativeElement;
    const canvasElement = this.canvas.nativeElement;
    const context = canvasElement.getContext('2d');

    canvasElement.width = videoElement.videoWidth;
    canvasElement.height = videoElement.videoHeight;

    context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
    this.capturedImage = canvasElement.toDataURL('image/png');
  }

  async scanImage() {
    if (this.capturedImage) {
      this.loading = true;
      try {
        this.result = await this.ocrService.scanImage(this.capturedImage)
          .then( (data) => {
                  const text = data;
                  return this.extractMRZ(data);
          })

        if(this.result !== this.mrzNotFound) {
          this.scanComplete = true;

          // 
          const base64Result = this.getBase64StringFromDataURL(this.capturedImage);
          console.log(base64Result);
        }
      } catch (error) {
        console.error('Error scanning the image:', error);
      }
      this.loading = false;
    }
  }

  extractMRZ(text: string): string | void {
    const mrzPattern = /^[A-Z0-9<]{44,60}$/gm; // MRZ pattern for passports
    console.log("Text found", text);
    const matches = text.match(mrzPattern);
    console.log('matches', matches)
    return matches ? matches.join('\n') : this.mrzNotFound;
  }

  private getBase64StringFromDataURL = (dataURL: string) => {
    return dataURL?.replace('data:', '').replace(/^.+,/, '');
  };
}

