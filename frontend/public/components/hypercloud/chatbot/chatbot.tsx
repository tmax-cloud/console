import * as React from 'react';
import { getIngressUrl } from '../utils/ingress-utils';
import { ActionFactory } from './action';
import { Config } from './types';

const INJECTION_URL = '/assets/modules/channel-web/inject.js';
const INJECTION_ID = 'hypercloud-console-chatbot';
const WRAPPER_ID = `${INJECTION_ID}-wrapper`;
const BOT_ID = 'console-bot'; // 봇 아이디는 서버와 맞춰야 함. 변경 시 서버 담당자와 협의 필요
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
    const url = await getIngressUrl('chatbot');
    if (url) {
      host = url;
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
    const { data } = message;
    const action = ActionFactory.createActionHandler(data);
    action.execute();
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

export default Chatbot;
