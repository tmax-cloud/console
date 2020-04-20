import * as React from 'react';
import { createModalLauncher, ModalTitle, ModalBody } from '../factory/modal';
import { PromiseComponent } from '../utils';
import { AsyncComponent } from '../utils/async';
import { useTranslation } from 'react-i18next';

const ServiceClassDetailComponent = props => <AsyncComponent loader={() => import('../service-instances/service-class-detail').then(c => c.ServiceClassDetail)} {...props} />;

const SCDComponent = ({props, cancel}) => {
  const { t } = useTranslation();
  return (
    <div>
      <ModalTitle>{t('RESOURCE:SERVICECLASS') + t('CONTENT:DETAILS')}</ModalTitle>
      <ModalBody>
        <ServiceClassDetailComponent {...props} />
      </ModalBody>
      <div className="modal-footer">
        <button className="btn btn-default" onClick={cancel}>
          {t('CONTENT:CANCEL')}
        </button>
      </div>
    </div>
  );
};

class ServiceClassModal extends PromiseComponent {
  constructor(props) {
    super(props);
    this._cancel = props.cancel.bind(this);
  }
  render() {
    return (
      <SCDComponent props={...this.props} cancel={this._cancel} />
      // <div>
      //   <ModalTitle>{this.props.title}</ModalTitle>
      //   <ModalBody>
      //     <ServiceClassDetailComponent {...this.props} />
      //   </ModalBody>
      //   <div className="modal-footer">
      //     <button className="btn btn-default" onClick={this._cancel}>
      //       Cancel
      //     </button>
      //   </div>
      // </div>
    );
  }
}

export const serviceClassModal = createModalLauncher(props => <ServiceClassModal title="Service Class Details" {...props} />);
