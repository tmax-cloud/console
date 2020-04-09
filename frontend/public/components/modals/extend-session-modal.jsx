import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { coFetch } from '../../co-fetch';
import { createModalLauncher, ModalTitle, ModalBody, CustomModalSubmitFooter } from '../factory/modal';

class ExtendSessionModal extends Component {
  constructor(props) {
    super(props);
    // console.log(props);
    this.state = {
        requestTime: 60
    }
    
    this._cancel = props.cancel.bind(this);
    this._updateState = this._updateState.bind(this);
    this._submit = this._submit.bind(this);
    this._updateTokenTime = props.setExpireTimeFunc.bind(this);
  }

  _updateState(event) {
      this.setState({ requestTime: event.target.value });
  }

  _submit(event) {
    event.preventDefault();
    // TODO 토큰 유효 시간 연장 서비스 연동 
    if (this.state.requestTime < 1 || this.state.requestTime > 60 || isNaN(this.state.requestTime)) {
      document.getElementById('error-request').style.visibility = 'visible';
      return;
    }
    this._updateTokenTime(this.state.requestTime);
    this.props.close();
  }

  render() {
    return <form onSubmit={this._submit} name="form">
      <ModalTitle>세션 만료 시간 변경</ModalTitle>
      <ModalBody>
        <div className="form-group">
          <label className="control-label" htmlFor="extend-time">
            세션 만료 시간
          </label>
          <div>
            <input type="text" style={{ marginRight: '5px', width: 'calc(100% - 20px)' }} placeholder="최소 1 ~ 최대 60" onChange={this._updateState} value={this.state.requestTime} id="input-extend-time" required />
            분
          </div>
          <div>
            <p id="error-request" style={{ color: 'red', visibility: 'hidden' }}>
            최소 1분 이상, 최대 60분 이하로 설정할 수 있습니다.
            </p>
          </div>
        </div>
      </ModalBody>
      <CustomModalSubmitFooter inProgress={this.state.inProgress} submitText='저장' cancelText='취소' cancel={this._cancel} />
    </form>;
  }
}

ExtendSessionModal.propTypes = {
  cancel: PropTypes.func.isRequired,
  close: PropTypes.func.isRequired,
  executeFn: PropTypes.func.isRequired,
};

export const ExtendSessionModal_ = createModalLauncher(props => <ExtendSessionModal
  path="status"
  // state={props.resource.status.status}
  title="세션 만료 시간 변경"
  {...props}
/>);
