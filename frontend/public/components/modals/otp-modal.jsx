import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { coFetch } from '../../co-fetch';
import { createModalLauncher, ModalTitle, ModalBody, ModalSubmitFooter } from '../factory/modal';

class OtpModal extends Component {
    constructor(props) {
        super(props);
        console.log(props);
        this.state = {
            authNumber: 0,
        };

        // this._cancel = props.cancel.bind(this);
        this._updateState = this._updateState.bind(this);
        this._submit = this._submit.bind(this);
        //     this._updateTokenTime = props.setExpireTimeFunc.bind(this);
    }

    _updateState(event) {
        this.setState({ authNumber: event.target.value });
    }

    _submit(event) {
        event.preventDefault();
        //  TODO, 인증번호, ID, PW로 서비스 호출 
        if (this.state.requestTime < 1 || this.state.requestTime > 60 || isNaN(this.state.requestTime)) {
            document.getElementById('error-request').style.visibility = 'visible';
            return;
        }
        this._updateTokenTime(this.state.requestTime);
        this.props.close();
    }

    render() {
        const { t } = this.props;
        return (
            <form onSubmit={this._submit} name="form">
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
                        </div>
                        <div>
                            <p id="error-request" style={{ color: 'red', visibility: 'hidden' }}>
                                잘못된 인증번호 입니다.
                            </p>
                        </div>
                    </div>
                </ModalBody>
                <ModalSubmitFooter inProgress={this.state.inProgress} submitText='save' />
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
