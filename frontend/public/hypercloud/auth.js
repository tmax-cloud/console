export const SHOW_ALERT_IN_SINGLECLUSTER_NODEPAGE = 'show-alert-in-singlecluster-nodepage'
export const SHOW_ALERT_IN_SINGLECLUSTER_PODPAGE = 'show-alert-in-singlecluster-podpage'
export const SHOW_ALERT_IN_SAMPLEPAGE = 'show-alert-in-samplepage'


export const getId = function () {
  return sessionStorage.getItem('id');
};

export const getUserGroup = function () {
  let usergroups = getParsedAccessToken().group;
  let result = '';
  if (usergroups?.length > 0) {
    result = '&' + usergroups.map(cur => `userGroup=${cur}`).join('&');
  }
  return result;
};

export const getAuthUrl = function () {
  return getParsedAccessToken().iss || '';
};

export const setIdToken = function (token) {
  sessionStorage.setItem('idToken', token);
  return;
};

export const getIdToken = function () {
  return sessionStorage.getItem('idToken');
};

export const setAccessToken = function (token) {
  sessionStorage.setItem('accessToken', token);
  return;
};

export const getAccessToken = function () {
  return sessionStorage.getItem('accessToken');
};

export const setId = function (id) {
  sessionStorage.setItem('id', id);
  return;
};

// 로그아웃 시 사용
export const resetLoginState = function () {
  sessionStorage.clear();
  return;
};

export const getParsedAccessToken = function () {
  const token = getIdToken();
  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  var jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join(''),
  );

  return JSON.parse(jsonPayload);
};
