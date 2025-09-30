import { Directive, ElementRef, Input, OnInit, OnDestroy, inject } from '@angular/core';
import { PerformanceService } from '../services/performance/performance.service';

@Directive({
  selector: '[appLazyImage]',
  standalone: true
})
export class LazyImageDirective implements OnInit, OnDestroy {
  @Input() appLazyImage!: string;
  @Input() placeholder?: string;
  @Input() errorImage?: string;
  
  private elementRef = inject(ElementRef);
  private performanceService = inject(PerformanceService);
  private observer?: IntersectionObserver;
  
  ngOnInit() {
    this.setupLazyLoading();
  }
  
  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
  
  private setupLazyLoading() {
    const img = this.elementRef.nativeElement as HTMLImageElement;
    
    // Set placeholder image
    if (this.placeholder) {
      img.src = this.placeholder;
    }
    
    // Add loading attribute for native lazy loading support
    img.loading = 'lazy';
    
    // Set up intersection observer for browsers that don't support native lazy loading
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              this.loadImage(img);
              this.observer?.unobserve(img);
            }
          });
        },
        {
          rootMargin: '50px 0px', // Start loading 50px before the image enters viewport
          threshold: 0.01
        }
      );
      
      this.observer.observe(img);
    } else {
      // Fallback for older browsers
      this.loadImage(img);
    }
  }
  
  private loadImage(img: HTMLImageElement) {
    const tempImg = new Image();
    
    tempImg.onload = () => {
      img.src = this.appLazyImage;
      img.classList.add('loaded');
      
      // Track performance
      this.performanceService.lazyLoadImage(img).catch(error => {
        console.error('Error tracking image performance:', error);
      });
    };
    
    tempImg.onerror = () => {
      if (this.errorImage) {
        img.src = this.errorImage;
      }
      img.classList.add('error');
    };
    
    tempImg.src = this.appLazyImage;
  }
}