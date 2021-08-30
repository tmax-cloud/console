import * as _ from 'lodash-es';
import { switchPerspective } from 'packages/dev-console/integration-tests/views/dev-perspective.view';
import { ValidTabGuard } from 'packages/kubevirt-plugin/src/components/create-vm-wizard/tabs/valid-tab-guard';
import * as React from 'react';
import { NamespaceClaimModel, ResourceQuotaClaimModel, ClusterTemplateClaimModel, RoleBindingClaimModel, ClusterClaimModel, TFApplyClaimModel } from '../../../models';
import { k8sUpdateApproval, k8sUpdateClaim, referenceForModel } from '../../../module/k8s';
import { Select, SelectOption, SelectVariant } from '@patternfly/react-core';
import { createModalLauncher, ModalTitle, ModalBody, ModalSubmitFooter } from '../../factory/modal';
import { PromiseComponent, ResourceIcon, SelectorInput } from '../../utils';
import { Section } from '../utils/section';
import { coFetchJSON } from '../../../co-fetch';
import { withTranslation } from 'react-i18next';

const BasePushModal = withTranslation()(
  class BasePushModal extends PromiseComponent {
    constructor(props) {
      super(props);
      this._submit = this._submit.bind(this);
      this._cancel = props.cancel.bind(this);
      let branch = '';
      this.state = Object.assign(this.state, {
        branch,
        submitDisabled: this.getButtonStateFromProps(),
      });
    }

    getButtonStateFromProps() {
      // const { resource } = this.props;
      // const status = resource?.status?.status;
      // switch (resource?.kind) {
      //   case ResourceQuotaClaimModel.kind:
      //   case RoleBindingClaimModel.kind:
      //   case NamespaceClaimModel.kind:
      //   case ClusterTemplateClaimModel.kind: {
      //     const canModifyStatus = ['Awaiting', 'Rejected', 'Reject', 'Error'];
      //     return !canModifyStatus.includes(status);
      //   }
      //   default: {
      //     return false;
      //   }
      // }

      // MEMO : 상태기반으로 submit버튼 비활성화 시키는 것 대신 승인처리액션버튼 자체를 제거하는걸로 기획수정돼서 무조건 false로 반환하게 수정함.
      // MEMO : 혹시 몰라서 원래코드 주석으로 남겨둠.
      return false;
    }

    _submit(e) {
      e.preventDefault();

      const { kind, path, resource, methods } = this.props;
      const { branch } = this.state;
      const namespace = resource?.metadata?.namespace;
      const name = resource?.metadata?.name;

      const url = `${document.location.origin}/api/kubernetes/apis/cicdapi.tmax.io/v1/namespaces/${namespace}/integrationconfigs/${name}/runpost`;
      //const url = `https://192.168.9.194:6443/apis/cicdapi.tmax.io/v1/namespaces/${namespace}/integrationconfigs/${name}/runpost`;      
      const body = {
        branch: branch
      };
      coFetchJSON.post(url, body).then(this.successSubmit);
      //coFetchJSON(`${document.location.origin}/api/kubernetes/api/`).then(this.successSubmit);
    }

    successSubmit = () => {
      this.props.close();
      // location.reload();
    };

    onChangeBranch = e => {
      this.setState({ branch: e.target.value });
    };

    render() {
      const { kind, resource, description, message, t } = this.props;
      const { submitDisabled } = this.state;
      return (
        <form onSubmit={this._submit} name="form" className="modal-content">
          <ModalTitle>{t('COMMON:MSG_MAIN_POPUP_20')}</ModalTitle>
          <ModalBody>
            <Section label={t('COMMON:MSG_MAIN_POPUP_21')} id="branch" description={t('COMMON:MSG_MAIN_POPUP_22')} isRequired={true} >
              <input className="pf-c-form-control" id="branch" name="branch" onChange={this.onChangeBranch} value={this.state.branch} />
            </Section>
          </ModalBody>
          <ModalSubmitFooter errorMessage={this.state.errorMessage} inProgress={this.state.inProgress} submitText={t('COMMON:MSG_COMMON_BUTTON_COMMIT_3')} cancel={this._cancel} submitDisabled={submitDisabled} />
        </form>
      );
    }
  },
);

export const pushModal = createModalLauncher(props => <BasePushModal {...props} />);
