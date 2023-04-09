import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';

import {ChatRoutingModule} from './chat-routing.module';
import {ChatComponent} from './components/chat.component';
import {OpenaiApiService} from './services/open-ai/openai-api.service';

import {ChatFormComponent} from '../../shared/components/chat-form/chat-form.component';
import {ChatPanelComponent} from '../../shared/components/chat-panel/chat-panel.component';

@NgModule({
  declarations: [ChatComponent],
  imports: [CommonModule, ChatRoutingModule, ChatPanelComponent, ChatFormComponent],
  providers: [
    OpenaiApiService,
  ],
})
export class ChatModule {

}
