import * as React from 'react';
import { getAccessToken } from '@console/internal/hypercloud/auth';
import { ingressUrlWithLabelSelector } from './utils/ingress-utils';
import { coFetchJSON } from '@console/internal/co-fetch';

const INJECTION_URL = '/assets/modules/channel-web/inject.js';
const INJECTION_ID = 'hypercloud-console-chatbot';
const WRAPPER_ID = `${INJECTION_ID}-wrapper`;
const BOT_ID = 'hypercloud-console-bot';
const CHAT_ID = 'bp-widget';

let host = '';
let intervalId: ReturnType<typeof setInterval>;

export const hideChatbot = () => window.SERVER_FLAGS.chatbotEmbed && window.botpressWebChat.sendEvent({ type: 'hide' });

const Chatbot = () => {
  const [chatbotLoaded, setChatbotLoaded] = React.useState(false);

  const loadChatbot = async () => {
    if (document.getElementById(INJECTION_ID)) {
      setChatbotLoaded(true);
      return;
    }

    // 인그레스 host 조회
    const ingressUrl = ingressUrlWithLabelSelector({ 'ingress.tmaxcloud.org/name': 'chatbot' });
    const { items } = await coFetchJSON(ingressUrl);
    if (items?.length > 0) {
      const hostUrl = items[0].spec?.rules?.[0]?.host;
      if (!!hostUrl) {
        host = `https://${hostUrl}`;
      }
    }

    const script = window.document.createElement('script');
    script.src = `${host}${INJECTION_URL}`;
    script.id = INJECTION_ID;
    window.document.body.appendChild(script);

    intervalId = setInterval(() => {
      // chatbot이 추가되면 초기화(init)할 준비가 되기까지 일정 시간 소요
      if (window.botpressWebChat) {
        setChatbotLoaded(true);
        clearInterval(intervalId);
      }
    }, 500);
  };

  const chatbotEventListener = (message: MessageEvent) => {
    switch (message.data.name) {
      case 'webchatLoaded':
        // Triggered when the webchat is loaded and ready to be opened
        break;
      case 'webchatOpened':
        // Triggered when the webchat button bubble is clicked
        const chatbotConfig: Config = {
          botName: '하콘', // TODO: i18n 적용
          locale: window.localStorage.getItem('i18nextLng'),
          showPoweredBy: false,
        };
        window.botpressWebChat.configure(chatbotConfig);
        break;
      case 'webchatClosed':
        // Triggered when the webchat close button is clicked
        break;
      case 'webchatReady':
        // Triggered when the webchat is ready to accept events, like proactive triggers
        window.botpressWebChat.sendEvent({ type: 'token_event', channel: 'web', somedata: getAccessToken() });
        break;
      default:
        break;
    }
  };

  React.useEffect(() => {
    loadChatbot();
    window.addEventListener('message', chatbotEventListener);
    return () => window.removeEventListener('message', chatbotEventListener);
  }, []);

  React.useEffect(() => {
    if (!chatbotLoaded) {
      return;
    }

    // init chatbot
    const chatbotInitConfig: Config = { host, botId: BOT_ID };
    window.botpressWebChat.init(chatbotInitConfig, `#${WRAPPER_ID}`);

    // GNB보다 z-index 높도록 설정
    const wrapper = window.document.getElementById(CHAT_ID);
    wrapper.style.zIndex = '301';
  }, [chatbotLoaded]);

  return <div id={WRAPPER_ID} />;
};

// https://github.com/botpress/botpress/blob/master/modules/channel-web/src/views/lite/typings.d.ts
export interface Config {
  host?: string;
  botId?: string;
  externalAuthToken?: string;
  userId?: string;
  conversationId?: uuid;
  /** Allows to set a different user id for different windows (eg: studio, specific bot, etc) */
  userIdScope?: string;
  /** Defaults to 'true' */
  enableReset?: boolean;
  stylesheet?: string;
  isEmulator?: boolean;
  extraStylesheet?: string;
  /** Defaults to 'true' */
  showConversationsButton?: boolean;
  /** Defaults to 'false' */
  showUserName?: boolean;
  /** Defaults to 'false' */
  showUserAvatar?: boolean;
  /** Defaults to 'false' */
  showTimestamp?: boolean;
  /** Defaults to 'true' */
  enableTranscriptDownload?: boolean;
  /** Defaults to 'false' */
  enableConversationDeletion?: boolean;
  /** Defaults to 'false' */
  enableArrowNavigation?: boolean;
  /** Defaults to 'true' */
  closeOnEscape?: boolean;
  botName?: string;
  composerPlaceholder?: string;
  avatarUrl?: string;
  /** Force the display language of the webchat (en, fr, ar, ru, etc..)
   * Defaults to the user's browser language if not set
   * Set to 'browser' to force use the browser's language
   */
  locale?: 'browser' | string;
  /** Small description written under the bot's name */
  botConvoDescription?: string;
  /** Replace or insert components at specific locations */
  overrides?: Overrides;
  /** When true, the widget button is hidden
   * Defaults to 'false'
   */
  hideWidget?: boolean;
  /** Disable the slide in / out animations of the webchat
   * Defaults to 'false'
   */
  disableAnimations?: boolean;
  /** When true, sets ctrl+Enter as shortcut for reset session then send
   * Defaults to 'false'
   */
  enableResetSessionShortcut?: boolean;
  /** When true, webchat tries to use native webspeech api (uses hosted mozilla and google voice services)
   * Defaults to 'false'
   */
  enableVoiceComposer?: boolean;
  recentConversationLifetime?: string;
  startNewConvoOnTimeout?: boolean;
  /** Use sessionStorage instead of localStorage, which means the session expires when tab is closed
   * Defaults to 'false'
   */
  useSessionStorage?: boolean;
  containerWidth?: string | number;
  layoutWidth?: string | number;
  showPoweredBy?: boolean;
  /** When enabled, sent messages are persisted to local storage (recall previous messages)
   * Defaults to 'true'
   */
  enablePersistHistory?: boolean;
  /** Experimental: expose the store to the parent frame for more control on the webchat's behavior */
  exposeStore?: boolean;
  /** Reference ensures that a specific value and its signature are valid */
  reference?: string;
  /** If true, Websocket is created when the Webchat is opened. Bot cannot be proactive. */
  lazySocket?: boolean;
  /** If true, chat will no longer play the notification sound for new messages. */
  disableNotificationSound?: boolean;
  /** Refers to a specific webchat reference in parent window. Useful when using multiple chat window */
  chatId?: string;
  /** CSS class to be applied to iframe */
  className?: string;
  /** Force the display to use a specific mode (Fullscreen or Embedded)
   * Defaults to 'Embedded'
   */
  viewMode?: 'Embedded' | 'Fullscreen';
}

type uuid = string;

interface Overrides {
  [componentToOverride: string]: [
    {
      module: string;
      component: string;
    },
  ];
}

export default Chatbot;
