import {CommonModule} from '@angular/common';
import {HttpErrorResponse} from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatToolbarModule} from '@angular/material/toolbar';

import {DestroySubscription} from '../../classes/destroy-subscription';
import {ParseForm, ParseFormData} from '../../models/parse-form';
import {HTTP_URL_PATTERN} from '../../static/pattern';
import {FileInputComponent} from '../file-input/file-input.component';

@Component({
  selector: 'app-parse-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatInputModule, MatButtonModule, MatToolbarModule, FileInputComponent, MatProgressSpinnerModule, MatIconModule],
  templateUrl: './parse-form.component.html',
  styleUrls: ['./parse-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ParseFormComponent extends DestroySubscription implements OnChanges {

  @Input() loading: boolean | null = false;
  @Input()  error: HttpErrorResponse | null =null;
  @Output() send = new EventEmitter<ParseFormData>();

  form = new FormGroup<ParseForm>({
    url: new FormControl(null, {validators: [Validators.required, Validators.pattern(HTTP_URL_PATTERN)]}),
  })
  ngOnChanges(changes: SimpleChanges) {
    const error = this.error;
    if('error' in changes && error){
      const ctrl = this.form.controls.url
      ctrl.setErrors({server: error.message})
    }
  }

  onSubmit(): void {
    const {invalid, value} = this.form
    if (invalid) {
      return
    }
    this.send.emit(value as ParseFormData);
  }
}
