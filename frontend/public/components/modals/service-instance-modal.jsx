import * as React from 'react';
import { createModalLauncher, ModalTitle, ModalBody } from '../factory/modal';
import { PromiseComponent } from '../utils';
import { AsyncComponent } from '../utils/async';

const ServiceClassDetailComponent = props => (
  <AsyncComponent loader={() => import('../service-instances/service-class-detail').then(c => c.ServiceClassDetail)} {...props} />
);

class ServiceClassModal extends PromiseComponent {
  constructor(props) {
    super(props);
    this._cancel = props.cancel.bind(this);
  }
  render() {
    return (
      <div>
        <ModalTitle>{this.props.title}</ModalTitle>
        <ModalBody>
          <ServiceClassDetailComponent {...this.props} />
        </ModalBody>
        <div className="modal-footer">
          <button className="btn btn-default" onClick={this._cancel}>
            Cancel
          </button>
        </div>
      </div>
    );
  }
}

export const serviceClassModal = createModalLauncher(props => <ServiceClassModal title="Service Class Details" {...props} />);
