import { history } from '@console/internal/components/utils';
import { Config, Message, MessageName, PayloadType, QuickReplyPayload } from './types';

export class ActionFactory {
  static createActionHandler(message: Message) {
    switch (message?.name) {
      case MessageName.WEBCHAT_LOADED:
        return new WebchatLoadedActionHandler();
      case MessageName.WEBCHAT_OPENED:
        return new WebchatOpenedActionHandler();
      case MessageName.WEBCHAT_CLOSED:
        return new WebchatClosedActionHandler();
      case MessageName.WEBCHAT_READY:
        return new WebchatReadyActionHandler();
      default:
        switch (message?.payload?.type) {
          case PayloadType.QUICK_REPLY:
            return new RouteActionHandler(message.payload);
          default:
            return new BaseActionHandler();
        }
    }
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

// Triggered when the webchat is loaded and ready to be opened
class WebchatLoadedActionHandler implements ActionHandler {
  execute(): void {}
}

// Triggered when the webchat button bubble is clicked
class WebchatOpenedActionHandler implements ActionHandler {
  execute(): void {
    const chatbotConfig: Config = {
      botName: '하콘', // TODO: i18n 적용
      locale: window.localStorage.getItem('i18nextLng'),
      showPoweredBy: false,
    };
    window.botpressWebChat.configure(chatbotConfig);
  }
}

// Triggered when the webchat close button is clicked
class WebchatClosedActionHandler implements ActionHandler {
  execute(): void {}
}

// Triggered when the webchat is ready to accept events, like proactive triggers
class WebchatReadyActionHandler implements ActionHandler {
  execute(): void {
    showWelcomeMsg();
  }
}

class RouteActionHandler implements ActionHandler {
  private payload: QuickReplyPayload;
  private path: string = '';

  constructor(payload: QuickReplyPayload) {
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

const showWelcomeMsg = () => {
  window.botpressWebChat.sendEvent({
    type: 'proactive-trigger',
    channel: 'web',
    payload: { text: 'fake message' },
  });
};
