import * as _ from 'lodash-es';
import * as React from 'react';
import { match as RMatch } from 'react-router';
import { WithCommonForm } from '../create-form';
import { Controller } from 'react-hook-form';
import { coFetchJSON } from '../../../../co-fetch';
import { NamespaceModel, ClusterRoleModel, RoleModel } from '../../../../models';
import { k8sList } from '../../../../module/k8s';
import { Section } from '../../utils/section';
import { LoadingInline } from '../../../utils';
import { TextInput } from '../../utils/text-input';
import { RadioGroup } from '../../utils/radio';
import { ResourceListDropdown } from '../../utils/resource-list-dropdown';
import { useFormContext, useWatch } from 'react-hook-form';
import { Button } from '@patternfly/react-core';
import { ListView } from '../../utils/list-view';
import { CheckboxGroup } from '../../utils/checkbox';
import { MinusCircleIcon } from '@patternfly/react-icons';
import { DropdownWithRef } from '../../utils/dropdown-new';
//import { useTranslation } from 'react-i18next';

const kindItems = [
  // RadioGroup 컴포넌트에 넣어줄 items
  {
    title: '네임스페이스 롤 (Role)',
    desc: '네임스페이스 롤은 선택된 네임스페이스에 적용됩니다.',
    value: 'Role',
  },
  {
    title: '클러스터 롤 (ClusterRole)',
    desc: '클러스터 롤은 모든 네임스페이스에 적용됩니다.',
    value: 'ClusterRole',
  },
];

let apiGroupList = {};
const coreResources = {
  '*': 'All',
  configmaps: 'configmaps',
  endpoints: 'endpoints',
  events: 'events',
  limitranges: 'limitranges',
  namespaces: 'namespaces',
  nodes: 'nodes',
  persistentvolumeclaims: 'persistentvolumeclaims',
  persistentvolumes: 'persistentvolumes',
  pods: 'pods',
  replicationcontrollers: 'replicationcontrollers',
  resourcequotas: 'resourcequotas',
  secrets: 'secrets',
  serviceaccounts: 'serviceaccounts',
  services: 'services',
};
const defaultVerbs = [
  { name: 'create', label: 'Create' },
  { name: 'delete', label: 'Delete' },
  { name: 'get', label: 'Get' },
  { name: 'list', label: 'List' },
  { name: 'patch', label: 'Patch' },
  { name: 'update', label: 'Update' },
  { name: 'watch', label: 'Watch' },
];

const defaultValues = {
  // requestDo에 넣어줄 형식으로 defaultValues 작성
  apiGroup: '*',
};

const compareObjByName = (a, b) => {
  const nameA = a.name.toUpperCase();
  const nameB = b.name.toUpperCase();
  if (nameA < nameB) {
    return -1;
  } else if (nameA > nameB) {
    return 1;
  } else {
    return 0;
  }
};

const roleFormFactory = params => {
  return WithCommonForm(CreateRoleComponent, params, defaultValues);
};
const RuleItem = props => {
  const { item, name, index, onDeleteClick, methods, ListActions } = props;

  const [resourceList, setResourceList] = React.useState<{ [key: string]: string }>({ '*': 'All' });
  const { control } = methods;
  const apiGroup = useWatch<{ label: string; value: string }>({
    control: control,
    name: `${name}[${index}].apiGroup`,
  });

  React.useEffect(() => {
    const apiGroupValue = apiGroup?.value || '*';
    if (apiGroupValue === '*') {
      setResourceList({ '*': 'All' });
    } else if (apiGroupValue === 'Core') {
      setResourceList(coreResources);
    } else {
      coFetchJSON(`${document.location.origin}/api/kubernetes/apis/${apiGroupList[apiGroupValue]}`).then(
        data => {
          let newResourceList = { '*': 'All' };
          data.resources.sort(compareObjByName);
          data.resources.forEach(resource => (newResourceList[resource.name] = resource.name));
          setResourceList(newResourceList);
        },
        err => {
          console.log('Fail to get resource list');
        },
      );
    }
  }, [apiGroup]);

  return (
    <>
      {index === 0 ? null : <div className="co-form-section__separator" />}
      <div className="row" key={item.id}>
        <div className="col-xs-4 pairs-list__value-field">
          <Section label="API 그룹" id={`apigroup[${index}]`} isRequired={true}>
            <Controller
              as={<DropdownWithRef name={`${name}[${index}].apiGroup`} defaultValue={{ label: item.apiGroup.label, value: item.apiGroup.value }} methods={methods} useResourceItemsFormatter={false} items={apiGroupList} />}
              control={methods.control}
              name={`${name}[${index}].apiGroup`}
              onChange={([selected]) => {
                return { value: selected };
              }}
              defaultValue={{ label: item.apiGroup.label, value: item.apiGroup.value }}
            />
            {/* <Dropdown name={`${name}[${index}].apiGroup`} items={apiGroupList} defaultValue={item.apiGroup} methods={methods} {...ListActions.registerWithInitValue(`${name}[${index}].apiGroup`, item.apiGroup)} /> */}
          </Section>
          <Section label="리소스" id={`resource[${index}]`} isRequired={true}>
            <Controller
              as={<DropdownWithRef name={`${name}[${index}].resource`} defaultValue={{ label: item.resource.label, value: item.resource.value }} methods={methods} useResourceItemsFormatter={false} items={resourceList} />}
              control={methods.control}
              name={`${name}[${index}].resource`}
              onChange={([selected]) => {
                return { value: selected };
              }}
              defaultValue={{ label: item.resource.label, value: item.resource.value }}
            />
            {/* <Dropdown name={`${name}[${index}].resource`} items={resourceList} defaultValue={item.resource} methods={methods} {...ListActions.registerWithInitValue(`${name}[${index}].resource`, item.resource)} /> */}
          </Section>
          <Section label="벌브" id={`verb[${index}]`} isRequired={true}>
            <CheckboxGroup name={`${name}[${index}].verbs`} items={defaultVerbs} useAll defaultValue={item.verbs} methods={methods} {...ListActions.registerWithInitValue(`${name}[${index}].verbs`, item.verbs)} />
          </Section>
        </div>
        <div className="col-xs-1 pairs-list__action">
          <Button type="button" data-test-id="pairs-list__delete-btn" className="pairs-list__span-btns" onClick={onDeleteClick} variant="plain">
            <MinusCircleIcon className="pairs-list__side-btn pairs-list__delete-icon co-icon-space-r" />
            <span>규칙 제거</span>
          </Button>
        </div>
      </div>
    </>
  );
};

