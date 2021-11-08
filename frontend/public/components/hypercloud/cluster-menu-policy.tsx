import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Accordion, AccordionContent, AccordionItem, AccordionToggle } from '@patternfly/react-core';
import { K8sResourceKind, K8sKind, k8sPatch, k8sList } from '@console/internal/module/k8s';
import { DetailsPage, ListPage } from '../factory';
import { Kebab, KebabAction, detailsPage, navFactory, ResourceKebab, ResourceLink, ResourceSummary, SectionHeading, Timestamp } from '../utils';
import { ClusterMenuPolicyModel } from '../../models';
import { TableProps } from './utils/default-list-component';
import { ClusterMenuPolicyStatusReducer } from '@console/dev-console/src/utils/hc-status-reducers';
import { SelectorInput } from '@console/internal/components/utils';
import { MenuType, CUSTOM_LABEL_TYPE } from '@console/internal/hypercloud/menu/menu-types';
import { errorModal } from '../modals/error-modal';
import { ResourceLabel } from '@console/internal/models/hypercloud/resource-plural';
import { getMenuTitle, getContainerLabel } from '@console/internal/components/hypercloud/utils/menu-utils';
import { MenuIconTitle } from '@console/internal/hypercloud/menu/MenuIcon';
import { PerspectiveLabelKeys } from '@console/internal/hypercloud/perspectives';

const kind = ClusterMenuPolicyModel.kind;

const toggleActivated = (model: K8sKind, obj: K8sResourceKind) => {
  const truePatch = [
    {
      path: '/metadata/labels',
      op: 'replace',
      value: SelectorInput.objectify(['primary=true']),
    },
  ];

  const falsePatch = [
    {
      path: '/metadata/labels',
      op: 'replace',
      value: SelectorInput.objectify(['primary=false']),
    },
  ];

  k8sList(ClusterMenuPolicyModel).then(cmpList => {
    cmpList?.forEach(cmp => {
      if (obj.metadata?.name !== cmp.metadata?.name) {
        k8sPatch(model, cmp, falsePatch);
      }
    });
  });

  return k8sPatch(model, obj, truePatch);
};

const deactivateCmp = (model: K8sKind, obj: K8sResourceKind) => {
  const falsePatch = [
    {
      path: '/metadata/labels',
      op: 'replace',
      value: SelectorInput.objectify(['primary=false']),
    },
  ];

  return k8sPatch(model, obj, falsePatch);
};

const ActivateAction: KebabAction = (kind: K8sKind, obj: any) => {
  const primaryValue = obj?.metadata?.labels?.primary;
  return {
    label: primaryValue === 'true' ? '비활성화' : '활성화',
    callback: () => (primaryValue === 'true' ? deactivateCmp(kind, obj).catch(err => errorModal({ error: err.message })) : toggleActivated(kind, obj).catch(err => errorModal({ error: err.message }))),
    accessReview: {
      group: kind.apiGroup,
      resource: kind.plural,
      name: obj.metadata.name,
      namespace: obj.metadata.namespace,
      verb: 'patch',
    },
  };
};

const menuActions: KebabAction[] = [ActivateAction, ...Kebab.factory.common];

const tableProps: TableProps = {
  header: [
    {
      title: 'COMMON:MSG_MAIN_TABLEHEADER_1',
      sortField: 'metadata.name',
    },
    {
      title: '활성화 여부',
      sortFunc: 'ClusterMenuPolicyStatusReducer',
    },
    {
      title: 'COMMON:MSG_MAIN_TABLEHEADER_12',
      sortField: 'metadata.creationTimestamp',
    },
    {
      title: '',
      transforms: null,
      props: { className: Kebab.columnClass },
    },
  ],
  row: (obj: K8sResourceKind) => [
    {
      children: <ResourceLink kind={kind} name={obj.metadata.name} namespace={obj.metadata.namespace} title={obj.metadata.uid} />,
    },
    {
      children: <>{ClusterMenuPolicyStatusReducer(obj)}</>,
    },
    {
      children: <Timestamp timestamp={obj.metadata.creationTimestamp} />,
    },
    {
      className: Kebab.columnClass,
      children: <ResourceKebab actions={menuActions} kind={kind} resource={obj} />,
    },
  ],
  customSorts: {
    ClusterMenuPolicyStatusReducer,
  },
};

type MenuContentItem = {
  title: string;
  type: string;
  childrenMenus: string[];
};

