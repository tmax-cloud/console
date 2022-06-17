export type uuid = string;

export enum MessageName {
  WEBCHAT_LOADED = 'webchatLoaded',
  WEBCHAT_OPENED = 'webchatOpened',
  WEBCHAT_CLOSED = 'webchatClosed',
  WEBCHAT_READY = 'webchatReady',
}

export enum PayloadType {
  QUICK_REPLY = 'quick_reply',
}

export interface Message {
  id?: uuid;
  authorId?: uuid;
  chatId?: string;
  conversationId?: uuid;
  name?: string;
  sentOn?: Date;
  payload?: any;
  type?: string;
  value?: string;
  source?: string;
  timeInMs?: number;
  __room?: string;
}

export interface Payload {
  type: string;
}

export interface TextPayload extends Payload {
  text: string;
}

export interface QuickReplyPayload extends Payload {
  text?: string;
  payload?: any;
}

export type MessagePayload = TextPayload | QuickReplyPayload;

interface Overrides {
  [componentToOverride: string]: [
    {
      module: string;
      component: string;
    },
  ];
}

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
  /** 레이아웃 높이 조절하는 버튼 활성화 유무
   * Defaults to 'true'
   */
  showResizeLayoutHeightButton?: boolean;
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
