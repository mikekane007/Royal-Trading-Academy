import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageOptimizationService, ImageOptimizationOptions } from '../../../services/image/image-optimization.service';
import { LazyImageDirective } from '../../../directives/lazy-image.directive';

@Component({
  selector: 'app-optimized-image',
  standalone: true,
  imports: [CommonModule, LazyImageDirective],
  template: `
    <picture class="optimized-image">
      <!-- WebP source for supported browsers -->
      <source 
        *ngIf="webpSrcSet"
        [srcset]="webpSrcSet" 
        [sizes]="sizes"
        type="image/webp">
      
      <!-- Fallback image -->
      <img 
        [appLazyImage]="optimizedSrc"
        [placeholder]="placeholderSrc"
        [errorImage]="errorSrc"
        [alt]="alt"
        [class]="imageClass"
        [style.width]="width"
        [style.height]="height"
        (load)="onImageLoad()"
        (error)="onImageError()">
    </picture>
  `,
  styles: [`
    .optimized-image {
      display: block;
    }
    
    .optimized-image img {
      width: 100%;
      height: auto;
      transition: opacity 0.3s ease;
      opacity: 0;
    }
    
    .optimized-image img.loaded {
      opacity: 1;
    }
    
    .optimized-image img.error {
      opacity: 0.5;
    }
    
    /* Skeleton loading animation */
    .optimized-image img:not(.loaded):not(.error) {
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: loading 1.5s infinite;
    }
    
    @keyframes loading {
      0% {
        background-position: 200% 0;
      }
      100% {
        background-position: -200% 0;
      }
    }
  `]
})
export class OptimizedImageComponent implements OnInit {
  @Input() src!: string;
  @Input() alt: string = '';
  @Input() width?: string;
  @Input() height?: string;
  @Input() placeholder?: string;
  @Input() errorImage?: string;
  @Input() imageClass?: string;
  @Input() lazy: boolean = true;
  @Input() responsive: boolean = true;
  @Input() quality: number = 80;
  @Input() sizes?: string;
  @Input() breakpoints: number[] = [320, 640, 768, 1024, 1280, 1920];
  
  private imageOptimizationService = inject(ImageOptimizationService);
  
  optimizedSrc!: string;
  webpSrcSet?: string;
  placeholderSrc?: string;
  errorSrc?: string;
  
  ngOnInit() {
    this.setupOptimizedImages();
  }
  
  private async setupOptimizedImages() {
    // Set up optimized main source
    const options: ImageOptimizationOptions = {
      quality: this.quality
    };
    
    if (this.width) {
      options.width = parseInt(this.width);
    }
    if (this.height) {
      options.height = parseInt(this.height);
    }
    
    this.optimizedSrc = this.imageOptimizationService.getOptimizedImageUrl(this.src, options);
    
    // Set up WebP srcset for responsive images
    if (this.responsive) {
      const webpOptions = { ...options, format: 'webp' as const };
      this.webpSrcSet = this.imageOptimizationService.generateSrcSet(this.src, this.breakpoints);
    }
    
    // Set up placeholder
    if (this.placeholder) {
      this.placeholderSrc = this.imageOptimizationService.getOptimizedImageUrl(
        this.placeholder, 
        { width: 50, quality: 30 }
      );
    }
    
    // Set up error image
    if (this.errorImage) {
      this.errorSrc = this.imageOptimizationService.getOptimizedImageUrl(this.errorImage, options);
    }
    
    // Set default sizes if not provided
    if (this.responsive && !this.sizes) {
      this.sizes = this.imageOptimizationService.generateSizes({
        '(max-width: 640px)': '100vw',
        '(max-width: 1024px)': '50vw',
        '': '33vw'
      });
    }
  }
  
  onImageLoad() {
    console.log('Image loaded successfully:', this.src);
  }
  
  onImageError() {
    console.error('Failed to load image:', this.src);
  }
}