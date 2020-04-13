import React, { Component, setState } from 'react';
//import { Link } from 'react-router-dom';
// import { Redirect } from 'react-router-dom';
//import { App } from './app';
import * as bgLoginNavy from '../imgs/bg_login_navy2.png';
import * as logoAc from '../imgs/logo_ac.svg';
import * as productHyperCloudLogo from '../imgs/product_hypercloud_logo.svg';
import { coFetchJSON } from '../co-fetch';
import { sha512 } from 'js-sha512';
import { Loading } from './utils';

class LoginComponent extends Component {
  // useState 대신 useRef 써도 됨
  state = {
    id: '',
    pw: '',
    error: '',
    loading: false
  };

  constructor(props) {
    super(props);

    if (props.history.action === 'POP') {
      history.go(1);
    }

    if (document.referrer) {
      history.pushState(null, null, location.href);
      window.onpopstate = function (event) {
        history.go(1);
      }
      // if (sessionStorage.getItem('accessToken') === '') {
      //   // 로그아웃 된 상태 
      //   history.pushState(null, null, location.href);
      //   // this.props.history.push('/login');  
      //   window.onpopstate = function(event) {	
      //   history.go(1);
      // }

      // if (props.history.action !== 'REPLACE') {
      //   history.pushState(null, null, location.href);
      //   window.onpopstate = function(event) {	
      //   history.go(1);
      //   } 
      // }
    }
  }

  componentWillUnmount() {
    // console.log('componentWillUnmount');
  };

  onClick = (e) => {
    if (e.type === 'keypress' && e.key !== 'Enter') {
      return;
    }
    this.setState({ loading: true });
    const AUTH_SERVER_URL = `${document.location.origin}/api/hypercloud/login`;

    //if (this.state.id !== undefined && this.state.pw !== undefined) {
    const json = {
      'id': this.state.id,
      'password': sha512(this.state.pw)
    };
        
    coFetchJSON.post(AUTH_SERVER_URL, json)
      .then(data => {
        this.setState({ loading: false });
        if (data.accessToken && data.refreshToken) {
          window.sessionStorage.setItem('accessToken', data.accessToken);
          window.sessionStorage.setItem('refreshToken', data.refreshToken);
          if (window.localStorage.getItem('forceLogout') === 'true') {
            window.localStorage.setItem('forceLogout', false);
          } else {
            window.localStorage.setItem('forceLogout', true);
          }
          
        } else {
          // 로그인 실패 
          this.setState({ error: data.msg });
          return;
        }
        // const url_ = window.location.href.split('/login')[0]
        // window.location = `${url_}/status/all-namespaces`;
      })
      .then(() => {
        // 미리: split 버그 수정 
        if (window.sessionStorage.getItem('accessToken')) {
          const userRole = JSON.parse(atob(window.sessionStorage.getItem('accessToken').split('.')[1])).role;
          window.sessionStorage.setItem('role', userRole);
          this.props.history.push('/');
          this.props.history.go(0);
        }
      })
      .catch((error) => {
        console.log(error.message);
        this.setState({ error: error.message });
        this.setState({ loading: false });
      });
    //}
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
          { this.state.loading && <Loading />}
          <div className="inner_login">
            <form>
              <input type="hidden"></input>
              <input type="hidden"></input>
              <div className="box_login">
                <div className="inp_text">
                  <input type="text" id="loginId" autoFocus="autofocus" placeholder="Email" value={this.state.id} onKeyPress={this.onClick} onChange={(e) => { this.setState({ id: e.target.value }) }}></input>
                </div>
                <div className="box_login">
                  <div className="inp_text">
                    <input type="password" id="inputPassword" placeholder="Password" value={this.state.pw} onKeyPress={this.onClick} onChange={(e) => { this.setState({ pw: e.target.value }) }}></input>
                  </div>
                </div>
                <div className="box_error">
                  <p className="error_text">{this.state.error}</p>
                </div>
                <div>
                  <button type="button" onClick={this.onClick} className="btn_login" style={{ cursor: 'pointer' }}>Login</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };
};
export default LoginComponent;