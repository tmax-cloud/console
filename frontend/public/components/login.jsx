import React, { Component } from 'react';
//import { Link } from 'react-router-dom';
// import { Redirect } from 'react-router-dom';
//import { App } from './app';
import * as bgLoginNavy from '../imgs/bg_login_navy2.png';
import * as logoAc from '../imgs/logo_ac.svg';
import * as productHyperCloudLogo from '../imgs/product_hypercloud_logo.svg';
import { coFetchJSON } from '../co-fetch';
import '../style.scss';
// import axios from 'axios';
// import { ClusterOverviewPage } from './cluster-overview';

class LoginComponent extends Component {
  onClick = () => {
    let id = document.getElementById('loginId').value;
    let pw = document.getElementById('inputPassword').value;
    if (pw !== 'admin') {
      console.error('Email or Password Invalid');
      return;
    }
    const json = {
      'dto':
      {
        'user_id': id, 'password': 'c7ad44cbad762a5da0a452f9e854fdc1e0e7a52a38015f23f3eab1d80b931dd472634dfac71cd34ebc35d16ab7fb8a90c81f975113d6c7538dc69dd8de9077ec'
      }
    };

    // axios.post('http://172.22.6.8:8088/v3/_api/authenticate', json).then(response => {
    //   if (response.status !== 200) {
    //     console.log(response);
    //   } else {
    //     window.SERVER_FLAGS.googleTagManagerID = 'login';
    //     document.getElementsByTagName('header')[0].style.display = 'block';
    //     document.getElementById('sidebar').style.display = 'block';
    //     window.location = 'http://192.168.8.59:9000/status/all-namespaces';
    //     //return (<Redirect to="/status/all-namespaces" />);
    //   }
    // });

    coFetchJSON.post('http://172.22.6.8:8088/v3/_api/authenticate', json)
      .then(data => {
        document.getElementsByTagName('header')[0].style.display = 'block';
        document.getElementById('sidebar').style.display = 'block';

        window.location = 'http://192.168.8.59:9000/status/all-namespaces';
      })
      .catch(error => {
        console.log(error);
      });
  };
  constructor(props) {
    super(props);
    window.onload = function () {
      if (document.getElementsByTagName('header')[0] !== undefined && document.getElementsByTagName('header')[0] !== null) {
        document.getElementsByTagName('header')[0].style.display = 'none';
      }
      if (document.getElementById('sidebar') !== undefined && document.getElementById('sidebar') !== null) {
        document.getElementById('sidebar').style.display = 'none';
      }
    };
  }
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