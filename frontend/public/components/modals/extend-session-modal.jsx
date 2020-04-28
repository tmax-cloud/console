import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { coFetch } from '../../co-fetch';
import { createModalLauncher, ModalTitle, ModalBody, ModalSubmitFooter } from '../factory/modal';

class ExtendSessionModal extends Component {
  constructor(props) {
    super(props);
    // console.log(props);
    this.state = {
      requestTime: 60,
    };

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
    const { t } = this.props;
    return (
      <form onSubmit={this._submit} name="form">
        <ModalTitle>{t('CONTENT:CHANGESESSIONEXPIREDTIME')}</ModalTitle>
        <ModalBody>
          <div className="form-group" style={{ width: '400px' }}>
            <label className="control-label" htmlFor="extend-time">
              {t('CONTENT:SESSIONEXPIREDTIME')}
            </label>
            <div>
              <input type="text" style={window.localStorage.getItem('i18nextLng') === 'en' ? { marginRight: '5px', width: 'calc(100% - 50px)' } : { marginRight: '5px', width: 'calc(100% - 20px)' }} placeholder={t('CONTENT:MINIMUM1,MAXIMUM60')} onChange={this._updateState} value={this.state.requestTime} id="input-extend-time" required />
              {t('CONTENT:MINUTE')}
            </div>
            <div>
              <p id="error-request" style={{ color: 'red', visibility: 'hidden' }}>
                {t('CONTENT:MINIMUM1,MAXIMUM60')}
              </p>
            </div>
          </div>
        </ModalBody>
        <ModalSubmitFooter inProgress={this.state.inProgress} submitText={t('CONTENT:SAVE')} cancel={this._cancel} />
      </form>
    );
  }
}

ExtendSessionModal.propTypes = {
  cancel: PropTypes.func.isRequired,
  close: PropTypes.func.isRequired,
  executeFn: PropTypes.func.isRequired,
};

export const ExtendSessionModal_ = createModalLauncher(props => (
  <ExtendSessionModal
    path="status"
    // state={props.resource.status.status}
    title="Change Session Expired Time"
    {...props}
  />
));
