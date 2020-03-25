import * as _ from "lodash-es";
import "whatwg-fetch";

import { analyticsSvc } from "./module/analytics";
import { authSvc } from "./module/auth";
import store from "./redux";

const initDefaults = {
  headers: {},
  credentials: "same-origin"
};
// TODO: url can be url or path, but shouldLogout only handles paths
export const shouldLogout = url => {
  const k8sRegex = new RegExp(
    `^${window.SERVER_FLAGS.basePath}api/kubernetes/`
  );
  // 401 from k8s. show logout screen
  if (k8sRegex.test(url)) {
    // Don't let 401s from proxied services log out users
    const proxyRegex = new RegExp(
      `^${window.SERVER_FLAGS.basePath}api/kubernetes/api/v1/proxy/`
    );
    if (proxyRegex.test(url)) {
      return false;
    }
    const serviceRegex = new RegExp(
      `^${window.SERVER_FLAGS.basePath}api/kubernetes/api/v1/namespaces/\\w+/services/\\w+/proxy/`
    );
    if (serviceRegex.test(url)) {
      return false;
    }
    return true;
  }
  return false;
};

const validateStatus = (response, url) => {
  if (url.indexOf('logout') > 0) {
    if (response.status === 200) {
      return response;
    } 
  }
  if (response.ok) {
    return response;
  }

  if (response.status === 401 && shouldLogout(url)) {
    authSvc.logout(window.location.pathname);
  }

  const contentType = response.headers.get("content-type");
  if (!contentType || contentType.indexOf("json") === -1) {
    const error = new Error(response.statusText);
    error.response = response;
    throw error;
  }

  if (response.status === 403) {
    return response.json().then(json => {
      const error = new Error(
        json.message || "Access denied due to cluster policy."
      );
      error.response = response;
      throw error;
    });
  }

  return response.json().then(json => {
    const cause = _.get(json, "details.causes[0]");
    let reason;
    if (cause) {
      reason = `Error "${cause.message}" for field "${cause.field}".`;
    }
    if (!reason) {
      reason = json.message;
    }
    if (!reason) {
      reason = response.statusText;
    }
    if (!reason) {
      reason = json.error;
    }
    const error = new Error(reason);
    error.response = response;
    throw error;
  });
};

export class TimeoutError extends Error {
  constructor(url, ms, ...params) {
    super(`Call to ${url} timed out after ${ms}ms.`, ...params);
    // Dumb hack to fix `instanceof TimeoutError`
    Object.setPrototypeOf(this, TimeoutError.prototype);
  }
}

const cookiePrefix = "csrf-token=";
const getCSRFToken = () =>
  document &&
  document.cookie &&
  document.cookie
    .split(";")
    .map(c => _.trim(c))
    .filter(c => c.startsWith(cookiePrefix))
    .map(c => c.slice(cookiePrefix.length))
    .pop();

export const coFetch = (url, options = {}, timeout = 20000) => {
  if (url.indexOf('login') < 0 && url.indexOf('logout') < 0 && url.indexOf('tokenrefresh') < 0) {
    if (window.SERVER_FLAGS.releaseModeFlag && (!window.localStorage.getItem('accessToken') || !window.localStorage.getItem('refreshToken'))) {
      return;
    }
  }

  const allOptions = _.defaultsDeep({}, initDefaults, options);
  if (allOptions.method !== "GET") {
    allOptions.headers["X-CSRFToken"] = getCSRFToken();
  }
  // If the URL being requested is absolute (and therefore, not a local request),
  // remove the authorization header to prevent credentials from leaking.

  if (url.indexOf("://") >= 0) {
    delete allOptions.headers.Authorization;
    delete allOptions.headers["X-CSRFToken"];
  }

  if (url.indexOf('login') < 0 && url.indexOf('logout') < 0 && url.indexOf('tokenrefresh') < 0) {
    if (!window.SERVER_FLAGS.releaseModeFlag) {
      allOptions.headers.Authorization =
      "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJUbWF4LVByb0F1dGgtV2ViSG9vayIsImlkIjoid3ltaW4tdG1heC5jby5rciIsImV4cCI6MTU4MzEyMTQ5M30.hjvrlaLDFuSjchJKarGKbuWOuafhsuCQgBDo-pqsZvg";
    } else {
      allOptions.headers.Authorization = "Bearer " + window.localStorage.getItem('accessToken');
    }
  }
  
  // Initiate both the fetch promise and a timeout promise
  return Promise.race([
    fetch(url, allOptions).then(response => validateStatus(response, url)),
    new Promise((unused, reject) =>
      setTimeout(() => reject(new TimeoutError(url, timeout)), timeout)
    )
  ]);
};

const parseJson = response => response.json();

export const coFetchUtils = {
  parseJson
};

