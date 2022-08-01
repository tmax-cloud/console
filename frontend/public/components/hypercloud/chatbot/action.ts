import { history } from '@console/internal/components/utils';
import { allModels } from '@console/internal/module/k8s/k8s-models';
import { getResourceStatus } from './status';
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
          case PayloadType.SESSION_RESET:
            return new SessionResetActionHandler();
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

class SessionResetActionHandler implements ActionHandler {
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
    const data = this.payload?.statusView;
    if (!data) {
      return;
    }

    const namespaced = allModels().find(model => model.plural === data.resource)?.namespaced;
    let _path = `/k8s/${data?.namespace ? `ns/${data.namespace}` : namespaced ? 'all-namespaces' : 'cluster'}/${data.resource}`;

    // make a search query
    if (data.status) {
      const status = getResourceStatus(data?.resource);
      if (status) {
        let query = '';
        let params = status[data.status].join(',');
        query = `rowFilter-${status.queryParam}=` + encodeURIComponent(params);
        _path = [_path, query].join('?');
      }
    }

    this.path = _path;
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
