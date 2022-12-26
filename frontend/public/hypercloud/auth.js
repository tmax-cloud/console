import * as _ from 'lodash-es';
import store from '../redux';
import { coFetchJSON } from '../co-fetch';
import { setUser } from '@console/internal/actions/common';

const REQUEST_LOGOUT_URL = '/oauth2/sign_out';
const REQUEST_TOKEN_REFRESH_URL = '/oauth2/token';
const REQUEST_TOKEN_INFO_URL = '/oauth2/tokeninfo';

export const REQUEST_ACCOUNT_USERS_URL = '/oauth2/user/list';
export const REQUEST_ACCOUNT_GROUPS_URL = '/oauth2/group/list';

export const SHOW_ALERT_IN_SINGLECLUSTER_NODEPAGE = 'show-alert-in-singlecluster-nodepage'
export const SHOW_ALERT_IN_SINGLECLUSTER_PODPAGE = 'show-alert-in-singlecluster-podpage'
export const SHOW_ALERT_IN_SAMPLEPAGE = 'show-alert-in-samplepage'

const id = 'id';
const email = 'email';
const groups = 'groups';
const accountUrl = 'accountUrl';
const expireTime = 'expireTime';

export const getId = function() {
  return sessionStorage.getItem(id);
};

const getGroups = () => {
  try {
    return JSON.parse(sessionStorage.getItem(groups));
  } catch (error) {
    return null;
  }
};

export const getUserGroup = function() {
  const usergroups = getGroups();
  let result = '';
  if (usergroups?.length > 0) {
    result = '&' + usergroups.map(cur => `userGroup=${cur}`).join('&');
  }
  return result;
};

export const getAuthUrl = function() {
  return sessionStorage.getItem(accountUrl) || `${window.SERVER_FLAGS.KeycloakAuthURL}/realms/${window.SERVER_FLAGS.KeycloakRealm}`;
};

export const createAccountUrl = () => {
  const realm = getAuthUrl();
  let url;
  if (realm) {
    url = `${realm}/account?referrer=${encodeURIComponent(window.SERVER_FLAGS.KeycloakClientId)}&referrer_uri=${encodeURIComponent(location.href)}`;
  }
  return url;
};

/* NOT USED
export const setIdToken = function(token) {
  sessionStorage.setItem('idToken', token);
  return;
};

export const getIdToken = function() {
  return sessionStorage.getItem('idToken');
};

export const setAccessToken = function(token) {
  sessionStorage.setItem('accessToken', token);
  return;
};

export const getAccessToken = function() {
  return sessionStorage.getItem('accessToken');
};

export const setId = function(id) {
  sessionStorage.setItem('id', id);
  return;
};
*/

// 로그아웃 시 사용
export const resetLoginState = function() {
  sessionStorage.clear();
  return;
};

/* NOT USED
export const getParsedAccessToken = function() {
  const token = getIdToken();
  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  var jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join(''),
  );
  return JSON.parse(jsonPayload);
};
*/

const fetchUserinfo = async () => {
  try {
    const res = await coFetchJSON(REQUEST_TOKEN_INFO_URL);
    return res;
  } catch (err) {
    console.error('Failed to fetch user info ', err);
    return null;
  }
};

const fetchTokenExpireTime = async () => {
  try {
    const res = await coFetchJSON(REQUEST_TOKEN_INFO_URL);
    return res?.exp;
  } catch (err) {
    console.error('Failed to fetch token expiration time ', err);
    return null;
  }
};

const refreshToken = async () => {
  try {
    const res = await coFetchJSON(REQUEST_TOKEN_REFRESH_URL);
  } catch (error) {
    if (_.includes([401, 500], _.get(error, 'response.status'))) {
      console.error('Failed to refresh the token. The session has expired ', error);
      logout();
    }
    console.error('Failed to refresh the token ', error);
  }
};

export const tokenRefresh = () => {
  return new Promise(async (resolve, reject) => {
    try {
      await refreshToken();
      const _expireTime = await fetchTokenExpireTime();
      if (!_expireTime) {
        reject('Failed to get token expiration time');
        return;
      }
      sessionStorage.setItem(expireTime, _expireTime);
      resolve();
    } catch (error) {
      reject(error);
    }
  });
};

export const detectUser = () => {
  return new Promise(async (resolve, reject) => {
    try {
      await refreshToken();
      const info = await fetchUserinfo();
      if (!info) {
        logout();
        return;
      }
      resetLoginState();
      sessionStorage.setItem(id, info?.preferred_username);
      sessionStorage.setItem(email, info?.email);
      sessionStorage.setItem(groups, JSON.stringify(info?.group));
      sessionStorage.setItem(accountUrl, info?.iss);
      sessionStorage.setItem(expireTime, info?.exp);
      sessionStorage.setItem(SHOW_ALERT_IN_SINGLECLUSTER_NODEPAGE, 'true');
      sessionStorage.setItem(SHOW_ALERT_IN_SINGLECLUSTER_PODPAGE, 'true');
      sessionStorage.setItem(SHOW_ALERT_IN_SAMPLEPAGE, 'true');
      store.dispatch(setUser({ id: sessionStorage.getItem(id), email: sessionStorage.getItem(email), groups: sessionStorage.getItem(groups) }));
      resolve();
    } catch (error) {
      reject(error);
    }
  });
};

export const getLogoutTime = () => {
  const exp = sessionStorage.getItem(expireTime);
  if (!exp) {
    return 0;
  }
  const curTime = new Date();
  const tokenExpTime = new Date((exp - 1) * 1000);
  const logoutTime = (tokenExpTime.getTime() - curTime.getTime()) / 1000;
  return logoutTime < 0 ? 0 : logoutTime;
};

// 여러번 로그아웃되지 않도록 함
export const logout = _.once(() => {
  const realm = getAuthUrl();
  if (realm) {
    resetLoginState();
    const redirectUrl = `${realm}/protocol/openid-connect/logout?redirect_uri=${encodeURIComponent(location.origin)}`;
    window.location = `${location.origin}${REQUEST_LOGOUT_URL}?rd=${redirectUrl}`;
  }
});
