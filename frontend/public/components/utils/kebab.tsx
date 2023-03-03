import * as _ from 'lodash-es';
import * as React from 'react';
import * as classNames from 'classnames';
import * as FocusTrap from 'focus-trap-react';
import { connect } from 'react-redux';
import { KEY_CODES, Tooltip } from '@patternfly/react-core';
import { EllipsisVIcon, AngleRightIcon, ExternalLinkAltIcon } from '@patternfly/react-icons';
import Popper from '@console/shared/src/components/popper/Popper';
import { annotationsModal, configureReplicaCountModal, taintsModal, tolerationsModal, labelsModal, podSelectorModal, deleteModal, expandPVCModal } from '../modals';
import { statusModal, scanningModal } from '../hypercloud/modals';
import { asAccessReview, checkAccess, history, resourceObjPath, useAccessReview } from './index';
import { AccessReviewResourceAttributes, K8sKind, K8sResourceKind, K8sResourceKindReference, referenceForModel, k8sUpdateApproval, k8sUpdate } from '../../module/k8s';
import { impersonateStateToProps } from '../../reducers/ui';
import { connectToModel } from '../../kinds';
import * as plugins from '../../plugins';
import { useTranslation, withTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import * as hoistStatics from 'hoist-non-react-statics';
import { ResourceLabel } from '@console/internal/models/hypercloud/resource-plural';
import { TFApplyClaimModel } from '../../models';

export const kebabOptionsToMenu = (options: KebabOption[]): KebabMenuOption[] => {
  const subs: { [key: string]: KebabSubMenu } = {};
  const menuOptions: KebabMenuOption[] = [];

  options?.forEach(o => {
    if (!o.hidden) {
      if (o.path) {
        const parts = o.path.split('/');
        parts.forEach((p, i) => {
          let subMenu = subs[p];
          if (!subs[p]) {
            subMenu = {
              label: p,
              children: [],
            };
            subs[p] = subMenu;
            if (i === 0) {
              menuOptions.push(subMenu);
            } else {
              subs[parts[i - 1]].children.push(subMenu);
            }
          }
        });
        subs[parts[parts.length - 1]].children.push(o);
      } else {
        menuOptions.push(o);
      }
    }
  });
  return menuOptions;
};

const KebabItem_: React.FC<KebabItemProps & { isAllowed: boolean }> = ({ option, onClick, onEscape, autoFocus, isAllowed }) => {
  const { t } = useTranslation();
  const handleEscape = e => {
    if (e.keyCode === KEY_CODES.ESCAPE_KEY) {
      onEscape();
    }
  };
  const disabled = !isAllowed || option.isDisabled;
  const classes = classNames('pf-c-dropdown__menu-item', { 'pf-m-disabled': disabled });
  // MEMO : i18n 키 값과 변수 값을 한번에 String으로 받아올 수 밖에 없어서 불가피하게 여기서 split으로 나눠서 넣어준다..
  const labelSplit = option?.label?.split('**');
  // MEMO : 번역이 필요없는 경우에도 번역 로직을 타고 있어서 스트링에 ":"이 포함될 때 이상한 파싱 에러가 나고 있었음. 그래서 이 옵션을 추가함.
  // TODO : needTranslate의 default 값이 false여야할 것 같으나 시간 관계상 에러나는 부분에서만 false로 했음. 추후 변경 요망
  const needTranslate = option?.needTranslate ?? true;
  return (
    <button className={classes} onClick={e => !disabled && onClick(e, option)} autoFocus={autoFocus} onKeyDown={onEscape && handleEscape} data-test-action={option.label}>
      {option.icon && (!option.iconPosition || option.iconPosition === 'left') && <span className="oc-kebab__icon">{option.icon}</span>}
      {needTranslate ? (!!labelSplit[1] ? t(labelSplit[0], { 0: t(labelSplit[1]) }) : t(labelSplit[0])) : option.label}
      {option.icon && option.iconPosition === 'right' && (
        <span className="oc-kebab__icon" style={{ marginLeft: 'var(--pf-global--spacer--sm)' }}>
          {option.icon}
        </span>
      )}
    </button>
  );
};
const KebabItemAccessReview_ = (props: KebabItemProps & { impersonate: string }) => {
  const { option, impersonate } = props;
  const isAllowed = useAccessReview(option.accessReview, impersonate);
  return <KebabItem_ {...props} isAllowed={isAllowed} />;
};

const KebabItemAccessReview = connect(impersonateStateToProps)(KebabItemAccessReview_);

type KebabSubMenuProps = {
  option: KebabSubMenu;
  onClick: KebabItemProps['onClick'];
};

const KebabSubMenu: React.FC<KebabSubMenuProps> = ({ option, onClick }) => {
  const [open, setOpen] = React.useState(false);
  const nodeRef = React.useRef(null);
  const subMenuRef = React.useRef(null);
  const referenceCb = React.useCallback(() => nodeRef.current, []);
  // use a callback ref because FocusTrap is old and doesn't support non-function refs
  const subMenuCbRef = React.useCallback(node => (subMenuRef.current = node), []);

  return (
    <>
      <button
        ref={nodeRef}
        className="oc-kebab__sub pf-c-dropdown__menu-item"
        data-test-action={option.label}
        // mouse enter will open the sub menu
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={e => {
          // if the mouse leaves this item, close the sub menu only if the mouse did not enter the sub menu itself
          if (!subMenuRef.current || !subMenuRef.current.contains(e.relatedTarget as Node)) {
            setOpen(false);
          }
        }}
        onKeyDown={e => {
          // open the sub menu on enter or right arrow
          if (e.keyCode === 39 || e.keyCode === 13) {
            setOpen(true);
            e.stopPropagation();
          }
        }}
      >
        {option.label}
        <AngleRightIcon className="oc-kebab__arrow" />
      </button>
      <Popper
        open={open}
        placement="right-start"
        closeOnEsc
        closeOnOutsideClick
        onRequestClose={e => {
          // only close the sub menu if clicking anywhere outside the menu item that owns the sub menu
          if (!e || !nodeRef.current || !nodeRef.current.contains(e.target as Node)) {
            setOpen(false);
          }
        }}
        reference={referenceCb}
      >
        <FocusTrap focusTrapOptions={{ clickOutsideDeactivates: true }}>
          <div
            ref={subMenuCbRef}
            role="presentation"
            className="pf-c-dropdown pf-m-expanded"
            onMouseLeave={e => {
              // only close the sub menu if the mouse does not enter the item
              if (!nodeRef.current || !nodeRef.current.contains(e.relatedTarget as Node)) {
                setOpen(false);
              }
            }}
            onKeyDown={e => {
              // close the sub menu on left arrow
              if (e.keyCode === 37) {
                setOpen(false);
                e.stopPropagation();
              }
            }}
          >
            <KebabMenuItems options={option.children} onClick={onClick} className="oc-kebab__popper-items" focusItem={option.children[0]} />
          </div>
        </FocusTrap>
      </Popper>
    </>
  );
};

export const isKebabSubMenu = (option: KebabMenuOption): option is KebabSubMenu => {
  // only a sub menu has children
  return Array.isArray((option as KebabSubMenu).children);
};

export const KebabItem: React.FC<KebabItemProps> = props => {
  const { option } = props;
  let item;

  if (option.accessReview) {
    item = <KebabItemAccessReview {...props} />;
  } else {
    item = <KebabItem_ {...props} isAllowed />;
  }

  return option.tooltip ? (
    <Tooltip position="left" content={option.tooltip}>
      {item}
    </Tooltip>
  ) : (
    item
  );
};

type KebabMenuItemsProps = {
  options: KebabMenuOption[];
  onClick: (event: React.MouseEvent<{}>, option: KebabOption) => void;
  focusItem?: KebabOption;
  className?: string;
};

export const KebabMenuItems: React.FC<KebabMenuItemsProps> = ({ className, options, onClick, focusItem }) => (
  <ul className={classNames('pf-c-dropdown__menu pf-m-align-right', className)} data-test-id="action-items">
    {_.map(options, o => (
      <li key={o.label}>{isKebabSubMenu(o) ? <KebabSubMenu option={o} onClick={onClick} /> : <KebabItem option={o} onClick={onClick} autoFocus={focusItem ? o === focusItem : undefined} />}</li>
    ))}
  </ul>
);

export const KebabItems: React.FC<KebabItemsProps> = ({ options, ...props }) => {
  const menuOptions = kebabOptionsToMenu(options);
  return <KebabMenuItems {...props} options={menuOptions} />;
};

const kebabFactory: KebabFactory = {
  Delete: (kind, obj) => ({
    label: `COMMON:MSG_MAIN_ACTIONBUTTON_16**${kind.i18nInfo?.label ?? kind.label}`,
    callback: () =>
      deleteModal({
        kind,
        resource: obj,
      }),
    accessReview: asAccessReview(kind, obj, 'delete'),
  }),
  Edit: (kind, obj) => ({
    label: `COMMON:MSG_MAIN_ACTIONBUTTON_15**${kind.i18nInfo?.label ?? kind.label}`,
    href: `${resourceObjPath(obj, kind.crd ? referenceForModel(kind) : kind.kind)}/edit`,
    // TODO: Fallback to "View YAML"? We might want a similar fallback for annotations, labels, etc.
    accessReview: asAccessReview(kind, obj, 'update'),
  }),
  EditSecret: (kind, obj) => ({
    label: `COMMON:MSG_MAIN_ACTIONBUTTON_15**${kind.i18nInfo?.label ?? kind.label}`,
    href: `${resourceObjPath(obj, kind.kind)}/edit`,
    accessReview: asAccessReview(kind, obj, 'update'),
  }),
  ModifyLabels: (kind, obj) => ({
    label: 'COMMON:MSG_MAIN_ACTIONBUTTON_4',
    callback: () =>
      labelsModal({
        kind,
        resource: obj,
        blocking: true,
        labelKind: 'Label',
      }),
    accessReview: asAccessReview(kind, obj, 'patch'),
  }),
  ModifyStatus: (kind, obj) => ({
    label: 'COMMON:MSG_MAIN_ACTIONBUTTON_31',
    callback: () =>
      statusModal({
        kind,
        resource: obj,
        blocking: true,
      }),
    accessReview: asAccessReview(kind, obj, 'patch'),
  }),
  TerraformPlan: (kind: K8sKind, obj: K8sResourceKind, resources: {}) => ({
    label: 'COMMON:MSG_COMMON_ACTIONBUTTON_73',
    callback: () => k8sUpdateApproval(TFApplyClaimModel, obj, 'status', [{ op: 'replace', path: '/status/action', value: 'Plan' }], 'PATCH'),
    accessReview: asAccessReview(kind, obj, 'patch'),
  }),
  TerraformApply: (kind: K8sKind, obj: K8sResourceKind, resources: {}) => ({
    label: 'COMMON:MSG_COMMON_ACTIONBUTTON_74',
    callback: () => k8sUpdateApproval(TFApplyClaimModel, obj, 'status', [{ op: 'replace', path: '/status/action', value: 'Apply' }], 'PATCH'),
    accessReview: asAccessReview(kind, obj, 'patch'),
  }),
  TerraformDestroy: (kind: K8sKind, obj: K8sResourceKind, resources: {}) => ({
    label: 'COMMON:MSG_COMMON_ACTIONBUTTON_75',
    callback: () => k8sUpdate(TFApplyClaimModel, _.defaultsDeep({ spec: { destroy: true } }, obj)),
    accessReview: asAccessReview(kind, obj, 'patch'),
  }),
  ModifyClaim: (kind, obj) => ({
    label: 'COMMON:MSG_MAIN_ACTIONBUTTON_31',
    callback: () =>
      statusModal({
        kind,
        resource: obj,
        blocking: true,
      }),
    accessReview: asAccessReview(kind, obj, 'update', 'status'),
  }),
  ModifyScanning: (kind, obj) => {
    let isExtRegistry = false;
    if (obj.kind === 'ExternalRegistry' || obj.metadata?.labels?.app === 'ext-registry' || obj.isExtRegistry) {
      isExtRegistry = true;
    }
    return {
      label: 'COMMON:MSG_COMMON_ACTIONBUTTON_20',
      callback: () =>
        scanningModal({
          modelKind: kind,
          resource: obj,
          blocking: true,
          isExtRegistry,
        }),
    };
  },
  ModifyPodSelector: (kind, obj) => ({
    label: 'COMMON:MSG_MAIN_ACTIONBUTTON_6',
    callback: () =>
      podSelectorModal({
        kind,
        resource: obj,
        blocking: true,
        labelKind: 'Pod',
      }),
    accessReview: asAccessReview(kind, obj, 'patch'),
  }),
  ModifyAnnotations: (kind, obj) => ({
    label: 'COMMON:MSG_MAIN_ACTIONBUTTON_5',
    callback: t =>
      annotationsModal({
        kind,
        resource: obj,
        blocking: true,
        submitText: t('COMMON:MSG_COMMON_BUTTON_COMMIT_3'),
        title: t('COMMON:MSG_MAIN_ACTIONBUTTON_5'),
        addString: t('COMMON:MSG_MAIN_POPUP_16'),
      }),
    accessReview: asAccessReview(kind, obj, 'patch'),
  }),
  ModifyCount: (kind, obj) => ({
    label: 'COMMON:MSG_MAIN_ACTIONBUTTON_7',
    callback: t =>
      configureReplicaCountModal({
        resourceKind: kind,
        resource: obj,
        title: t('COMMON:MSG_MAIN_ACTIONBUTTON_7'),
        message: t('SINGLE:MSG_DEPLOYMENTS_EDITDEPLOYMENTS_EDITPODCOUNT_2', { 0: ResourceLabel(kind, t) }),
        submitText: t('COMMON:MSG_COMMON_BUTTON_COMMIT_3'),
        cancelText: t('COMMON:MSG_COMMON_BUTTON_COMMIT_2'),
      }),
    accessReview: asAccessReview(kind, obj, 'patch'),
  }),
  ModifyTaints: (kind, obj) => ({
    label: 'SINGLE:MSG_NODES_NODEDETAILS_4',
    callback: t =>
      taintsModal({
        resourceKind: kind,
        resource: obj,
        modalClassName: 'modal-lg',
        submitText: t('COMMON:MSG_COMMON_BUTTON_COMMIT_3'),
        title: t('SINGLE:MSG_NODES_NODEDETAILS_4'),
        addMoreText: t('SINGLE:MSG_NODES_NODEDETAILS_5'),
        label: t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_113'),
      }),
    accessReview: asAccessReview(kind, obj, 'patch'),
  }),
  ModifyTolerations: (kind, obj) => ({
    label: 'Edit Tolerations',
    callback: () =>
      tolerationsModal({
        resourceKind: kind,
        resource: obj,
        modalClassName: 'modal-lg',
      }),
    accessReview: asAccessReview(kind, obj, 'patch'),
  }),
  AddStorage: (kind, obj) => ({
    label: 'COMMON:MSG_MAIN_ACTIONBUTTON_13',
    href: `${resourceObjPath(obj, kind.crd ? referenceForModel(kind) : kind.kind)}/attach-storage`,
    accessReview: asAccessReview(kind, obj, 'patch'),
  }),
  ExpandPVC: (kind, obj) => ({
    label: 'COMMON:MSG_MAIN_ACTIONBUTTON_3',
    callback: () =>
      expandPVCModal({
        kind,
        resource: obj,
      }),
    accessReview: asAccessReview(kind, obj, 'patch'),
  }),
  Connect: (kind, obj, resources, customData: { label: string; url: string }) => {
    return {
      label: customData?.label || '',
      icon: <ExternalLinkAltIcon color="var(--pf-global--Color--dark-200)" />,
      iconPosition: 'right',
      callback: () => {
        if (customData?.url) {
          window.open(customData.url);
        }
      },
      accessReview: asAccessReview(kind, obj, 'patch'),
    };
  },
};

// The common menu actions that most resource share
kebabFactory.common = [kebabFactory.ModifyLabels, kebabFactory.ModifyAnnotations, kebabFactory.Edit, kebabFactory.Delete];
export const getExtensionsKebabActionsForKind = (kind: K8sKind) => {
  const extensionActions = [];
  _.forEach(plugins.registry.getKebabActions(), (getActions: any) => {
    if (getActions) {
      _.forEach(getActions.properties.getKebabActionsForKind(kind), kebabAction => {
        extensionActions.push(kebabAction);
      });
    }
  });
  return extensionActions;
};

export const ResourceKebab = connectToModel((props: ResourceKebabProps) => {
  const { actions, kind, kindObj, resource, isDisabled, extraResources, customData } = props;

  if (kind === 'Tag') {
    const options = _.reject(
      actions.map(a => a(kindObj, resource, extraResources, customData)),
      'hidden',
    );
    return <Kebab options={options} key={resource.version} isDisabled={isDisabled !== undefined ? isDisabled : _.get(resource.metadata, 'deletionTimestamp')} />;
  }
  if (kind === 'SasApp') {
    console.log('역시 넌 여기야', actions, kind, kindObj, resource, isDisabled, extraResources, customData);
    return <Kebab key={resource.version} isDisabled={isDisabled !== undefined ? isDisabled : _.get(resource.metadata, 'deletionTimestamp')} />;
  }

  if (!kindObj) {
    return null;
  }
  const options = _.reject(
    actions.map(a => a(kindObj, resource, extraResources, customData)),
    'hidden',
  );
  return <Kebab options={options} key={resource.metadata.uid} isDisabled={isDisabled !== undefined ? isDisabled : _.get(resource.metadata, 'deletionTimestamp')} />;
});

class Kebab_ extends React.Component<any, { active: boolean }> {
  static factory: KebabFactory = kebabFactory;
  static getExtensionsActionsForKind = getExtensionsKebabActionsForKind;

  // public static columnClass: string = 'pf-c-table__action';
  public static columnClass: string = 'dropdown-kebab-pf pf-c-table__action';

  private dropdownElement = React.createRef<HTMLButtonElement>();

  constructor(props) {
    super(props);
    this.state = {
      active: false,
    };
  }

  onClick = (event, option: KebabOption) => {
    event.preventDefault();

    const { t } = this.props;

    if (option.callback) {
      option.callback(t);
    }

    this.hide();

    if (option.href) {
      history.push(option.href);
    }
  };

  hide = () => {
    this.dropdownElement.current && this.dropdownElement.current.focus();
    this.setState({ active: false });
  };

  toggle = () => {
    this.setState(state => ({ active: !state.active }));
  };

  onHover = () => {
    // Check access when hovering over a kebab to minimize flicker when opened.
    // This depends on `checkAccess` being memoized.
    _.each(this.props.options, (option: KebabOption) => {
      if (option.accessReview) {
        checkAccess(option.accessReview);
      }
    });
  };

  handleRequestClose = (e?: MouseEvent) => {
    if (!e || !this.dropdownElement.current || !this.dropdownElement.current.contains(e.target as Node)) {
      this.hide();
    }
  };

  getPopperReference = () => this.dropdownElement.current;

  render() {
    const { options, isDisabled } = this.props;

    const menuOptions = kebabOptionsToMenu(options);

    return (
      <div
        className={classNames({
          'dropdown pf-c-dropdown': true,
          'pf-m-expanded': this.state.active,
        })}
      >
        <button ref={this.dropdownElement} type="button" aria-expanded={this.state.active} aria-haspopup="true" aria-label="Actions" className="pf-c-dropdown__toggle pf-m-plain" data-test-id="kebab-button" disabled={isDisabled} onClick={this.toggle} onFocus={this.onHover} onMouseEnter={this.onHover}>
          <EllipsisVIcon />
        </button>
        <Popper open={!isDisabled && this.state.active} placement="bottom-end" closeOnEsc closeOnOutsideClick onRequestClose={this.handleRequestClose} reference={this.getPopperReference}>
          <FocusTrap focusTrapOptions={{ clickOutsideDeactivates: true, returnFocusOnDeactivate: false }}>
            <div className="pf-c-dropdown pf-m-expanded">
              <KebabMenuItems options={menuOptions} onClick={this.onClick} className="oc-kebab__popper-items" focusItem={menuOptions[0]} />
            </div>
          </FocusTrap>
        </Popper>
      </div>
    );
  }
}

export const Kebab = hoistStatics(withTranslation()(Kebab_), Kebab_);

export type KebabOption = {
  hidden?: boolean;
  label: string;
  href?: string;
  callback?: (t?: TFunction) => any;
  accessReview?: AccessReviewResourceAttributes;
  isDisabled?: boolean;
  tooltip?: string;
  // a `/` separated string where each segment denotes a new sub menu entry
  // Eg. `Menu 1/Menu 2/Menu 3`
  path?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  needTranslate?: boolean;
};

export type KebabAction = (kind: K8sKind, obj: K8sResourceKind | any, resources?: any, customData?: any) => KebabOption;

export type ResourceKebabProps = {
  kindObj: K8sKind;
  actions: KebabAction[];
  kind: K8sResourceKindReference;
  resource: K8sResourceKind | any;
  isDisabled?: boolean;
  extraResources?: { [prop: string]: K8sResourceKind | K8sResourceKind[] };
  customData?: any;
};

type KebabSubMenu = {
  label: string;
  children: KebabMenuOption[];
};

export type KebabMenuOption = KebabSubMenu | KebabOption;

type KebabItemProps = {
  option: KebabOption;
  onClick: (event: React.MouseEvent<{}>, option: KebabOption) => void;
  autoFocus?: boolean;
  onEscape?: () => void;
};

export type KebabItemsProps = {
  options: KebabOption[];
  onClick: (event: React.MouseEvent<{}>, option: KebabOption) => void;
  focusItem?: KebabOption;
  className?: string;
};

export type KebabFactory = { [name: string]: KebabAction } & { common?: KebabAction[] };

KebabItems.displayName = 'KebabItems';
ResourceKebab.displayName = 'ResourceKebab';
