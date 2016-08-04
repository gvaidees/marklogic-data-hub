import { Inject, Injectable, EventEmitter } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Message } from 'stompjs/lib/stomp.min';
import { STOMPService } from '../stomp/stomp.service';

@Injectable()
export class InstallService {

  messageEmitter: EventEmitter<any> = new EventEmitter<any>();
  private messages: Observable<Message>;

  constructor(
    private http: Http,
    private stomp: STOMPService) {
    this.stomp.messages.subscribe(this.onMessage);
  }

  install(projectId, environment) {
    let unsubscribeId;
    this.stomp.subscribe('/topic/install-status').then(msgId => {
      unsubscribeId = msgId;
    });
    this.http.put(`/projects/${projectId}/${environment}/install`, null).subscribe(() => {
      this.stomp.unsubscribe(unsubscribeId);
    });
  }

  uninstall(projectId: string, environment: string) {
    let unsubscribeId;
    this.stomp.subscribe('/topic/uninstall-status').then(msgId => {
      unsubscribeId = msgId;
    });
    this.http.delete(`/projects/${projectId}/${environment}/uninstall`).subscribe(() => {
      this.stomp.unsubscribe(unsubscribeId);
    });
  }

  public onMessage = (message: Message) => {
    if (message.headers.destination === '/topic/install-status' ||
      message.headers.destination === '/topic/uninstall-status') {
      let json = JSON.parse(message.body);
      this.messageEmitter.next(json);
    }
  }
}