export const coFetchJSON = (url, method = "GET", options = {}) => {
  if (url.indexOf('login') < 0 && url.indexOf('logout') < 0 && url.indexOf('tokenrefresh') < 0) {
    if (window.SERVER_FLAGS.releaseModeFlag && (!window.localStorage.getItem('accessToken') || !window.localStorage.getItem('refreshToken'))) {
      return;
    }
  }

  const headers = { Accept: "application/json" };
  const { kind, name } = store.getState().UI.get("impersonate", {});
  if ((kind === "User" || kind === "Group") && name) {
    // Even if we are impersonating a group, we still need to set Impersonate-User to something or k8s will complain
    headers["Impersonate-User"] = name;
    if (kind === "Group") {
      headers["Impersonate-Group"] = name;
    }
  }

  if (url === 'openapi/v2') {
    // url = `https://192.168.6.169:6443/openapi/v2`;
    url = `${document.location.origin}/openapi/v2`;
  }
  // if
  // Pass headers last to let callers to override Accept.
  const allOptions = _.defaultsDeep({ method }, options, { headers });
  // allOptions.headers.Authorization =
  //   "Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6Im9FUU9CQWpDSXBVeXNFeEtLV2xtRjc2aEZidy1ES1ViYlNxdFExX0s0cWsifQ.eyJpc3MiOiJrdWJlcm5ldGVzL3NlcnZpY2VhY2NvdW50Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9uYW1lc3BhY2UiOiJkZWZhdWx0Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZWNyZXQubmFtZSI6ImFkbWluLXRva2VuLTR2Mm1zIiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZXJ2aWNlLWFjY291bnQubmFtZSI6ImFkbWluIiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZXJ2aWNlLWFjY291bnQudWlkIjoiZTMyM2U3MGUtYmY1ZC00MTQwLTgxZmUtYzkwMmUxNmI1MWJhIiwic3ViIjoic3lzdGVtOnNlcnZpY2VhY2NvdW50OmRlZmF1bHQ6YWRtaW4ifQ.cLYwNQ2dTRS2XE2IHnMhzaRMPhTxjs89cqV13LWUs_YwJyeljWRpjmes9bwXl4OzbZB8hwLcKXz1oLrk6eYYeDRCEhgoxr4Rjxe-uw7VJca5uFi6q-Gq0fU6nXvKBQ00Uu5O1Gx4sW2rio0jmvT5yDl-ALcyzrrtzLrxDwSsuvhjj2z_iJqC_RCqE0-ZXKITiGuNTqzNnqWYtelUmp8xTEjUBYx6BHUfh69kKUhbk3Wro_4uF-aFBQaMeEsOOGucZRIajwgR6VP9xplNMB6eMxBzX9Gkcn5QNDeoiRlbpjh4MGsqXAIrUFntK4ZBSL_VYoCLHfLjuZTjaiPxAXxzMA";
  return coFetch(url, allOptions).then(response => {
    if (url === 'openapi/v2' && response.ok) {
      return response;
    }
    
    if (!response.ok) {
      return response.text().then(text => {
        analyticsSvc.error(`${text}: ${method} ${response.url}`);
      });
    }

    // If the response has no body, return promise that resolves with an empty object
    if (response.headers.get("Content-Length") === "0") {
      return Promise.resolve({});
    }
    
    if (url.indexOf('logout') > 0) {
      return response;
    }
    
    return response.json();
  });
};

const coFetchSendJSON = (url, method, json = null, options = {}) => {
  const allOptions;

  if (url.indexOf('login') > 0 || url.indexOf('logout') > 0 || url.indexOf('tokenrefresh') > 0) {
    allOptions = {
      headers: {
        Accept: 'application/json'
      }
    };
  } else if ((!_.isEmpty(options)) && options.path === 'status') {
    allOptions = {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/merge-patch+json;application/json-patch+json'
      }
    };
  } else {
    allOptions = {
      headers: {
        Accept: 'application/json',
        'Content-Type': `application/${
          method === 'PATCH' ? 'json-patch+json' : 'json'
          };charset=UTF-8`
      }
    };
    console.log(allOptions);
  }


  // allOptions.headers.Authorization =
  //   "Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6Im9FUU9CQWpDSXBVeXNFeEtLV2xtRjc2aEZidy1ES1ViYlNxdFExX0s0cWsifQ.eyJpc3MiOiJrdWJlcm5ldGVzL3NlcnZpY2VhY2NvdW50Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9uYW1lc3BhY2UiOiJkZWZhdWx0Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZWNyZXQubmFtZSI6ImFkbWluLXRva2VuLTR2Mm1zIiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZXJ2aWNlLWFjY291bnQubmFtZSI6ImFkbWluIiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZXJ2aWNlLWFjY291bnQudWlkIjoiZTMyM2U3MGUtYmY1ZC00MTQwLTgxZmUtYzkwMmUxNmI1MWJhIiwic3ViIjoic3lzdGVtOnNlcnZpY2VhY2NvdW50OmRlZmF1bHQ6YWRtaW4ifQ.cLYwNQ2dTRS2XE2IHnMhzaRMPhTxjs89cqV13LWUs_YwJyeljWRpjmes9bwXl4OzbZB8hwLcKXz1oLrk6eYYeDRCEhgoxr4Rjxe-uw7VJca5uFi6q-Gq0fU6nXvKBQ00Uu5O1Gx4sW2rio0jmvT5yDl-ALcyzrrtzLrxDwSsuvhjj2z_iJqC_RCqE0-ZXKITiGuNTqzNnqWYtelUmp8xTEjUBYx6BHUfh69kKUhbk3Wro_4uF-aFBQaMeEsOOGucZRIajwgR6VP9xplNMB6eMxBzX9Gkcn5QNDeoiRlbpjh4MGsqXAIrUFntK4ZBSL_VYoCLHfLjuZTjaiPxAXxzMA";
  if (json) {
    allOptions.body = JSON.stringify(json);
  }
  return coFetchJSON(url, method, _.defaultsDeep(allOptions, options));
};

coFetchJSON.delete = (url, options = {}, json = null) => {
  return json
    ? coFetchSendJSON(url, "DELETE", json, options)
    : coFetchJSON(url, "DELETE", options);
};
coFetchJSON.post = (url, json, options = {}) =>
  coFetchSendJSON(url, "POST", json, options);
coFetchJSON.put = (url, json, options = {}) =>
  coFetchSendJSON(url, "PUT", json, options);
coFetchJSON.patch = (url, json, options = {}) =>
  coFetchSendJSON(url, "PATCH", json, options);
