import React, { Component } from 'react';
//import { Link } from 'react-router-dom';
// import { Redirect } from 'react-router-dom';
//import { App } from './app';
import * as bgLoginNavy from '../imgs/bg_login_navy2.png';
import * as logoAc from '../imgs/logo_ac.svg';
import * as productHyperCloudLogo from '../imgs/product_hypercloud_logo.svg';
import { coFetchJSON } from '../co-fetch';
import '../style.scss';
import { sha512 } from 'js-sha512';

class LoginComponent extends Component {
  onClick = () => {
    const AUTH_SERVER_URL = 'http://192.168.6.225:8088/v3/_api/authenticate';
    
    let id = document.getElementById('loginId').value;
    let pw = document.getElementById('inputPassword').value;

    const json = {
      'dto':
      {
        'user_id': id, 'password': sha512(pw)
      }
    };

    coFetchJSON.post(AUTH_SERVER_URL, json)
      .then(data => {
        if (data.dto.result !== 'true') {
          return;
        }
        window.location = 'http://192.168.8.59:9000/status/all-namespaces';
      })
      .catch(error => {
        console.log(error);
      });
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
          <div className="inner_login">
            <form>
              <input type="hidden"></input>
              <input type="hidden"></input>
              <div className="box_login">
                <div className="inp_text">
                  <input type="text" id="loginId" autoFocus="autofocus" placeholder="Email"></input>
                </div>
                <div className="box_login">
                  <div className="inp_text">
                    <input type="password" id="inputPassword" placeholder="Password"></input>
                  </div>
                </div>
                <div className="box_error">
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