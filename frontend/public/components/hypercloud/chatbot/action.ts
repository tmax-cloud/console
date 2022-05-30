import { history } from '@console/internal/components/utils';
import { Message, MessageContent } from './types';

export class Action {
  static createActionHandler(message: Message) {
    if (!message.payload || !message.payload.type || !message.payload.payload) {
      return new BaseActionHandler();
    }
    // 라우팅 액션 이외의 액션이 생길 경우 핸들러 추가
    return new RouteActionHandler(message.payload);
  }
}

interface ActionHandler {
  execute(): void;
}

class BaseActionHandler implements ActionHandler {
  execute(): void {
    // do nothing
  }
}

class RouteActionHandler implements ActionHandler {
  private payload: MessageContent;
  private path: string = '';

  constructor(payload: MessageContent) {
    this.payload = payload;
    this.setupRoute();
  }

  setupRoute(): void {
    switch (this.payload?.payload) {
      case 'PENDINGPVCVIEW':
        // 임시 URL. JSON payload 값에 대해 서버담당자와 논의 필요
        this.path = '/k8s/all-namespaces/persistentvolumeclaims?rowFilter-pvc-status=Pending';
        break;
      default:
        break;
    }
  }

  execute(): void {
    this.path && history.push(this.path);
  }
}
