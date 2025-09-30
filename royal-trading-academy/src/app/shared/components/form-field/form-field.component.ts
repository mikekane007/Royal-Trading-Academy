import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR, AbstractControl } from '@angular/forms';
import { FormValidationService } from '../../../services/validation/form-validation.service';

@Component({
  selector: 'app-form-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormFieldComponent),
      multi: true
    }
  ],
  template: `
    <div class="form-field" [class.form-field-error]="hasError">
      <label *ngIf="label" class="form-label" [for]="fieldId">
        {{ label }}
        <span *ngIf="required" class="required-asterisk">*</span>
      </label>
      
      <div class="form-input-container">
        <input
          *ngIf="type !== 'textarea'"
          [id]="fieldId"
          [type]="type"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [value]="value"
          (input)="onInput($event)"
          (blur)="onBlur()"
          (focus)="onFocus()"
          class="form-input"
          [class.form-input-error]="hasError"
        />
        
        <textarea
          *ngIf="type === 'textarea'"
          [id]="fieldId"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [value]="value"
          (input)="onInput($event)"
          (blur)="onBlur()"
          (focus)="onFocus()"
          class="form-input form-textarea"
          [class.form-input-error]="hasError"
          [rows]="rows"
        ></textarea>
        
        <div *ngIf="icon" class="form-icon">
          <ng-content select="[slot=icon]"></ng-content>
        </div>
      </div>
      
      <div *ngIf="hasError && errorMessage" class="form-error">
        {{ errorMessage }}
      </div>
      
      <div *ngIf="hint && !hasError" class="form-hint">
        {{ hint }}
      </div>
    </div>
  `,
  styleUrls: ['./form-field.component.scss']
})
export class FormFieldComponent implements ControlValueAccessor {
  @Input() label?: string;
  @Input() type: string = 'text';
  @Input() placeholder?: string;
  @Input() hint?: string;
  @Input() required: boolean = false;
  @Input() disabled: boolean = false;
  @Input() icon: boolean = false;
  @Input() rows: number = 3;
  @Input() control?: AbstractControl | null;
  @Input() fieldName?: string;

  value: any = '';
  fieldId: string;
  private onChange = (value: any) => {};
  private onTouched = () => {};

  constructor(private validationService: FormValidationService) {
    this.fieldId = 'field-' + Math.random().toString(36).substr(2, 9);
  }

  get hasError(): boolean {
    return !!(this.control && this.control.errors && (this.control.dirty || this.control.touched));
  }

  get errorMessage(): string | null {
    if (!this.hasError || !this.control || !this.fieldName) {
      return null;
    }
    
    return this.validationService.getFirstErrorMessage(this.fieldName, this.control);
  }

  // ControlValueAccessor implementation
  writeValue(value: any): void {
    this.value = value || '';
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    this.value = target.value;
    this.onChange(this.value);
  }

  onBlur(): void {
    this.onTouched();
  }

  onFocus(): void {
    // Handle focus events if needed
  }
}