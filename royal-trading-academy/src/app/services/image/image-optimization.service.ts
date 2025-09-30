import { Injectable } from '@angular/core';

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
  fit?: 'cover' | 'contain' | 'fill';
}

@Injectable({
  providedIn: 'root'
})
export class ImageOptimizationService {
  
  // Generate optimized image URL (for services like Cloudinary, ImageKit, etc.)
  public getOptimizedImageUrl(
    originalUrl: string, 
    options: ImageOptimizationOptions = {}
  ): string {
    // If it's already an optimized URL or external URL, return as is
    if (originalUrl.includes('cloudinary.com') || 
        originalUrl.includes('imagekit.io') ||
        originalUrl.startsWith('http')) {
      return originalUrl;
    }
    
    // For local images, we can implement different strategies
    return this.buildOptimizedUrl(originalUrl, options);
  }
  
  private buildOptimizedUrl(url: string, options: ImageOptimizationOptions): string {
    const params = new URLSearchParams();
    
    if (options.width) params.set('w', options.width.toString());
    if (options.height) params.set('h', options.height.toString());
    if (options.quality) params.set('q', options.quality.toString());
    if (options.format) params.set('f', options.format);
    if (options.fit) params.set('fit', options.fit);
    
    const queryString = params.toString();
    return queryString ? `${url}?${queryString}` : url;
  }
  
  // Generate responsive image srcset
  public generateSrcSet(baseUrl: string, widths: number[]): string {
    return widths
      .map(width => {
        const optimizedUrl = this.getOptimizedImageUrl(baseUrl, { width });
        return `${optimizedUrl} ${width}w`;
      })
      .join(', ');
  }
  
  // Generate sizes attribute for responsive images
  public generateSizes(breakpoints: { [key: string]: string }): string {
    return Object.entries(breakpoints)
      .map(([mediaQuery, size]) => `${mediaQuery} ${size}`)
      .join(', ');
  }
  
  // Preload critical images
  public preloadImage(url: string, options: ImageOptimizationOptions = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const optimizedUrl = this.getOptimizedImageUrl(url, options);
      
      img.onload = () => resolve();
      img.onerror = () => reject(new Error(`Failed to preload image: ${optimizedUrl}`));
      
      img.src = optimizedUrl;
    });
  }
  
  // Preload multiple images
  public preloadImages(urls: string[], options: ImageOptimizationOptions = {}): Promise<void[]> {
    const promises = urls.map(url => this.preloadImage(url, options));
    return Promise.all(promises);
  }
  
  // Convert image to WebP format (client-side)
  public convertToWebP(file: File, quality: number = 0.8): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Failed to convert image to WebP'));
              }
            },
            'image/webp',
            quality
          );
        } else {
          reject(new Error('Canvas context not available'));
        }
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }
  
  // Compress image (client-side)
  public compressImage(
    file: File, 
    maxWidth: number = 1920, 
    maxHeight: number = 1080, 
    quality: number = 0.8
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Failed to compress image'));
              }
            },
            file.type,
            quality
          );
        } else {
          reject(new Error('Canvas context not available'));
        }
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }
  
  // Check WebP support
  public supportsWebP(): Promise<boolean> {
    return new Promise((resolve) => {
      const webP = new Image();
      webP.onload = webP.onerror = () => {
        resolve(webP.height === 2);
      };
      webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    });
  }
  
  // Get optimal image format based on browser support
  public async getOptimalFormat(originalFormat: string): Promise<string> {
    const supportsWebP = await this.supportsWebP();
    
    if (supportsWebP && ['jpeg', 'jpg', 'png'].includes(originalFormat.toLowerCase())) {
      return 'webp';
    }
    
    return originalFormat;
  }
}