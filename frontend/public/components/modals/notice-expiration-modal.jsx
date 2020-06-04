import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { coFetch } from '../../co-fetch';
import { createModalLauncher, ModalTitle, ModalBody, CustomModalSubmitFooter } from '../factory/modal';

let timerID = 0;

class NoticeExpirationModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      time: this.props.time,
    };

    this._cancel = props.cancel.bind(this);
    this._logout = this.props.logout.bind(this);
    this._extend = this._extend.bind(this);
  }

  componentDidMount() {
    // 타이머 등록
    timerID = window.setInterval(() => this.tick(), 1000);
  }

  componentWillUnmount() {
    // 타이머 등록 해제
    window.clearInterval(timerID);
  }

  tick() {
    this.setState({ time: Math.floor(this.state.time - 1) });
    if (Math.floor(this.state.time) === 0) {
        this._logout();
    }
  }

  _extend() {
    this.props.tokenRefresh();
    this._cancel();
  }

  render() {
    // const { t } = this.props;
    return (
      <form name="form">
        <ModalTitle>세션 만료 알림</ModalTitle>
        <ModalBody>
          <div className="form-group" style={{ width: '400px' }}>
            <label className="control-label">
              {Math.floor(this.state.time)}초 뒤에 자동으로 로그아웃 될 예정입니다.
            </label>
            <label className="control-label">
              로그인 상태를 유지하시려면 연장 버튼을 클릭해주세요.
            </label>
          </div>
        </ModalBody>
        <CustomModalSubmitFooter inProgress={this.state.inProgress} leftText='연장' rightText='로그아웃' clickLeft={this._extend} clickRight={this._logout} cancel={this._closeModal} />
      </form>
    );
  }
}

NoticeExpirationModal.propTypes = {
  cancel: PropTypes.func.isRequired,
  close: PropTypes.func.isRequired,
  executeFn: PropTypes.func.isRequired,
};

export const NoticeExpirationModal_ = createModalLauncher(props => (
  <NoticeExpirationModal
    path="status"
    title="세션 만료 알림"
    {...props}
  />
));