type AccordionBlockProps = {
  title: string;
  contentData: MenuContentItem[];
  onToggle: any;
  expanded: string[];
  index: number;
};

const AccordionBlock = (props: AccordionBlockProps) => {
  const { title, contentData, onToggle, expanded, index } = props;
  const toggleId = `${title}-toggle${index}`;
  const contentId = `${title}-content${index}`;

  const menuDetails = contentData?.map(data => {
    return (
      <div style={{ display: 'flex', justifyContent: 'start', marginBottom: 15 }}>
        <MenuIconTitle type={data.type} title={data.title} />
        <div style={{ display: 'inline-block', width: 300 }}>
          {data.childrenMenus?.map(menuString => (
            <div style={{ marginLeft: 20, color: 'black', fontSize: '13px' }}>{menuString}</div>
          ))}
        </div>
      </div>
    );
  });
  return (
    <AccordionItem>
      <AccordionToggle
        id={toggleId}
        onClick={() => {
          onToggle(toggleId);
        }}
        isExpanded={expanded.includes(toggleId)}
      >
        {title}
      </AccordionToggle>
      <AccordionContent id={contentId} isHidden={!expanded.includes(toggleId)}>
        {menuDetails}
      </AccordionContent>
    </AccordionItem>
  );
};

const MenuPreviewTable = ({ obj: cmp }) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = React.useState([]);
  const [contents, setContents] = React.useState([]);

  const toggle = id => {
    const index = expanded.indexOf(id);
    const newExpanded = index >= 0 ? [...expanded.slice(0, index), ...expanded.slice(index + 1, expanded.length)] : [...expanded, id];
    setExpanded(newExpanded);
  };

  React.useEffect(() => {
    const menuContents = cmp.menuTabs?.map((menuTab, index) => {
      const contentData: MenuContentItem[] = menuTab.menus?.map(menu => {
        const menuType = menu.menuType;
        switch (menuType) {
          case MenuType.NEW_TAB_LINK:
            return { title: menu.label || '', childrenMenus: null, type: CUSTOM_LABEL_TYPE };
          case MenuType.REGISTERED_MENU:
            const { label, type: registeredMenuType } = getMenuTitle(menu.kind || '', t);
            return { title: label, childrenMenus: null, type: registeredMenuType };
          case MenuType.CONTAINER:
            const childrenMenus = menu.innerMenus?.map(menu => {
              return menu.type === MenuType.NEW_TAB_LINK ? menu.label : getMenuTitle(menu.kind || '', t)?.label;
            });
            const { containerLabel, type: containerType } = getContainerLabel(menu.label, t);
            return { title: containerLabel, childrenMenus, type: containerType };
          default:
        }
      });
      return <AccordionBlock key={menuTab.name} title={t(PerspectiveLabelKeys[menuTab.name])} onToggle={toggle} expanded={expanded} index={index} contentData={contentData} />;
    });
    setContents(menuContents);
  }, [cmp, expanded]);

  return <Accordion className="hc-cmp-detail-accrodion">{contents}</Accordion>;
};

const ClusterMenuPolicyDetails: React.FC<ClusterMenuPolicyDetailsProps> = ({ obj: cmp }) => {
  const { t } = useTranslation();

  return (
    <>
      <div className="co-m-pane__body">
        <SectionHeading text={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_1', { 0: ResourceLabel(cmp, t) })} />
        <div className="row">
          <div className="col-lg-6">
            <ResourceSummary resource={cmp} />
          </div>
        </div>
      </div>
      <div className="co-m-pane__body">
        <SectionHeading text={t('메뉴')} />
        <MenuPreviewTable obj={cmp} />
      </div>
    </>
  );
};

const { details, editResource } = navFactory;

export const ClusterMenuPoliciesPage: React.FC<ClusterMenuPolicyPageProps> = props => <ListPage canCreate={true} tableProps={tableProps} kind={kind} {...props} />;

export const ClusterMenuPoliciesDetailsPage: React.FC<ClusterMenuPoliciesDetailsPageProps> = props => <DetailsPage {...props} kind={kind} menuActions={menuActions} pages={[details(detailsPage(ClusterMenuPolicyDetails)), editResource()]} />;

type ClusterMenuPolicyDetailsProps = {
  obj: K8sResourceKind;
};

type ClusterMenuPolicyPageProps = {
  showTitle?: boolean;
  namespace?: string;
  selector?: any;
};

type ClusterMenuPoliciesDetailsPageProps = {
  match: any;
};
