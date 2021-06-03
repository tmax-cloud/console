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
import { useTranslation } from 'react-i18next';

const kindItems = t => [
  // RadioGroup 컴포넌트에 넣어줄 items
  {
    title: t('SINGLE:MSG_ROLES_CREATEFORM_DIV2_2'),
    desc: t('SINGLE:MSG_ROLES_CREATEFORM_DIV2_3'),
    value: 'Role',
  },
  {
    title: t('SINGLE:MSG_ROLES_CREATEFORM_DIV2_4'),
    desc: t('SINGLE:MSG_ROLES_CREATEFORM_DIV2_5'),
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

const defaultValuesTemplate = {
  // requestDo에 넣어줄 형식으로 defaultValues 작성
  apiGroup: '*'  
  /*
  metadata: {
    name: 'example-name',
  },  
  rules: [
    {
      verbs: ['*'],
      apiGroups: ['*'],
      resources: ['*'],      
    },
  ],
  */  
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

const roleFormFactory = (params, obj) => {
  console.log('defaultValuesTemplate: ', defaultValuesTemplate);

  const defaultValues = obj || defaultValuesTemplate;
  /*
  if (defaultValues.rules[0].apiGroups[0] === '') { //"" indicates the core API group
    //defaultValues.rules[0].apiGroups[0] = {'All': '*'};
    defaultValues.rules[0].apiGroups[0] = 'Core';
  }
  if (defaultValues.rules[0].apiGroups[0] === '*') {
    defaultValues.rules[0].apiGroups[0] = { label: 'All', value : '*' };    
  }
  else if (defaultValues.rules[0].apiGroups[0] === 'Core') {
    defaultValues.rules[0].apiGroups[0] = { label: 'Core', value : 'Core' };    
  }
  else {
    let apiGroups = defaultValues.rules[0].apiGroups[0];
    defaultValues.rules[0].apiGroups[0] = { label: apiGroups, value : apiGroups };    
  }

  if (defaultValues.rules[0].resources[0] === '') {    
    defaultValues.rules[0].resources[0] = '*';
  }
  if (defaultValues.rules[0].resources[0] === '*') {
    defaultValues.rules[0].resources[0] = { label: 'All', value : '*' };    
  }
  else {
    let resources = defaultValues.rules[0].resources[0];
    defaultValues.rules[0].resources[0] = { label: resources, value : resources };    
  }
  */
  
  console.log('defaultValues: ', defaultValues);
  return WithCommonForm(CreateRoleComponent, params, defaultValues);
};
const RuleItem = props => {
  const { item, name, index, onDeleteClick, methods, ListActions } = props;

  const [resourceList, setResourceList] = React.useState<{ [key: string]: string }>({ '*': 'All' });
  const { control } = methods;
  const apiGroups = useWatch<{ label: string; value: string }>({
    control: control,
    name: `${name}[${index}].apiGroups[0]`,
  });

  React.useEffect(() => {
    const apiGroupValue = apiGroups?.value || '*';
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
  }, [apiGroups]);

  const { t } = useTranslation();

  return (
    <>
      {index === 0 ? null : <div className="co-form-section__separator" />}
      <div className="row" key={item.id}>
        <div className="col-xs-4 pairs-list__value-field">
          <Section label={t('SINGLE:MSG_ROLES_CREATEFORM_DIV2_10')} id={`apigroup[${index}]`} isRequired={true}>
            <Controller
              as={<DropdownWithRef name={`${name}[${index}].apiGroup`} defaultValue={{ label: item.apiGroup.label, value: item.apiGroup.value }} methods={methods} useResourceItemsFormatter={false} items={apiGroupList} />}
              control={methods.control}
              name={`${name}[${index}].apiGroups`}
              onChange={([selected]) => {
                return { value: selected };
              }}
              defaultValue={{ label: item.apiGroup.label, value: item.apiGroup.value }}
            />
            {/* <Dropdown name={`${name}[${index}].apiGroup`} items={apiGroupList} defaultValue={item.apiGroup} methods={methods} {...ListActions.registerWithInitValue(`${name}[${index}].apiGroup`, item.apiGroup)} /> */}
          </Section>
          <Section label={t('SINGLE:MSG_ROLES_CREATEFORM_DIV2_11')} id={`resource[${index}]`} isRequired={true}>
            <Controller
              as={<DropdownWithRef name={`${name}[${index}].resources`} defaultValue={{ label: item.resource.label, value: item.resource.value }} methods={methods} useResourceItemsFormatter={false} items={resourceList} />}
              control={methods.control}
              name={`${name}[${index}].resource`}
              onChange={([selected]) => {
                return { value: selected };
              }}
              defaultValue={{ label: item.resource.label, value: item.resource.value }}
            />
            {/* <Dropdown name={`${name}[${index}].resource`} items={resourceList} defaultValue={item.resource} methods={methods} {...ListActions.registerWithInitValue(`${name}[${index}].resource`, item.resource)} /> */}
          </Section>
          <Section label={t('SINGLE:MSG_ROLES_CREATEFORM_DIV2_12')} id={`verb[${index}]`} isRequired={true}>
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

  

  const { t } = useTranslation();

  /*
  if (rules[0].apiGroups[0] === '*') {
    rules[0].apiGroups[0] = {'All': '*'};
  }
  */
  //metadata: { namespace: params.ns }
  return (
    <>
      <Section label={t('SINGLE:MSG_ROLES_CREATEFORM_DIV2_1')} id="roletype" isRequired>
        <RadioGroup name="kind" items={kindItems.bind(null, t)()} inline={false} initValue={kindToggle} />
      </Section>

      <div className="co-form-section__separator" />

      <Section label={t('SINGLE:MSG_ROLES_CREATEFORM_DIV2_6')} id="name" isRequired={true}>
        <TextInput inputClassName="pf-c-form-control" id="metadata.name" name="metadata.name" defaultValue="role-example" />
      </Section>

      {kindToggle === 'Role' && (
        <Section label={t('SINGLE:MSG_ROLES_CREATEFORM_DIV2_7')} id="namespace" isRequired={true}>
          <ResourceListDropdown name="metadata.namespace" useHookForm resourceList={namespaces} kind="Namespace" resourceType="Namespace" type="single" placeholder={t('SINGLE:MSG_ROLES_CREATEFORM_DIV2_8')} />
        </Section>
      )}

      {loaded ? (
        <Section id="rules" isRequired={true}>
          <ListView methods={methods} name={`rules`} addButtonText='규칙 추가' headerFragment={<></>} itemRenderer={ruleItemRenderer} defaultItem={{ apiGroup: { label: 'All', value: '*' }, resource: { label: 'All', value: '*' }, verbs: ['*'] }} defaultValues={[{ apiGroup: { label: 'All', value: '*' }, resource: { label: 'All', value: '*' }, verbs: ['*'] }]} />
        </Section>
      ) : (
        <LoadingInline />
      )}
    </>
  );
};

export const CreateRole: React.FC<CreateRoleProps> = ({ match: { params }, kind, obj}) => {
  const { t } = useTranslation();
  const formComponent = roleFormFactory(params, obj);
  const RoleFormComponent = formComponent;
  return <RoleFormComponent fixed={{}} explanation={t('SINGLE:MSG_ROLES_CREATEFORM_DIV1_1')} titleVerb='Create' onSubmitCallback={onSubmitCallback} isCreate={true} useDefaultForm={false} />;
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
  obj: any;
};

type RoleFormProps = {
  onChange: Function;
  stringData: {
    [key: string]: string;
  };
  isCreate: boolean;
};
