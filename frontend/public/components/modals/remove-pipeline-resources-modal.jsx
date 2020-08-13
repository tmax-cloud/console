import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { createModalLauncher, ModalTitle, ModalBody, CustomModalSubmitFooter } from '../factory/modal';

class RemovePipelineResourcesModal extends Component {
  constructor(props) {
    super(props);
    this._cancel = props.cancel.bind(this);
    this._remove = this._remove.bind(this);
  }

  _remove() {
    this.props.removeFunc(this.props.idx);
    this._cancel();
  }

  render() {
    // const { t } = this.props;
    return (
      <form name="form">
        <ModalTitle>파이프라인 리소스 구성 삭제</ModalTitle>
        <ModalBody>
          <div className="form-group" style={{ width: '400px' }}>
            <label className="control-label">파이프라인 리소스를 삭제할 경우 아래의 파이프라인 빌드에 정의된 리소스 입력값이 초기화 됩니다. 삭제하시겠습니까?</label>
          </div>
        </ModalBody>
        <CustomModalSubmitFooter leftText="삭제" rightText="취소" clickLeft={this._remove} clickRight={this._cancel} cancel={this._cancel} />
      </form>
    );
  }
}

RemovePipelineResourcesModal.propTypes = {
  cancel: PropTypes.func.isRequired,
  close: PropTypes.func.isRequired,
  executeFn: PropTypes.func.isRequired,
};

export const RemovePipelineResourcesModal_ = createModalLauncher(props => <RemovePipelineResourcesModal path="status" title="파이프라인 리소스 구성 삭제" {...props} />);
