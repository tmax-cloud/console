import * as _ from 'lodash-es';
import { switchPerspective } from 'packages/dev-console/integration-tests/views/dev-perspective.view';
import { ValidTabGuard } from 'packages/kubevirt-plugin/src/components/create-vm-wizard/tabs/valid-tab-guard';
import * as React from 'react';
import { NamespaceClaimModel, ResourceQuotaClaimModel, ClusterTemplateClaimModel, RoleBindingClaimModel, ClusterClaimModel, TFApplyClaimModel } from '../../../models';
import { k8sUpdateApproval, k8sUpdateClaim, referenceForModel } from '../../../module/k8s';
import { Select, SelectOption, SelectVariant } from '@patternfly/react-core';
import { createModalLauncher, ModalTitle, ModalBody, ModalSubmitFooter } from '../../factory/modal';
import { PromiseComponent, ResourceIcon, SelectorInput } from '../../utils';
import { withTranslation } from 'react-i18next';

const STATUS_PATH = '/status/result';
const REASON_PATH = '/status/reason';
// const STATUS_PATH = '/status';
const TEMPLATE_SELECTOR_PATH = '/spec/template/metadata/status';

const BaseStatusModal = withTranslation()(
  class BaseStatusModal extends PromiseComponent {
    constructor(props) {
      super(props);
      this._submit = this._submit.bind(this);
      this._cancel = props.cancel.bind(this);
      let status = 'Approved';
      const reason = '';
      this.state = Object.assign(this.state, {
        status,
        reason,
        isOptionsOpen: false,
        submitDisabled: this.getButtonStateFromProps(),
      });
      this.options = [
        { value: 'Approved', disabled: false },
        { value: 'Rejected', disabled: false },
      ];
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

      const { kind, path, resource } = this.props;
      switch (kind.kind) {
        case RoleBindingClaimModel.kind:
        case ResourceQuotaClaimModel.kind:
        case NamespaceClaimModel.kind: {
          const stat = this.state.status === 'Approved' ? 'Approved' : 'Rejected';
          const promise = k8sUpdateApproval(
            kind,
            resource,
            'status',
            [
              { op: 'replace', path: '/status/status', value: stat },
              { op: 'replace', path: '/status/reason', value: this.state.reason },
            ],
            'PATCH',
          );
          this.handlePromise(promise).then(this.successSubmit);
          break;
        }
        case TFApplyClaimModel.kind: {
          const stat = this.state.status === 'Approved' ? 'Approve' : 'Reject';
          const promise = k8sUpdateApproval(
            kind,
            resource,
            'status',
            [
              { op: 'replace', path: '/status/action', value: stat },
              // { op: 'replace', path: '/status/reason', value: this.state.reason },
            ],
            'PATCH',
          );
          this.handlePromise(promise).then(this.successSubmit);
          break;
        }
        case ClusterTemplateClaimModel.kind: {
          const stat = this.state.status === 'Approved' ? 'Approved' : 'Rejected';
          const promise = k8sUpdateApproval(
            kind,
            resource,
            'status',
            [
              { op: 'replace', path: '/status/status', value: stat },
              { op: 'replace', path: '/status/reason', value: this.state.reason || '' },
            ],
            'PATCH',
          );
          this.handlePromise(promise).then(this.successSubmit);
          break;
        }
        case ClusterClaimModel.kind: {
          const clusterClaim = resource.metadata.name;
          const admit = this.state.status === 'Approved' ? true : false;
          const reason = this.state.reason;
          const ns = resource.metadata.namespace;

          const promise = k8sUpdateClaim(kind, clusterClaim, admit, reason, ns);
          this.handlePromise(promise).then(this.successSubmit);
          break;
        }
        default: {
          // resourceURL
          const approval = this.state.status === 'Approved' ? 'approve' : 'reject';

          const promise = k8sUpdateApproval(kind, resource, approval, {
            reason: this.state.reason,
          });
          this.handlePromise(promise).then(this.successSubmit);
          break;
        }
      }
    }

    successSubmit = () => {
      this.props.close();
      // location.reload();
    };

    onChangeApproval = e => {
      this.setState({ status: e.target.value });
    };

    onSelect = (event, selection) => {
      this.setState({ status: selection, isOptionsOpen: false });
    };

    onToggle = isOpen => {
      this.setState({ isOptionsOpen: isOpen });
    };

    onChangeReason = e => {
      this.setState({ reason: e.target.value });
    };

    render() {
      const { kind, resource, description, message, t } = this.props;
      const { submitDisabled } = this.state;
      return (
        <form onSubmit={this._submit} name="form" className="modal-content">
          <ModalTitle>{t('COMMON:MSG_MAIN_POPUP_TITLE_1')}</ModalTitle>
          <ModalBody>
            <div className="row co-m-form-row">
              <div className="col-sm-12">{message || ''}</div>
            </div>
            <div className="row co-m=-form-row">
              <div className="col-sm-12 approval-dropdown--short-bottom">
                {/* <select className="col-sm-12" value={this.state.status} onChange={this.onChangeApproval}>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select> */}
                <Select variant={SelectVariant.single} placeholderText="Select status" selections={this.state.status} onSelect={this.onSelect} onToggle={this.onToggle} isExpanded={this.state.isOptionsOpen} isDisabled={false}>
                  {this.options.map((option, index) => (
                    <SelectOption isDisabled={option.disabled} key={index} value={option.value} />
                  ))}
                </Select>
              </div>
              {this.state.status === 'Rejected' && (
                <>
                  <div className="col-sm-12">
                    <textarea className="col-sm-12 pf-c-form-control query-browser__query-input" style={{ height: '100px' }} onChange={this.onChangeReason} value={this.state.reason} />
                  </div>
                  <div className="col-sm-12">{t('COMMON:MSG_MAIN_POPUP_DESCRIPTION_1')}</div>
                </>
              )}
            </div>
          </ModalBody>
          <ModalSubmitFooter errorMessage={this.state.errorMessage} inProgress={this.state.inProgress} submitText={t('COMMON:MSG_COMMON_BUTTON_COMMIT_3')} cancel={this._cancel} submitDisabled={submitDisabled} />
        </form>
      );
    }
  },
);

export const statusModal = createModalLauncher(props => <BaseStatusModal path={STATUS_PATH} reasonPath={REASON_PATH} {...props} />);
