import * as React from 'react';
import * as _ from 'lodash-es';
import { connect } from 'react-redux';
import { Map as ImmutableMap, OrderedMap, Set as ImmutableSet } from 'immutable';
import * as classNames from 'classnames';
import * as fuzzy from 'fuzzysearch';

import { Dropdown, ResourceIcon } from './utils';
import { apiVersionForReference, K8sKind, K8sResourceKindReference, modelFor, referenceForModel, getResources, allModels } from '../module/k8s';
import { Badge, Checkbox } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';

// Blacklist known duplicate resources.
const blacklistGroups = ImmutableSet([
  // Prefer rbac.authorization.k8s.io/v1, which has the same resources.
  'authorization.openshift.io',
]);

const blacklistResources = ImmutableSet([
  // Prefer core/v1
  'events.k8s.io/v1beta1.Event',
]);

// reducers/k8s.ts - ReceivedResources 액션 참고
const getAllModels = (models: K8sKind[]): ImmutableMap<K8sResourceKindReference, K8sKind> => {
  return models.reduce((prevState, newModel) => {
    // FIXME: Need to use `kind` as model reference for legacy components accessing k8s primitives
    const [modelRef, model] = allModels().findEntry(staticModel => referenceForModel(staticModel) === referenceForModel(newModel)) || [referenceForModel(newModel), newModel];
    // Verbs and short names are not part of the static model definitions, so use the values found during discovery.
    return prevState.set(modelRef, {
      ...model,
      verbs: newModel.verbs,
      shortNames: newModel.shortNames,
    });
  }, ImmutableMap<K8sResourceKindReference, K8sKind>());
};

const DropdownItem: React.SFC<DropdownItemProps> = ({ model, showGroup, checked }) => (
  <>
    <span className={'co-resource-item'}>
      <Checkbox tabIndex={-1} id={`${model.apiGroup}:${model.apiVersion}:${model.kind}`} checked={checked} />
      <span className="co-resource-icon--fixed-width">
        <ResourceIcon kind={referenceForModel(model)} />
      </span>
      <span className="co-resource-item__resource-name">
        <span>
          {model.kind}
          {model.badge && <span className="co-resource-item__tech-dev-preview">{model.badge}</span>}
        </span>
        {showGroup && (
          <span className="co-resource-item__resource-api text-muted co-truncate show co-nowrap small">
            {model.apiGroup || 'core'}/{model.apiVersion}
          </span>
        )}
      </span>
    </span>
  </>
);

const DropdownResourceItem: React.SFC<DropdownResourceItemProps> = ({ name, checked, kind }) => (
  <>
    <span className={'co-resource-item'}>
      <Checkbox tabIndex={-1} id={name} checked={checked} />
      <span className="co-resource-icon--fixed-width">
        <ResourceIcon kind={kind} />
      </span>
      <span className="co-resource-item__resource-name">
        <span>{name}</span>
      </span>
    </span>
  </>
);

const ResourceListDropdown_: React.SFC<ResourceListDropdownProps> = props => {
  const { selected, onChange, allModels, showAll, className, preferredVersions, type } = props;
  const { t } = useTranslation();
  const [newModels, setNewModels] = React.useState(ImmutableMap<K8sResourceKindReference, K8sKind>());

  React.useEffect(() => {
    let ignore = false;
    getResources()
      .then(resources => {
        if (ignore) {
          return;
        }
        setNewModels(getAllModels(resources.models));
      })
      .catch(e => {
        ignore = true;
      });
    return () => {
      ignore = true;
    };
  }, []);

  const resources = allModels
    .filter(({ apiGroup, apiVersion, kind, verbs }) => {
      // Remove blacklisted items.
      if (blacklistGroups.has(apiGroup) || blacklistResources.has(`${apiGroup}/${apiVersion}.${kind}`)) {
        return false;
      }

      // Only show resources that can be listed.
      if (!_.isEmpty(verbs) && !_.includes(verbs, 'list')) {
        return false;
      }

      // 삭제된 리소스일 경우 드롭다운 리스트에서 삭제.
      if (!newModels.find(m => kind === m.kind)) {
        return false;
      }

      // Only show preferred version for resources in the same API group.
      const preferred = (m: K8sKind) => preferredVersions.some(v => v.groupVersion === apiVersionForReference(referenceForModel(m)));
      const sameGroupKind = (m: K8sKind) => m.kind === kind && m.apiGroup === apiGroup && m.apiVersion !== apiVersion;

      return !allModels.find(m => sameGroupKind(m) && preferred(m));
    })
    .toOrderedMap()
    .sortBy(({ kind, apiGroup }) => `${kind} ${apiGroup}`);

  // Track duplicate names so we know when to show the group.
  const kinds = resources.groupBy(m => m.kind);
  const isDup = kind => kinds.get(kind).size > 1;

  const isKindSelected = (kind: string) => {
    return _.includes(selected, kind);
  };
  // Create dropdown items for each resource.
  const items = resources.map(model => <DropdownItem key={referenceForModel(model)} model={model} showGroup={isDup(model.kind)} checked={isKindSelected(referenceForModel(model))} />) as OrderedMap<string, JSX.Element>;
  // Add an "All" item to the top if `showAll`.
  const allItems = (showAll
    ? OrderedMap({
        All: (
          <>
            <span className="co-resource-item">
              <Checkbox id="all-resources" isChecked={isKindSelected('All')} />
              <span className="co-resource-icon--fixed-width">
                <ResourceIcon kind="All" />
              </span>
              <span className="co-resource-item__resource-name">All Resources</span>
            </span>
          </>
        ),
      }).concat(items)
    : items
  ).toJS() as { [s: string]: JSX.Element };

  const autocompleteFilter = (text, item) => {
    const { model } = item.props;
    if (!model) {
      return false;
    }

    return fuzzy(_.toLower(text), _.toLower(model.kind));
  };

  const handleSelected = (value: string) => {
    value === 'All' ? onChange('All') : onChange(referenceForModel(modelFor(value)));
  };

  return (
    <Dropdown
      menuClassName="dropdown-menu--text-wrap"
      className={classNames('co-type-selector', className)}
      items={allItems}
      title={
        <div key="title-resource">
          {t('COMMON:MSG_COMMON_FILTER_1')} <Badge isRead>{selected.length === 1 && selected[0] === 'All' ? 'All' : selected.length}</Badge>
        </div>
      }
      onChange={handleSelected}
      autocompleteFilter={autocompleteFilter}
      autocompletePlaceholder={t('COMMON:MSG_COMMON_FILTER_2')}
      type={type}
    />
  );
};

