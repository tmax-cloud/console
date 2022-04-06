// Allow importing other file types
declare module '*.svg' {
  const value: any;
  export = value;
}
declare module '*.png' {
  const value: any;
  export = value;
}

declare interface Window {
  SERVER_FLAGS: {
    alertManagerBaseURL: string;
    authDisabled: boolean;
    basePath: string;
    branding: string;
    consoleVersion: string;
    customLogoURL: string;
    customProductName: string;
    documentationBaseURL: string;
    kubeAPIServerURL: string;
    kubeAdminLogoutURL: string;
    kubectlClientID: string;
    loadTestFactor: number;
    loginErrorURL: string;
    loginSuccessURL: string;
    loginURL: string;
    logoutRedirect: string;
    logoutURL: string;
    meteringBaseURL: string;
    prometheusBaseURL: string;
    prometheusTenancyBaseURL: string;
    requestTokenURL: string;
    alertManagerPublicURL: string;
    grafanaPublicURL: string;
    prometheusPublicURL: string;
    thanosPublicURL: string;
    statuspageID: string;
    GOARCH: string;
    GOOS: string;
    mcMode: boolean;
    showCustomPerspective: boolean;
    KeycloakAuthURL: string;
    KeycloakRealm: string;
    gitlabURL: string;
    singleClusterBasePath: string;
    svcType: string;
    chatbotEmbed: boolean;
  };
  windowError?: boolean | string;
  __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: Function;
  store?: {}; // Redux store
  pluginStore?: {}; // Console plugin store
  botpressWebChat: {
    init: (config: any, targetSelector?: string) => void;
    configure: (payload: any, chatId?: string) => void;
    sendEvent: (payload: any, webchatId?: string) => void;
    mergeConfig: (payload: any, chatId?: string) => void;
    sendPayload: (payload: any, chatId?: string) => void;
  };
}

// From https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-8.html
declare type Diff<T, K> = Omit<T, keyof K>;
