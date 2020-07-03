import React, { Component } from 'react';
import * as bgLoginNavy from '../imgs/bg_login_navy2.png';
import * as logoAc from '../imgs/logo_ac.svg';
import * as productHyperCloudLogo from '../imgs/product_hypercloud_logo.svg';
import { coFetchJSON } from '../co-fetch';
import { sha512 } from 'js-sha512';
import { Loading } from './utils';
import { setAccessToken, setRefreshToken, setId, getAccessToken } from './utils/auth';
import { OtpModal_ } from './modals/otp-modal';

class LoginComponent extends Component {
  state = {
    id: '',
    pw: '',
    error: '',
    loading: false,
    capsLockShow: false,
    altShow: false,
  };

  constructor(props) {
    super(props);
    localStorage.removeItem('bridge/last-namespace-name');

    let at = getAccessToken();

    if (window.SERVER_FLAGS.HDCModeFlag) {
      at ? (location.href = `${document.location.origin}`) : (location.href = window.SERVER_FLAGS.TmaxCloudPortalURL + '?redirect=console');
      return;
    }

    if (at) {
      // if (!document.referrer) {
      props.history.replace('/');
    } else {
      //   props.history.goForward();
      history.pushState(null, null, location.href);
      window.onpopstate = function () {
        history.go(1);
      };
    }

    return;
  }

  _login(userInfo) {
    const uri = `${document.location.origin}/api/hypercloud/login`;
    coFetchJSON.post(uri, userInfo).then(data => {
      this.setState({ loading: false });
      if (data.accessToken && data.refreshToken) {
        setAccessToken(data.accessToken);
        setRefreshToken(data.refreshToken);
        setId(JSON.parse(atob(data.accessToken.split('.')[1])).id);

        localStorage.getItem('forceLogout') ? localStorage.removeItem('forceLogout') : localStorage.setItem('forceLogout', true);
        location.href = `${document.location.origin}`;
        // this.props.history.push('/');
        // this.props.history.go(0);
      } else {
        if (data.msg) {
          this.setState({ error: data.msg });
          return;
        }
      }
    });
  }

  onClick = e => {
    if (e.type === 'keypress' && e.key !== 'Enter') {
      return;
    }
    this.setState({ loading: true });
    const AUTH_SERVER_URL = `${document.location.origin}/api/hypercloud/otp`;

    const json = {
      id: this.state.id,
      password: sha512(this.state.pw),
    };
    coFetchJSON
      .post(AUTH_SERVER_URL, json)
      .then(data => {
        const curTime = new Date();
        this.setState({ loading: false });
        // ID나 pw 가 틀린경우
        if (data.msg) {
          this.setState({ error: data.msg });
          return;
        }
        //otp인증을 해야하는 경우
        data.otpEnable
          ? OtpModal_({ data: json, initialTime: curTime })
          : // 로그인서비스 콜
          this._login(json);
        return;
      })
      .catch(error => {
        console.log(error.message);
        this.setState({ error: error.message });
        this.setState({ loading: false });
      });
  };

  onChange = e => {
    this.setState({ altShow: /[ㄱ-ㅎㅏ-ㅡ가-핳]/.test(e.target.value) });
    this.setState({ id: e.target.value.replace(/[ㄱ-ㅎㅏ-ㅡ가-핳]/g, '') });
    return;
  };

  onKeyUp = e => {
    this.setState({ capsLockShow: e.getModifierState('CapsLock') });
  };

  render() {
    return (
      <div id="login">
        <div id="bg-large">
          <div>
            <img src={bgLoginNavy} className="bg-navy" />
          </div>
          <div id="bg-big-blank" className="bg-blank"></div>
        </div>
        <div id="bg-small">
          <div>
            <div id="bg-small-middle" className="bg-blank"></div>
            <div id="bg-small-blank"></div>
          </div>
        </div>
        <div id="contents">
          <div className="inner_logo">
            <div id="bg-logo-ac">
              <img src={logoAc} />
            </div>
            <div id="bg-logo-hc" className="logo">
              <img src={productHyperCloudLogo} />
            </div>
          </div>
          {this.state.loading && <Loading />}
          <div className="inner_login">
            <form>
              <input type="hidden"></input>
              <input type="hidden"></input>

              <div className="box_login">
                <div className="inp_text">
                  <input type="text" id="loginId" autoFocus="autofocus" placeholder="ID" value={this.state.id} onKeyPress={this.onClick} onChange={this.onChange} onKeyUp={this.onKeyUp}></input>
                  {this.state.capsLockShow && <span className="tooltip">Caps Lock이 켜져 있습니다.</span>}
                  {this.state.altShow && <span className="tooltip">한/영키가 켜져 있습니다.</span>}
                </div>
                <div className="box_login">
                  <div className="inp_text">
                    <input
                      type="password"
                      id="inputPassword"
                      placeholder="Password"
                      value={this.state.pw}
                      onKeyPress={this.onClick}
                      onChange={e => {
                        this.setState({ pw: e.target.value });
                      }}
                    ></input>
                  </div>
                </div>
                <div className="box_error">
                  <p className="error_text">{this.state.error}</p>
                </div>
                <div>
                  <button type="button" onClick={this.onClick} className="btn_login" style={{ cursor: 'pointer' }}>
                    Login
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }
}
export default LoginComponent;
