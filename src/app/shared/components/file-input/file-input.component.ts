import {CommonModule} from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  Input,
  ViewChild,
} from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  FormControl,
  NgControl,
  ReactiveFormsModule,
  ValidationErrors,
  Validator,
  Validators,
} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {FloatLabelType, MatFormFieldAppearance} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatToolbarModule} from '@angular/material/toolbar';
import {DomSanitizer} from '@angular/platform-browser';
import {distinctUntilChanged, takeUntil} from 'rxjs';

import {DestroySubscription} from '../../classes/destroy-subscription';
import {UploadFileError} from '../../models/file-input';
import {extractTouchedChanges} from '../../utils/extract-touched-changes';
import {fitInSize} from '../../utils/fit-in-size';
import {parseFileNameFromUrl} from '../../utils/parse-file-name-from-url';

@Component({
  selector: 'app-file-input',
  standalone: true,
  imports: [CommonModule, MatToolbarModule, MatInputModule, MatButtonModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './file-input.component.html',
  styleUrls: ['./file-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileInputComponent extends DestroySubscription implements ControlValueAccessor, Validator, AfterViewInit {
  @Input() acceptedTypes: string | null = null;
  @Input() maxFileSize: number | null = null;
  @Input() appearance: MatFormFieldAppearance = 'outline';
  @Input() floatLabel: FloatLabelType = 'always';

  selectFileName = new FormControl<string | null>(null, {validators: [Validators.required]});
  uploadFileError: UploadFileError | null = null;

  @ViewChild('fileInput', {static: true, read: ElementRef}) fileInputRef : ElementRef<HTMLInputElement> | undefined;

  private readonly sanitizer =  inject( DomSanitizer)
  private readonly cdr =  inject(ChangeDetectorRef)
  private readonly ngControl =  inject(NgControl)

  constructor() {
    super();
    this.ngControl.valueAccessor = this;
  }

  ngAfterViewInit() {
    const control  = this.ngControl.control;
    if(control){
      this.updateTouchedState(control);
    }
  }

  onClickFormField(): void {
    this.fileInputRef?.nativeElement?.click();
    this.onTouched();
  }

  onFileChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const files = target.files as FileList;
    if (!files) {
      return;
    }
    this.uploadFile(files);
  }

  // onDropFile(event: DragEvent): void {
  //   event.preventDefault();
  //   event.stopPropagation();
  //   const files = event.dataTransfer && event.dataTransfer.files;
  //   if (!files) {
  //     return;
  //   }
  //   this.uploadFile(files);
  //   this.onTouchedFn();
  // }
  //
  // onDragFile(event: DragEvent): void {
  //   event.preventDefault();
  //   event.stopPropagation();
  // }

  validate(): ValidationErrors | null {
    const value = this.uploadFileError
    if(!value){
      return null
    }
    return {custom: value.message}
  }

  private uploadFile(files: FileList): void {
    if (!files.length) {
      return;
    }
    const file = files[0];
    const error = this.validateFile(file);
    if (error) {
      this.uploadFileError = error;
      this.selectFileName.setValue(null);
      this.onChangeFn(null);
      this.cdr.detectChanges();
      return;
    }
    this.uploadFileError = null;
    const url = URL.createObjectURL(file);
    const value = {path: this.sanitizer.bypassSecurityTrustUrl(url), fileName: file.name, file};
    this.selectFileName.setValue(value.fileName)
    this.onChangeFn(value);
    this.cdr.detectChanges();
  }

  private validateFile(file: File): UploadFileError | null {
    if (!fitInSize(file, this.maxFileSize)) {
      return new UploadFileError(
        `${file.name}`,
        `Your file exceeds ${this.maxFileSize}MB. Upload a smaller image.`,
      );
    }
    const mimeType = file.type;
    const ext = `.${mimeType.split('/')[1]}`;
    if (this.acceptedTypes && !this.acceptedTypes.includes(ext)) {
      return new UploadFileError(
        `${file.name}`,
        `Image should be in ${this.acceptedTypes} format.`,
      );
    }
    return null;
  }

  writeValue(value: string | null) {
    const fileName = value ? parseFileNameFromUrl(value) : null;
    this.selectFileName.setValue( fileName, {emitEvent: false});
    if(this.fileInputRef?.nativeElement){
      this.fileInputRef.nativeElement.value = fileName || ''
    }
    this.cdr.detectChanges();
  }

  registerOnChange(fn: () => void) {
    this.onChangeFn = fn;
  }

  registerOnTouched(fn: () => void) {
    this.onTouchedFn = fn;
  }

  onTouched(): void {
    this.onTouchedFn();
  }

  private onChangeFn = (_: any) => {
  };

  private onTouchedFn = () => {
  };

  private updateTouchedState(control: AbstractControl): void {
    extractTouchedChanges(control).pipe(
      distinctUntilChanged(),
      takeUntil(this.destroyStream$),
    ).subscribe(touched => {
      if(touched){
        this.selectFileName.markAsTouched();
        return;
      }
      this.selectFileName.markAsUntouched();
    })
  }

}
