import React, { Component, useState } from 'react';
import * as _ from 'lodash-es';
import { Link } from 'react-router-dom';
import * as hyperCloudLogoImg from '../imgs/gnb_logo_circle.svg';
// import { FLAGS, connectToFlags, flagPending } from '../features';
import { FLAGS, connectToFlags } from '../features';
import { authSvc } from '../module/auth';
import { Dropdown, ActionsMenu } from './utils';
import { coFetchJSON } from '../co-fetch';
import { SafetyFirst } from './safety-first';
// import LoginComponent from './login';
import { ExtendSessionModal_ } from './modals/extend-session-modal';
import { useTranslation, withTranslation } from 'react-i18next';
import { getAccessToken, getRefreshToken, setAccessToken, resetLoginState } from './utils/auth';

const developerConsoleURL = window.SERVER_FLAGS.developerConsoleURL;
const releaseModeFlag = window.SERVER_FLAGS.releaseModeFlag;
const HDCModeFlag = window.SERVER_FLAGS.HDCModeFlag;

const UserMenu = ({ username, actions }) => {
  const title = (
    <React.Fragment>
      <i className="pficon pficon-user co-masthead__user-icon" aria-hidden="true"></i>
      <span className="co-masthead__username">{username}</span>
    </React.Fragment>
  );
  if (_.isEmpty(actions)) {
    return title;
  }
  return <ActionsMenu actions={actions} title={title} noButton={true} />;
};
const LanguageMenu = ({ lang, actions }) => {
  const title = (
    <React.Fragment>
      <span className="co-masthead__username">{lang}</span>
    </React.Fragment>
  );
  if (_.isEmpty(actions)) {
    return title;
  }
  return <ActionsMenu actions={actions} title={lang} noButton={true} />;
};
const UserMenuWrapper = connectToFlags(
  FLAGS.AUTH_ENABLED,
  FLAGS.OPENSHIFT,
)(props => {
  // if (flagPending(props.flags[FLAGS.OPENSHIFT]) || flagPending(props.flags[FLAGS.AUTH_ENABLED])) {
  //   return null;
  // }
  const { t } = useTranslation();

  const actions = [];
  // if (props.flags[FLAGS.AUTH_ENABLED]) {
  //   const logout = e => {
  //     e.preventDefault();
  //     if (props.flags[FLAGS.OPENSHIFT]) {
  //       authSvc.deleteOpenShiftToken().then(() => authSvc.logout());
  //     } else {
  //       authSvc.logout();
  //     }
  //   };
  // actions.push({
  //   label: 'Logout',
  //   callback: logout
  // });
  // }
  const logout = e => {
    props.setLoading();
    e.preventDefault();

    // TODO 로그아웃 api 연동
    const AUTH_SERVER_URL = `${document.location.origin}/api/hypercloud/logout`;

    const json = {
      accessToken: getAccessToken(),
    };

    coFetchJSON
      .post(AUTH_SERVER_URL, json)
      .then(data => {
        props.setLoading();
        resetLoginState();
        localStorage.removeItem('bridge/last-namespace-name');

        // const url_ = window.location.href.split('/')[2]
        window.location.href = `${document.location.origin}`;
      })
      .catch(error => {
        props.setLoading();
        console.log(error);
      });
  };
  actions.push({
    label: t('CONTENT:LOGOUT'),
    callback: logout,
  });
  // if (props.flags[FLAGS.OPENSHIFT]) {
  return <OSUserMenu actions={actions} />;
  // }

  actions.unshift({
    label: 'My Account',
    href: '/settings/profile',
  });

  return authSvc.userID() ? <UserMenu actions={actions} username={authSvc.name()} /> : null;
});

const LanguageWrapper = props => {
  const { t } = useTranslation();
  const lang = t('CONTENT:LANGUAGE');
  const actions = [];
  const enChange = e => {
    e.preventDefault();
    i18n.changeLanguage('en');
    window.localStorage.setItem('i18nextLng', 'en');
  };
  const koChange = e => {
    e.preventDefault();
    i18n.changeLanguage('ko');
    window.localStorage.setItem('i18nextLng', 'ko');
  };
  actions.push({
    label: 'EN-US',
    callback: enChange,
  });
  actions.push({
    label: 'KO',
    callback: koChange,
  });
  return <LanguageMenu lang={lang} actions={actions} />;
};

class OSUserMenu extends SafetyFirst {
  constructor(props) {
    super(props);
    this.state = {
      username: undefined,
    };
  }

  componentDidMount() {
    super.componentDidMount();
    this._getUserInfo();
  }

  _getUserInfo() {
    // TODO 유저 정보 조회 서비스 연동
    if (getAccessToken() && getRefreshToken()) {
      // const userRole = JSON.parse(atob(window.sessionStorage.getItem('accessToken').split('.')[1])).role;
      // if (userRole !== 'cluster-admin') {
      //   this.setState({ username: 'User' });
      // } else {
      //   this.setState({ username: 'Admin' });
      // }
      const userName = JSON.parse(atob(getAccessToken().split('.')[1])).id;
        this.setState({ username: userName });
    } else {
      this.setState({ username: 'admin@tmax.co.kr' });
    }
  }

  render() {
    const username = this.state.username;
    return username ? <UserMenu actions={this.props.actions} username={username} /> : null;
  }
}
export default withTranslation()(OSUserMenu);

const ContextSwitcher = () => {
  const items = {
    [`${developerConsoleURL}catalog`]: 'Service Catalog',
    [`${developerConsoleURL}projects`]: 'Application Console',
    [window.SERVER_FLAGS.basePath]: 'Cluster Console',
  };

  return (
    <div className="contextselector-pf">
      <Dropdown title="Cluster Console" items={items} selectedKey={window.SERVER_FLAGS.basePath} dropDownClassName="bootstrap-select btn-group" onChange={url => (window.location.href = url)} />
    </div>
  );
};

