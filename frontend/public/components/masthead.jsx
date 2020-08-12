import React, { Component } from 'react';
import * as _ from 'lodash-es';
import { Link } from 'react-router-dom';
import * as hyperCloudLogoImg from '../imgs/gnb_logo_circle.svg';
// import { FLAGS, connectToFlags, flagPending } from '../features';
import { FLAGS, connectToFlags } from '../features';
import { authSvc } from '../module/auth';
import { Dropdown, ActionsMenu } from './utils';
import { SafetyFirst } from './safety-first';
// import LoginComponent from './login';
import { ExtendSessionModal_ } from './modals/extend-session-modal';
import { NoticeExpirationModal_ } from './modals/notice-expiration-modal';
import { useTranslation, withTranslation } from 'react-i18next';
import { getAccessToken, getRefreshToken, setAccessToken, resetLoginState } from './utils/auth';
import i18n from 'i18next';

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
  const { t } = useTranslation();
  const actions = [];
  const manageAccount = e => {
    // console.log('manageAccount');
    window.open(props.keycloak.createAccountUrl());
  };
  const logout = e => {
    console.log('logout');
    props.keycloak.logout();
  };
  actions.push({
    label: '계정 관리',
    callback: manageAccount,
    link: true,
  });
  actions.push({
    label: t('CONTENT:LOGOUT'),
    callback: logout,
  });
  // if (props.flags[FLAGS.OPENSHIFT]) {
  return <OSUserMenu actions={actions} keycloak={props.keycloak} />;
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
    window.location.reload();
  };
  const koChange = e => {
    e.preventDefault();
    i18n.changeLanguage('ko');
    window.localStorage.setItem('i18nextLng', 'ko');
    window.location.reload();
  };
  actions.push({
    label: 'EN-US',
    callback: enChange,
  });
  actions.push({
    label: '한국어',
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
      const userName = this.props.keycloak.idTokenParsed.preferred_username;
      this.setState({ username: userName });
    } else {
      this.setState({ username: 'admin@tmax.co.kr' });
    }
  }

  render() {
    const { username } = this.state;
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
    expText: '',
    modalShow: false,
  };

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    if (getAccessToken()) {
      const curTime = new Date();
      const { keycloak } = this.props;
      const tokenExpTime = new Date((keycloak.idTokenParsed.exp + keycloak.timeSkew) * 1000);
      const logoutTime = (tokenExpTime.getTime() - curTime.getTime()) / 1000;

      expTime = logoutTime;
      timerID = window.setInterval(() => this.tick(), 1000);
    } else {
      return;
    }
  }

  tokRefresh() {
    const curTime = new Date();
    const { keycloak } = this.props;
    const tokenExpTime = new Date((keycloak.idTokenParsed.exp + keycloak.timeSkew) * 1000);
    console.log('curTime', curTime);
    console.log('exptime', new Date(keycloak.idTokenParsed.exp * 1000));
    console.log('tokenExpTime', tokenExpTime);

    const logoutTime = (tokenExpTime.getTime() - curTime.getTime()) / 1000;
    expTime = logoutTime;
  }

  closeModal() {
    this.setState({ modalShow: false });
  }

  componentDidUpdate() {
    if (!getAccessToken() || !getRefreshToken()) {
      resetLoginState();
      window.location.href = `${document.location.origin}`;
    }
  }

  componentWillUnmount() {
    // 타이머 등록 해제
    window.clearInterval(timerID);
  }

  expFormat() {
    let temp = Math.floor(expTime);
    const sec = temp % 60;
    temp = Math.floor(temp / 60);
    const min = temp % 60;
    temp = Math.floor(temp / 60);
    const hour = temp % 24;
    temp = Math.floor(temp / 24);
    const day = temp;
    const expText = (!!day ? day + 'day(s) ' : '') + (!!hour ? (hour < 10 ? '0' + hour : hour) + ':' : '') + (min < 10 ? '0' + min : min) + ':' + (sec < 10 ? '0' + sec : sec);

    this.setState({ expText: expText });
  }

  tick() {
    const { keycloak } = this.props;
    if (HDCModeFlag) {
      const curTime = new Date();
      const tokenExpTime = new Date((keycloak.idTokenParsed.exp + keycloak.timeSkew) * 1000);
      const logoutTime = (tokenExpTime.getTime() - curTime.getTime()) / 1000;

      expTime = logoutTime;
    } else {
      if (expTime > 0) {
        expTime -= 1;
      }
    }

    if (Math.floor(expTime) === 20) {
      NoticeExpirationModal_({ logout: this.props.logout, tokenRefresh: this.props.tokenRefresh, time: expTime });
    }

    this.expFormat();
  }

  render() {
    const { expText } = this.state;
    return (
      <div className="exp-timer">
        <i className="fa fa-clock-o" aria-hidden="true"></i>
        <span className="co-masthead__timer__span">
          <span>{expText}</span>
        </span>
      </div>
    );
  }
}

export const Masthead = connectToFlags(FLAGS.CAN_LIST_NS)(({ setLoading, flags, keycloak }) => {
  let timerRef = null;
  const { t } = useTranslation();

  const setExpireTime = time => {
    console.log('setExpireTime');
    tokenRefresh();
  };

  const tokenRefresh = () => {
    const curTime = new Date();
    const tokenExpTime = new Date((keycloak.idTokenParsed.exp + keycloak.timeSkew) * 1000);
    const logoutTime = (tokenExpTime.getTime() - curTime.getTime()) / 1000;
    keycloak
      .updateToken(Math.ceil(logoutTime))
      .then(refreshed => {
        console.log('refreshed', refreshed);
        if (refreshed) {
          // expired time < 60
          console.log('Token was successfully refreshed');
          setAccessToken(keycloak.idToken);
          timerRef.tokRefresh();
          console.log('keycloak', keycloak);
          console.log('idTokenParsed', keycloak.idTokenParsed);
          console.log('exp', keycloak.idTokenParsed.exp);
          console.log('tokenTimeoutHandle', keycloak.tokenTimeoutHandle);
        } else {
          // expired time > 60
          console.log('Token is still valid');
        }
      })
      .catch(() => {
        // refresh token 없음
        console.log('Failed to refresh the token, or the session has expired');
      });
  };

  const logout = e => {
    console.log('masthead logout');

    resetLoginState();
    keycloak.logout();
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
            logout={logout}
            tokenRefresh={tokenRefresh}
            keycloak={keycloak}
          />
        </div>
      )}
      {releaseModeFlag && (
        <div className="co-masthead__expire">
          <button className="btn btn-token-refresh" id="token-refresh" onClick={tokenRefresh}>
            {t('CONTENT:EXTEND')}
          </button>
          {!HDCModeFlag && flags.CAN_LIST_NS && <i className="fa fa-cog extend-refresh-icon" onClick={() => ExtendSessionModal_({ setExpireTimeFunc: setExpireTime, t: t })}></i>}
          {flags.CAN_LIST_NS && <div className="extend-refresh-border"></div>}
        </div>
      )}
      <div className="co-masthead__lang">
        <LanguageWrapper />
      </div>
      <div className="co-masthead__user">
        <UserMenuWrapper setLoading={setLoading} keycloak={keycloak} />
      </div>
    </header>
  );
});
