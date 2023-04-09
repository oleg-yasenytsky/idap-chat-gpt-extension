import {CdkTextareaAutosize} from '@angular/cdk/text-field';
import {CommonModule} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  NgZone,
  Output,
  ViewChild,
} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {take} from 'rxjs';

import {ChatForm, ChatFormValue} from '../../models/chat-form';
import {ChatConnectState} from '../../models/open-ai-chat';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatInputModule, MatButtonModule, MatProgressSpinnerModule, MatIconModule],
  selector: 'app-chat-form',
  templateUrl: './chat-form.component.html',
  styleUrls: ['./chat-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatFormComponent {

  @Input() connection: ChatConnectState | null = null;
  @Output() send = new EventEmitter<ChatFormValue>();
  @Output() stopGeneration = new EventEmitter<void>();

  form = new FormGroup<ChatForm>({
    message: new FormControl('', {nonNullable: true, validators: [Validators.required, Validators.maxLength(1000)]}),
  })
  private readonly ngZone = inject(NgZone)

  @ViewChild('cfcAutosize', {static: true}) contentFCAutosize?: CdkTextareaAutosize;
  @ViewChild('textarea', {read: ElementRef, static: true}) textarea?: ElementRef<HTMLInputElement>;

  onChangeMessage() {
    this.resizeTextArea()
  }

  handleKeyDown(e: KeyboardEvent) {
    if (e.key !== 'Enter') {
      return;
    }
    e.preventDefault()
    if (e.shiftKey) {
      const message = this.form.value.message;
      this.updateMessage(message + '\n')
      return;
    }
    this.onSubmit();
  }

  onSubmit(): void {
    const {invalid, value} = this.form
    if (invalid || this.connection !== 'waiting') {
      return
    }
    this.blurTextarea();
    this.send.emit(value as ChatFormValue);
    this.form.reset();
    this.form.markAsUntouched();
  }

  onStopGeneration(): void {
    this.stopGeneration.emit()
  }

  private blurTextarea () {
    this.textarea?.nativeElement?.blur()
  }

  private updateMessage(value: string) {
    const messageCtrl = this.form.controls.message;
    messageCtrl.setValue(value)
  }

  private resizeTextArea() {
    this.ngZone.onStable.pipe(take(1))
      .subscribe(() => this.contentFCAutosize?.resizeToFitContent(true))
  }
}
