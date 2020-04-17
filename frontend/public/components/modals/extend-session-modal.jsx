import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { coFetch } from '../../co-fetch';
import { createModalLauncher, ModalTitle, ModalBody, CustomModalSubmitFooter } from '../factory/modal';
import { useTranslation } from 'react-i18next';

const ExpiredTimeComponent = (submit, updateState, requestTime, inProgress, cancel) => {
  const { t } = useTranslation();
  return (
    <form onSubmit={submit} name="form">
      <ModalTitle>{t('CONTENT:CHANGESESSIONEXPIREDTIME')}</ModalTitle>
      <ModalBody>
        <div className="form-group">
          <label className="control-label" htmlFor="extend-time">
            {t('CONTENT:SESSIONEXPIREDTIME')}
          </label>
          <div>
            <input type="text" style={{ marginRight: '5px', width: 'calc(100% - 20px)' }} placeholder={t('CONTENT:MINIMUM1,MAXIMUM60')} onChange={updateState} value={requestTime} id="input-extend-time" required />
            {t('CONTENT:MINUTE')}
          </div>
          <div>
            <p id="error-request" style={{ color: 'red', visibility: 'hidden' }}>
              {t('CONTENT:MINIMUM1,MAXIMUM60')}
            </p>
          </div>
        </div>
      </ModalBody>
      <CustomModalSubmitFooter inProgress={inProgress} submitText={t('CONTENT:SAVE')} cancelText={t('CONTENT:CANCEL')} cancel={cancel} />
    </form>
  );
};

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
    return (
      <ExpiredTimeComponent submit={this._submit} updateState={this._updateState} requestTime={this.state.requestTime} inProgress={this.state.inProgress} cancel={this._cancel} />
      // <form onSubmit={this._submit} name="form">
      //   <ModalTitle>Change Session Expired Time</ModalTitle>
      //   <ModalBody>
      //     <div className="form-group">
      //       <label className="control-label" htmlFor="extend-time">
      //         Session Expired Time
      //       </label>
      //       <div>
      //         <input type="text" style={{ marginRight: '5px', width: 'calc(100% - 20px)' }} placeholder="최소 1 ~ 최대 60" onChange={this._updateState} value={this.state.requestTime} id="input-extend-time" required />
      //         Minute
      //       </div>
      //       <div>
      //         <p id="error-request" style={{ color: 'red', visibility: 'hidden' }}>
      //           Minimum 1 minute, maximum 60 minutes
      //         </p>
      //       </div>
      //     </div>
      //   </ModalBody>
      //   <CustomModalSubmitFooter inProgress={this.state.inProgress} submitText="Save" cancelText="Cancel" cancel={this._cancel} />
      // </form>
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
