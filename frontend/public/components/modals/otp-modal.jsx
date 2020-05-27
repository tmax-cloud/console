import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { createModalLauncher, ModalTitle, ModalBody, ModalSubmitFooter } from '../factory/modal';
import { coFetchJSON } from '../../co-fetch';
import { setAccessToken, setRefreshToken } from '../utils/auth';
let timerID = 0;
class OtpModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            expMin: null,
            expSec: null,
            authNumber: null,
            data: this.props.data
        };
        this._cancel = props.cancel.bind(this);
        this._updateState = this._updateState.bind(this);
        this._submit = this._submit.bind(this);
        this.tick = this.tick.bind(this);
    }
    _updateState(event) {
        this.setState({ authNumber: event.target.value });
    }
    componentDidMount() {
        const initialTime = this.props.initialTime;
        const logoutTime = initialTime.setMinutes(initialTime.getMinutes() + 30);
        this.setState({ logoutTime: logoutTime });
        timerID = window.setInterval(() => this.tick(logoutTime), 1000);
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

    tick(logoutTime) {
        //남은시간 계산
        const curTime = new Date();
        const timeRemaining = (logoutTime - curTime.getTime()) / 1000;
        //0초이하로 카운트 되지 않도록 수정 
        let expMin = this.numFormat(Math.floor(timeRemaining / 60));
        let expSec = this.numFormat(Math.floor(timeRemaining % 60));
        if (expMin >= 0 && expSec >= 0) {
            this.setState({ expMin, expSec });
        } else {
            document.getElementById('error-timeout').style.visibility = 'visible';
        }
    }

    _submit(event) {
        event.preventDefault();
        // 인증번호, ID, PW로 서비스 호출 
        const AUTH_SERVER_URL = `${document.location.origin}/api/hypercloud/login`;
        // 입력된 인증번호가 6자리가 아닌경우 return
        if (this.state.authNumber.length !== 6) {
            document.getElementById('error-request').style.visibility = 'visible';
            return
        }
        let data = Object.assign(this.props.data, { otp: this.state.authNumber });
        coFetchJSON.post(AUTH_SERVER_URL, data)
            .then(response => {
                if (response.accessToken && response.refreshToken) {
                    setAccessToken(response.accessToken);
                    setRefreshToken(response.refreshToken);
                    if (window.localStorage.getItem('forceLogout') === 'true') {
                        window.localStorage.setItem('forceLogout', false);
                    } else {
                        window.localStorage.setItem('forceLogout', true);
                    }
                    history.pushState(null, null, '/status')
                    history.go(0);
                } else {
                    document.getElementById('error-request').style.visibility = 'visible';
                    return;
                }
            })
            .catch((error) => {
                console.log(error.message);
            });
    }
    render() {
        const { t } = this.props;
        const { expMin, expSec } = this.state;
        return (
            <form onSubmit={this._submit} name="form" >
                <ModalTitle>인증번호 입력</ModalTitle>
                <ModalBody>
                    <div className="form-group" style={{ width: '400px' }}>
                        <p id="error-description">
                            이메일로 전송된 인증번호 6자리를 입력해 주세요
                        </p>
                        <label className="control-label" htmlFor="extend-time">
                            인증번호 입력
                        </label>
                        <div>
                            <input type="text" onChange={this._updateState} value={this.state.authNumber} id="input-authNumber" required />
                            <span>{expMin}</span>:<span>{expSec}</span>
                        </div>
                        <div>
                            <p id="error-timeout" style={{ color: 'red', visibility: 'hidden' }}>
                                인증번호 만료시간이 초과되었습니다.
                            </p>
                        </div>
                        <div>
                            <p id="error-request" style={{ color: 'red', visibility: 'hidden' }}>
                                잘못된 인증번호 입니다.
                            </p>
                        </div>
                    </div>
                </ModalBody>
                <ModalSubmitFooter inProgress={this.state.inProgress} submitText='확인' cancel={this._cancel} />
            </form>
        );
    }
}

OtpModal.propTypes = {
    cancel: PropTypes.func.isRequired,
    close: PropTypes.func.isRequired,
    executeFn: PropTypes.func.isRequired,
};

export const OtpModal_ = createModalLauncher(props => (
    <OtpModal
        path="status"
        // state={props.resource.status.status}
        title="OTP"
        {...props}
    />
));