export const LogoImage = () => {
  let logoImg = hyperCloudLogoImg;
  let logoAlt = 'HyperCloud';

  // Webpack won't bundle these images if we don't directly reference them, hence the switch

  return (
    <div className="co-masthead__logo">
      <Link to="/" className="co-masthead__logo-link">
        <img src={logoImg} alt={logoAlt} />
      </Link>
    </div>
  );
};

let timerID = 0;
let expTime = 0;

export class ExpTimer extends Component {
  state = {
    expMin: '',
    expSec: '',
  };

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    if (getAccessToken()) {
      const curTime = new Date();
      const tokenExpTime = new Date(JSON.parse(atob(getAccessToken().split('.')[1])).exp * 1000);

      const logoutTime = (tokenExpTime.getTime() - curTime.getTime()) / 1000;
      if (logoutTime < 0) {
        resetLoginState();
        window.location.href = `${document.location.origin}`;
      }

      expTime = logoutTime;
      timerID = window.setInterval(() => this.tick(), 1000);
    } else {
      return;
    }
  }

  tokRefresh() {
    const curTime = new Date();
    const tokenExpTime = new Date(JSON.parse(atob(getAccessToken().split('.')[1])).exp * 1000);

    const logoutTime = (tokenExpTime.getTime() - curTime.getTime()) / 1000;
    if (logoutTime < 0) {
      resetLoginState();
      window.location.href = `${document.location.origin}`;
    }

    expTime = logoutTime;
  }

  componentDidUpdate() {
    // console.log('ExpTimer componentDidUpdate');
    if (!getAccessToken() || !getRefreshToken()) {
      resetLoginState();
      window.location.href = `${document.location.origin}`;
    }
  }

  componentWillUnmount() {
    // 타이머 등록 해제
    window.clearInterval(timerID);
  }

  numFormat(num) {
    var val = Number(num).toString();
    if (num < 10 && val.length == 1) {
      val = '0' + val;
    }
    return val;
  }

  tick() {
    if (HDCModeFlag) {
      const curTime = new Date();
        if (!getAccessToken()) {
          resetLoginState();
          window.location.href = `${document.location.origin}`;
          return;
        }

      const tokenExpTime = new Date(JSON.parse(atob(getAccessToken().split('.')[1])).exp * 1000);
      const logoutTime = (tokenExpTime.getTime() - curTime.getTime()) / 1000;
      if (logoutTime < 0) {
        resetLoginState();
        window.location.href = `${document.location.origin}`;
      }

      expTime = logoutTime;
    } else {
      expTime -= 1;
    }
    
    // Test 용으로 짝수 분에 튕기도록
    if (expTime === 0 || expTime < 0 /*|| Math.floor(expTime / 60 % 2) === 0*/) {
      resetLoginState();
      window.location.href = `${document.location.origin}`;
    }
    // console.log(Math.floor(expTime / 60) + " Min " + Math.floor(expTime % 60) + " Sec");
    this.setState({ expMin: this.numFormat(Math.floor(expTime / 60)) });
    this.setState({ expSec: this.numFormat(Math.floor(expTime % 60)) });
  }

  render() {
    const { expMin, expSec } = this.state;
    return (
      <div className="exp-timer">
        <i className="fa fa-clock-o" aria-hidden="true"></i>
        <span className="co-masthead__timer__span">
          <span>{expMin}</span>:<span>{expSec}</span>
        </span>
      </div>
    );
  }
}

export const Masthead = props => {
  let timerRef = null;
  const [tokenTime, setTokenTime] = useState(60);
  const { t } = useTranslation();
  const setExpireTime = time => {
    setTokenTime(time);
  };

  const tokenRefresh = () => {
    const AUTH_SERVER_URL = `${document.location.origin}/api/hypercloud/refresh`;
    const json = {
      accessToken: getAccessToken(),
      refreshToken: getRefreshToken(),
      atExpireTime: Number(tokenTime), // Number
    };

    coFetchJSON
      .post(AUTH_SERVER_URL, json)
      .then(data => {
        // console.log(data);
        if (data.accessToken) {
          setAccessToken(data.accessToken);
          timerRef.tokRefresh();
          return;
        } else {
          return;
        }
      })
      .catch(error => {
        console.log(error);
      });
  };

  return (
    <header role="banner" className="co-masthead">
      <LogoImage />
      {developerConsoleURL && (
        <div className="co-masthead__console-picker">
          <ContextSwitcher />
        </div>
      )}
      {releaseModeFlag && (
        <div className="co-masthead__timer">
          <ExpTimer
            ref={input => {
              timerRef = input;
            }}
          />
        </div>
      )}
      {releaseModeFlag && (
        <div className="co-masthead__expire">
          <button className="btn btn-token-refresh" id="token-refresh" onClick={tokenRefresh}>
            {t('CONTENT:EXTEND')}
          </button>
          {!HDCModeFlag && <i className="fa fa-cog extend-refresh-icon" onClick={() => ExtendSessionModal_({ setExpireTimeFunc: setExpireTime })}></i>}
          <div className="extend-refresh-border"></div>
        </div>
      )}
      <div className="co-masthead__lang">
        <LanguageWrapper />
      </div>
      {/* {releaseModeFlag && ( */}
      <div className="co-masthead__user">
        <UserMenuWrapper setLoading={props.setLoading} />
      </div>
      {/* )} */}
    </header>
  );
};