const resourceListDropdownStateToProps = ({ k8s }) => ({
  allModels: k8s.getIn(['RESOURCES', 'models']),
  preferredVersions: k8s.getIn(['RESOURCES', 'preferredVersions']),
});

export const ResourceListDropdown = connect(resourceListDropdownStateToProps)(ResourceListDropdown_);

export const RegistryListDropdown_: React.SFC<RegistryListDropdownProps> = props => {
  const { selected, onChange, /*setAllData, */ allData, showAll, className, type } = props;

  const getName = map => {
    return map.get('metadata').get('name');
  };

  const resources = [];
  for (let item of Array.from(allData)) {
    resources.push(getName(item[1]));
  }

  const isResourceSelected = (resource: string) => {
    return _.includes(selected, resource);
  };

  const items = allData.map(resource => <DropdownResourceItem key={getName(resource)} name={getName(resource)} checked={isResourceSelected(getName(resource))} kind="Registry" />) as OrderedMap<string, JSX.Element>;

  const allItems = (showAll
    ? OrderedMap({
        All: (
          <>
            <span className="co-resource-item">
              <Checkbox id="all-resources" isChecked={isResourceSelected('All')} />
              <span className="co-resource-icon--fixed-width">
                <ResourceIcon kind="All" />
              </span>
              <span className="co-resource-item__resource-name">All Registries</span>
            </span>
          </>
        ),
      }).concat(items)
    : items
  ).toJS() as { [s: string]: JSX.Element };

  const autocompleteFilter = (text, item) => {
    const { model } = item.props;
    if (!model) {
      return false;
    }

    return fuzzy(_.toLower(text), _.toLower(model.kind));
  };

  const handleSelected = (value: string) => {
    if (value === 'All') {
      onChange('All');
      // setAllData(resources);
    } else {
      onChange(value.split(')-')[1]);
    }
  };

  return (
    <Dropdown
      menuClassName="dropdown-menu--text-wrap"
      className={classNames('co-type-selector', className)}
      items={allItems}
      title={
        <div key="title-resource">
          Registries <Badge isRead>{selected.length === 1 && selected[0] === 'All' ? 'All' : selected.length}</Badge>
        </div>
      }
      onChange={handleSelected}
      autocompleteFilter={autocompleteFilter}
      autocompletePlaceholder="Select Registry"
      type={type}
    />
  );
};

const registryListDropdownStateToProps = ({ k8s, UI }) => {
  let namespace = UI.getIn(['activeNamespace']);
  let registryKey = 'tmax.io~v1~Registry';
  if (namespace !== '#ALL_NS#') {
    registryKey += `---{"ns":"${namespace}"}`;
  }
  return {
    allData: k8s.getIn([registryKey, 'data']),
  };
};

export const RegistryListDropdown = connect(registryListDropdownStateToProps)(RegistryListDropdown_);

export type RegistryListDropdownProps = {
  selected: K8sResourceKindReference[];
  onChange: (value: string) => void;
  setAllData: (allData: string[]) => void;
  allData: any;
  className?: string;
  id?: string;
  showAll?: boolean;
  type?: string;
};

export type ResourceListDropdownProps = {
  selected: K8sResourceKindReference[];
  onChange: (value: string) => void;
  allModels: ImmutableMap<K8sResourceKindReference, K8sKind>;
  preferredVersions: { groupVersion: string; version: string }[];
  className?: string;
  id?: string;
  showAll?: boolean;
  type?: string;
};

type DropdownItemProps = {
  model: K8sKind;
  showGroup?: boolean;
  checked?: boolean;
};

type DropdownResourceItemProps = {
  name: string;
  checked?: boolean;
  kind: string;
};
