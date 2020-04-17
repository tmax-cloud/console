/* eslint-disable no-undef */

import * as _ from 'lodash-es';
import * as React from 'react';
import * as classNames from 'classnames';
import { Tooltip } from './tooltip';

import { annotationsModal, configureReplicaCountModal, labelsModal, podSelectorModal, deleteModal, configureStatusModal } from '../modals';
import { DropdownMixin } from './dropdown';
import { history, resourceObjPath } from './index';
import { referenceForModel, K8sResourceKind, K8sResourceKindReference, K8sKind } from '../../module/k8s';
import { connectToModel } from '../../kinds';
import { useTranslation } from 'react-i18next';
import { ResourcePlural } from '../utils/lang/resource-plural';

const CogItems: React.SFC<CogItemsProps> = ({ options, onClick }) => {
  const visibleOptions = _.reject(options, o => _.get(o, 'hidden', false));
  const lis = _.map(visibleOptions, (o, i) => (
    <li key={i}>
      <a onClick={e => onClick(e, o)}>{o.label}</a>
    </li>
  ));
  return <ul className="dropdown-menu co-m-cog__dropdown">{lis}</ul>;
};

const cogFactory: CogFactory = {
  Delete: (kind, obj) => {
    const { t } = useTranslation();
    return {
      label: t('ADDITIONAL:DELETE', { something: ResourcePlural(kind.kind, t) }),
      callback: () =>
        deleteModal({
          kind: kind,
          resource: obj,
          t: t,
        }),
    };
  },
  Edit: (kind, obj) => {
    const { t } = useTranslation();
    return {
      label: t('ADDITIONAL:EDIT', { something: ResourcePlural(kind.kind, t) }),
      href: `${resourceObjPath(obj, kind.crd ? referenceForModel(kind) : kind.kind)}/yaml`,
    };
  },
  ModifyLabels: (kind, obj) => {
    const { t } = useTranslation();
    return {
      label: t('ADDITIONAL:EDIT', { something: t('CONTENT:LABELS') }),
      callback: () =>
        labelsModal({
          kind: kind,
          resource: obj,
          t: t,
        }),
    };
  },
  ModifyPodSelector: (kind, obj) => {
    const { t } = useTranslation();
    return {
      label: t('ADDITIONAL:EDIT', { something: t('CONTENT:PODSELECTOR') }),
      callback: () =>
        podSelectorModal({
          kind: kind,
          resource: obj,
          t: t,
        }),
    };
  },
  ModifyAnnotations: (kind, obj) => {
    const { t } = useTranslation();
    return {
      label: t('ADDITIONAL:EDIT', { something: t('CONTENT:ANNOTATIONS') }),
      callback: () =>
        annotationsModal({
          kind: kind,
          resource: obj,
          t: t,
        }),
    };
  },
  ModifyCount: (kind, obj) => {
    const { t } = useTranslation();
    return {
      label: t('ADDITIONAL:EDIT', { something: t('CONTENT:COUNT') }),
      callback: () =>
        configureReplicaCountModal({
          resourceKind: kind,
          resource: obj,
          t: t,
        }),
    };
  },
  EditEnvironment: (kind, obj) => {
    const { t } = useTranslation();
    return {
      label: kind.kind === 'Pod' ? t('ADDITIONAL:VIEW', { something: t('CONTENT:ENVIRONMENT') }) : t('ADDITIONAL:EDIT', { something: t('CONTENT:ENVIRONMENT') }),
      href: `${resourceObjPath(obj, kind.crd ? referenceForModel(kind) : kind.kind)}/environment`,
    };
  },
  EditStatus: (kind, obj) => {
    const { t } = useTranslation();
    return {
      label: t('ADDITIONAL:EDIT', { something: t('CONTENT:STATUS') }),
      callback: () =>
        configureStatusModal({
          resourceKind: kind,
          resource: obj,
          t: t,
        }),
    };
  },
};

// The common menu actions that most resource share
cogFactory.common = [cogFactory.ModifyLabels, cogFactory.ModifyAnnotations, cogFactory.Edit, cogFactory.Delete];

export const ResourceCog = connectToModel((props: ResourceCogProps) => {
  const { actions, kindObj, resource, isDisabled } = props;

  if (!kindObj) {
    return null;
  }
  return <Cog resource={resource} options={actions.map(a => a(kindObj, resource))} key={resource.metadata.uid} isDisabled={isDisabled !== undefined ? isDisabled : _.get(resource.metadata, 'deletionTimestamp')} id={`cog-for-${resource.metadata.uid}`} />;
});

export class Cog extends DropdownMixin {
  static factory: CogFactory = cogFactory;
  private onClick = this.onClick_.bind(this);

  onClick_(event, option) {
    event.preventDefault();

    if (option.callback) {
      option.callback();
    }

    if (option.href) {
      history.push(option.href);
    }

    this.hide();
  }

  render() {
    const { options, isDisabled, id, resource } = this.props;
    if (resource) {
      if (resource.kind === 'NamespaceClaim' || resource.kind === 'RoleBindingClaim' || resource.kind === 'ResourceQuotaClaim') {
        if (resource.status && resource.status.status === 'Success' && options[options.length - 1].label === 'Edit Status') {
          options.pop();
        }
      } // claim 페이지에서 status에 따라 'Edit Status' 메뉴 활성화/비활성화 분기 로직
    }
    return (
      <div className={classNames('co-m-cog-wrapper', { 'co-m-cog-wrapper--enabled': !isDisabled })} id={id}>
        {isDisabled ? (
          <Tooltip content="disabled">
            <div ref={this.dropdownElement} className={classNames('co-m-cog', { 'co-m-cog--disabled': isDisabled })}>
              <span className={classNames('fa', 'fa-cog', 'co-m-cog__icon', { 'co-m-cog__icon--disabled': isDisabled })} aria-hidden="true"></span>
              <span className="sr-only">Actions</span>
            </div>
          </Tooltip>
        ) : (
          <div ref={this.dropdownElement} onClick={this.toggle} className={classNames('co-m-cog', { 'co-m-cog--disabled': isDisabled })}>
            <span className={classNames('fa', 'fa-cog', 'co-m-cog__icon', { 'co-m-cog__icon--disabled': isDisabled })} aria-hidden="true"></span>
            <span className="sr-only">Actions</span>
            {this.state.active && <CogItems options={options} onClick={this.onClick} />}
          </div>
        )}
      </div>
    );
  }
}

export type CogOption = {
  label: string;
  href?: string;
  callback?: () => any;
};
export type CogAction = (kind, obj: K8sResourceKind) => CogOption;

export type ResourceCogProps = {
  kindObj: K8sKind;
  actions: CogAction[];
  kind: K8sResourceKindReference;
  resource: K8sResourceKind;
  isDisabled?: boolean;
};

export type CogItemsProps = {
  options: CogOption[];
  onClick: (event: React.MouseEvent<{}>, option: CogOption) => void;
};

export type CogFactory = { [name: string]: CogAction } & { common?: CogAction[] };

CogItems.displayName = 'CogItems';
ResourceCog.displayName = 'ResourceCog';