const ruleItemRenderer = (methods, name, item, index, ListActions, ListDefaultIcons) => {
  const onDeleteClick = () => {
    const values = _.get(ListActions.getValues(), name);
    if (!!values && values.length > 1) {
      ListActions.remove(index);
    }
  };

  return <RuleItem item={item} name={name} index={index as number} onDeleteClick={onDeleteClick} methods={methods} ListActions={ListActions} />;
};

const CreateRoleComponent: React.FC<RoleFormProps> = props => {
  const [namespaces, setNamespaces] = React.useState([]);
  const [loaded, setLoaded] = React.useState(false);
  React.useEffect(() => {
    k8sList(NamespaceModel).then(list => setNamespaces(list));
    coFetchJSON('api/kubernetes/apis').then(result => {
      let list = { '*': 'All', Core: 'Core' };
      result.groups.sort(compareObjByName);
      result.groups.forEach(apigroup => {
        list[apigroup.name] = apigroup.preferredVersion.groupVersion;
      });
      apiGroupList = list;
      setLoaded(true);
    });
  }, []);

  const methods = useFormContext();

  const kindToggle = useWatch({
    control: methods.control,
    name: 'kind',
    defaultValue: 'Role',
  });

  //const { t } = useTranslation();

  //metadata: { namespace: params.ns }
  return (
    <>
      <Section label="롤 타입" id="roletype" isRequired>
        <RadioGroup name="kind" items={kindItems} inline={false} initValue={kindToggle} />
      </Section>

      <div className="co-form-section__separator" />

      <Section label="롤 이름" id="name" isRequired={true}>
        <TextInput inputClassName="pf-c-form-control" id="metadata.name" name="metadata.name" defaultValue="role-example" />
      </Section>

      {kindToggle === 'Role' && (
        <Section label="네임스페이스" id="namespace" isRequired={true}>
          <ResourceListDropdown name="metadata.namespace" useHookForm resourceList={namespaces} kind="Namespace" resourceType="Namespace" type="single" placeholder="네임스페이스 선택" />
        </Section>
      )}

      {loaded ? (
        <Section id="rules" isRequired={true}>
          <ListView methods={methods} name={`rules`} addButtonText="규칙 추가" headerFragment={<></>} itemRenderer={ruleItemRenderer} defaultItem={{ apiGroup: { label: 'All', value: '*' }, resource: { label: 'All', value: '*' }, verbs: ['*'] }} defaultValues={[{ apiGroup: { label: 'All', value: '*' }, resource: { label: 'All', value: '*' }, verbs: ['*'] }]} />
        </Section>
      ) : (
        <LoadingInline />
      )}
    </>
  );
};

export const CreateRole: React.FC<CreateRoleProps> = ({ match: { params }, kind }) => {
  const formComponent = roleFormFactory(params);
  const RoleFormComponent = formComponent;
  return <RoleFormComponent fixed={{}} explanation={''} titleVerb="Create" onSubmitCallback={onSubmitCallback} isCreate={true} useDefaultForm={false} />;
};

export const onSubmitCallback = data => {
  let apiVersion = data.kind === 'Role' ? `${RoleModel.apiGroup}/${RoleModel.apiVersion}` : `${ClusterRoleModel.apiGroup}/${ClusterRoleModel.apiVersion}`;

  let rules = data.rules.map(rule => {
    const apiGroup = rule.apiGroup?.value;
    const reosurce = rule.resource?.value;

    return {
      apiGroups: apiGroup === 'Core' ? [''] : [apiGroup ?? '*'],
      resources: [reosurce ?? '*'],
      verbs: rule.verbs ?? ['*'],
    };
  });

  delete data.apiVersion;
  delete data.rules;

  data = _.defaultsDeep(data, { apiVersion: apiVersion, rules: rules });
  return data;
};

type CreateRoleProps = {
  match: RMatch<{
    ns?: string;
  }>;
  kind: string;
  fixed: object;
  explanation: string;
  titleVerb: string;
  saveButtonText?: string;
  isCreate: boolean;
};

type RoleFormProps = {
  onChange: Function;
  stringData: {
    [key: string]: string;
  };
  isCreate: boolean;
};
