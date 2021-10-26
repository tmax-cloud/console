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
import { DropdownCheckAddComponent } from '../../utils/dropdown-check-add';
import { DropdownSetComponent } from '../../utils/dropdown-set';
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
const ruleTypeItems = t => [
  // RadioGroup 컴포넌트에 넣어줄 items
  {
    title: t('SINGLE:MSG_ROLES_CREATEFORM_DIV2_33'),
    value: 'Resource',
  },
  {
    title: t('SINGLE:MSG_ROLES_CREATEFORM_DIV2_34'),
    value: 'URL',
  },
];

let apiGroupList = [];
let apiGroupListWithResourceSet = [];

const coreResources = [
  //'*': 'All',
  { label: 'configmaps', value: 'configmaps' },
  { label: 'endpoints', value: 'endpoints' },
  { label: 'events', value: 'events' },
  { label: 'limitranges', value: 'limitranges' },
  { label: 'namespaces', value: 'namespaces' },
  { label: 'nodes', value: 'nodes' },
  { label: 'persistentvolumeclaims', value: 'persistentvolumeclaims' },
  { label: 'persistentvolumes', value: 'persistentvolumes' },
  { label: 'pods', value: 'pods' },
  { label: 'replicationcontrollers', value: 'replicationcontrollers' },
  { label: 'resourcequotas', value: 'resourcequotas' },
  { label: 'secrets', value: 'secrets' },
  { label: 'serviceaccounts', value: 'serviceaccounts' },
  { label: 'services', value: 'services' },
];

const defaultVerbs = [
  { name: 'create', label: 'Create' },
  { name: 'delete', label: 'Delete' },
  { name: 'get', label: 'Get' },
  { name: 'list', label: 'List' },
  { name: 'patch', label: 'Patch' },
  { name: 'update', label: 'Update' },
  { name: 'watch', label: 'Watch' },
];
const urlVerbs = [
  { name: 'get', label: 'get' },
  { name: 'head', label: 'head' },
  { name: 'post', label: 'post' },
  { name: 'put', label: 'put' },
  { name: 'delete', label: 'delete' },
  { name: 'connect', label: 'connect' },
  { name: 'options', label: 'options' },
  { name: 'trace', label: 'trace' },
  { name: 'patch', label: 'patch' },
];

const defaultValuesTemplate = {
  // requestDo에 넣어줄 형식으로 defaultValues 작성
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
  const defaultValues = obj || defaultValuesTemplate;

  if (!defaultValues.rules) {
    defaultValues.rules = [{ apiGroups: ["*"], resources: ["*"], verbs: ["*"] }];
  }
  if (defaultValues.rules) {
    defaultValues.rules.forEach((rule, ruleIndex) => {
      if (rule.apiGroups) {
        rule.apiGroups.forEach((apiGroup, apiGroupIndex) => {
          let apiGroupKeyValue;
          if (typeof (apiGroup) === 'string') {
            if (apiGroup === '') { //"" indicates the core API group    
              apiGroup = 'Core';
            }
            if (apiGroup === '*') {
              apiGroupKeyValue = { label: 'All', value: '*', checked: false, added: true };
            }
            else if (apiGroup === 'Core') {
              apiGroupKeyValue = { label: 'Core', value: 'Core', checked: true, added: true };
            }
            else {
              apiGroupKeyValue = { label: apiGroup, value: apiGroup, checked: true, added: true };
            }
            defaultValues.rules[ruleIndex].apiGroups[apiGroupIndex] = apiGroupKeyValue;

          }
        });
        rule.resources.forEach((resource, resourceIndex) => {
          let resourceKeyValue;
          if (typeof (resource) === 'string') {
            if (resource === '*') {
              resourceKeyValue = { label: 'All', value: '*' };
            }
            else {
              resourceKeyValue = { label: resource, value: resource };
            }
            defaultValues.rules[ruleIndex].resources[resourceIndex] = resourceKeyValue;
          }
        });
        rule.resourceNames?.forEach((resourceName, resourceNameIndex) => {
          if (typeof (resourceName) === 'string') {
            defaultValues.rules[ruleIndex].resourceNames[resourceNameIndex] = { value: resourceName };
          }
        });
      }
      rule.nonResourceURLs?.forEach((nonResourceURL, nonResourceURLIndex) => {
        if (typeof (nonResourceURL) === 'string') {
          defaultValues.rules[ruleIndex].nonResourceURLs[nonResourceURLIndex] = { value: nonResourceURL };
        }
      });
    });
  }

  return WithCommonForm(CreateRoleComponent, params, defaultValues);
};
const RuleItem = props => {
  const { item, name, index, onDeleteClick, methods, ListActions } = props;
  //const [resourceList, setResourceList] = React.useState([]);
  const [resourceListWithApiGroupConvert, setResourceListWithApiGroupConvert] = React.useState([]);
  const { control } = methods;

  const apiGroups = useWatch<{ label: string, value: string, checked: boolean, added: boolean }[]>({
    control: control,
    name: `${name}[${index}].apiGroups`,
  });

  const kind = useWatch<string>({
    control: control,
    name: 'kind',
  });

  const resourceNames = useWatch<{ value: string }[]>({
    control: control,
    name: `${name}[${index}].resourceNames`,
  });
  const nonResourceURLs = useWatch<{ value: string }[]>({
    control: control,
    name: `${name}[${index}].nonResourceURLs`,
  });

  React.useEffect(() => {
    let convertList = [];
    let resourceListWithApiGroupTemp = [];    
    let resourceListWithApiGroupCore = [];

    apiGroups?.forEach(apiGroup => {
      if (apiGroup?.checked === true) {
        const apiGroupValue = apiGroup?.value || '*';
        if (apiGroupValue === "*") {
          resourceListWithApiGroupTemp = apiGroupListWithResourceSet;
        } else {
          if (apiGroupValue === "Core") {
            resourceListWithApiGroupCore = [
              { apiGroup: "Core", resourceList: coreResources },
            ];
            resourceListWithApiGroupTemp = resourceListWithApiGroupTemp.concat(resourceListWithApiGroupCore);
          } else {
            apiGroupListWithResourceSet.forEach((r) => {
              if (r.apiGroup === apiGroup.value) {
                resourceListWithApiGroupTemp.push(r);
              }
            });
          }
        }
      }
    });
    
    resourceListWithApiGroupTemp?.forEach((apiGroup) => {
      let apiGroupAndresourceList = [];
      let isFirstItem = true;
      apiGroup.resourceList.forEach((resource) => {
        apiGroupAndresourceList.push({ key: `${resource.value}-${resource.value}`, label: resource.value, value: resource.value, category: apiGroup.apiGroup, isFirstItem: isFirstItem })
        isFirstItem = false;
      });
      convertList = convertList.concat(apiGroupAndresourceList);
    });
    setResourceListWithApiGroupConvert(convertList);
  }, [apiGroups]);

  const { t } = useTranslation();

  const ruleTypeToggle = useWatch({
    control: methods.control,
    name: `rules[${index}].ruleType`,
    defaultValue: nonResourceURLs ? 'URL' : 'Resource',
  });

  const kindToggle = useWatch({
    control: methods.control,
    name: 'kind',
    defaultValue: kind || 'Role',
  });

  return (
    <>
      {index === 0 ? null : <div className="co-form-section__separator" />}
      <div className="row" key={item.id}>
        <Section id={`rules[${index}]`} >
          <div className="col-xs-12 pairs-list__value-field">
            {kindToggle === 'ClusterRole' &&
              <Section label={t('SINGLE:MSG_ROLES_CREATEFORM_DIV2_32')} id={`rules[${index}].ruleType`} >
                <RadioGroup name={`rules[${index}].ruleType`} items={ruleTypeItems.bind(null, t)()} inline={false} initValue={ruleTypeToggle} />
              </Section>
            }
            {ruleTypeToggle === 'Resource' ? (<>
              <Section label={t('SINGLE:MSG_ROLES_CREATEFORM_DIV2_10')} id={`apiGroups[${index}]`} isRequired={true}>
                <Controller
                  as={<DropdownCheckAddComponent name={`${name}[${index}].apiGroups`} defaultValues={item.apiGroups} methods={methods} useResourceItemsFormatter={false} items={apiGroupList} placeholder={t('SINGLE:MSG_ROLES_CREATEFORM_DIV2_27')} clearAllText={t('SINGLE:MSG_ROLES_CREATEFORM_DIV2_29')} chipsGroupTitle={t('COMMON:MSG_DETAILS_TABDETAILS_RULES_TABLEHEADER_2')} shrinkOnSelectAll={false} showSelectAllOnEmpty={false}  menuWidth='300px' buttonWidth='300px' />}
                  control={methods.control}
                  name={`${name}[${index}].apiGroups`}
                  onChange={([selected]) => {
                    return { value: selected };
                  }}
                  defaultValue={item.apiGroups}
                />
              </Section>
              <Section label={t('SINGLE:MSG_ROLES_CREATEFORM_DIV2_11')} id={`resources[${index}]`} isRequired={true}>
                <Controller
                  as={<DropdownSetComponent name={`${name}[${index}].resources`} defaultValues={item.resources} methods={methods} useResourceItemsFormatter={false} items={resourceListWithApiGroupConvert} placeholder={t('SINGLE:MSG_ROLES_CREATEFORM_DIV2_28')} clearAllText={t('SINGLE:MSG_ROLES_CREATEFORM_DIV2_25')} chipsGroupTitle={t('SINGLE:MSG_ROLES_CREATEFORM_DIV2_26')} shrinkOnSelectAll={false} showSelectAllOnEmpty={false} menuWidth='300px' buttonWidth='300px' />}
                  control={methods.control}
                  name={`${name}[${index}].resources`}
                  onChange={([selected]) => {
                    return { value: selected };
                  }}
                  defaultValue={item.resources}
                />
              </Section>
              <Section label={t('SINGLE:MSG_ROLES_CREATEFORM_DIV2_30')} id={`rules[${index}].resourceNames`} >
                <ListView name={`rules.${index}.resourceNames`} methods={methods} addButtonText={t('SINGLE:MSG_ROLES_CREATEFORM_DIV2_31')} headerFragment={<></>} itemRenderer={ResourceNameItemRenderer} defaultItem={{ value: '' }} defaultValues={resourceNames} />
              </Section>
              <Section label={t('SINGLE:MSG_ROLES_CREATEFORM_DIV2_12')} id={`rules[${index}].verbs`} isRequired={false}>
                <CheckboxGroup name={`${name}[${index}].verbs`} items={defaultVerbs} useAll defaultValue={item.verbs} methods={methods} {...ListActions.registerWithInitValue(`${name}[${index}].verbs`, item.verbs)} />
              </Section>
            </>) : (<>
              <Section label={t('SINGLE:MSG_ROLES_CREATEFORM_DIV2_34')} id={`rules[${index}].nonResourceURLs`} isRequired={true}>
                <ListView name={`rules.${index}.nonResourceURLs`} methods={methods} addButtonText={t('COMMON:MSG_COMMON_BUTTON_COMMIT_8')} headerFragment={<></>} itemRenderer={URLItemRenderer} defaultItem={{ value: '' }} defaultValues={nonResourceURLs} />
              </Section>
              <Section label={t('SINGLE:MSG_ROLES_CREATEFORM_DIV2_12')} id={`rules[${index}].verbs`} isRequired={false}>
                <CheckboxGroup name={`${name}[${index}].verbs`} items={urlVerbs} useAll defaultValue={item.verbs} methods={methods} {...ListActions.registerWithInitValue(`${name}[${index}].verbs`, item.verbs)} />
              </Section>
            </>)}
          </div>
          <div className="col-xs-1 pairs-list__action">
            <Button type="button" data-test-id="pairs-list__delete-btn" className="pairs-list__span-btns" onClick={onDeleteClick} variant="plain">
              <MinusCircleIcon className="pairs-list__side-btn pairs-list__delete-icon co-icon-space-r" />
              <span>{t('SINGLE:MSG_ROLES_CREATEFORM_DIV2_23')}</span>
            </Button>
          </div>
        </Section>
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

  return <RuleItem item={item} name={name} index={index as number} onDeleteClick={onDeleteClick} methods={methods} ListActions={ListActions} key={index}/>;
};

const ResourceNameItemRenderer = (method, name, item, index, ListActions, ListDefaultIcons) => (
  <div className="row" key={item.id}>
    <div className="col-xs-11 pairs-list__value-field">
      <TextInput id={`${name}[${index}].value`} inputClassName="col-md-12" methods={method} defaultValue={item.value} />
    </div>
    <div className="col-xs-1 pairs-list__action">
      <Button
        type="button"
        data-test-id="pairs-list__delete-btn"
        className="pairs-list__span-btns"
        onClick={() => {
          ListActions.remove(index);
        }}
        variant="plain"
      >
        {ListDefaultIcons.deleteIcon}
      </Button>
    </div>
  </div>
);

const URLItemRenderer = (method, name, item, index, ListActions, ListDefaultIcons) => (
  <div className="row" key={item.id}>
    <div className="col-xs-11 pairs-list__value-field">
      <TextInput id={`${name}[${index}].value`} inputClassName="col-md-12" methods={method} defaultValue={item.value} />
    </div>
    <div className="col-xs-1 pairs-list__action">
      <Button
        type="button"
        data-test-id="pairs-list__delete-btn"
        className="pairs-list__span-btns"
        onClick={() => {
          ListActions.remove(index);
        }}
        variant="plain"
      >
        {ListDefaultIcons.deleteIcon}
      </Button>
    </div>
  </div>
);

const CreateRoleComponent: React.FC<RoleFormProps> = props => {
  const [namespaces, setNamespaces] = React.useState([]);
  const [loaded, setLoaded] = React.useState(false);
  React.useEffect(() => {
    k8sList(NamespaceModel).then(list => setNamespaces(list));
    coFetchJSON('api/kubernetes/apis').then(result => {
      let apiGroupListTemp = [{ label: 'Core', value: 'Core' }];
      //let list = [{ label: 'All', value: '*' }, { label: 'Core', value: 'Core' }];
      //let list = [{ value: '*' }, { value: 'Core' }];
      result.groups.sort(compareObjByName);
      result.groups.forEach(apigroup => {
        let apiGroup = { label: apigroup.name, value: apigroup.name };
        apiGroupListTemp.push(apiGroup);
      });
      apiGroupList = apiGroupListTemp;

      let apiGroupListWithResourceSetTemp = [{ apiGroup: 'Core', resourceList: coreResources }];
      apiGroupList.forEach((apiGroup) => {
        if (apiGroup.value !== 'Core') {
          coFetchJSON(`${document.location.origin}/api/kubernetes/apis/${apiGroup.value}`).then(
            data => {
              //`${document.location.origin}/api/kubernetes/apis/${apiGroupList[apiGroupValue]}/${version.version}
              coFetchJSON(`${document.location.origin}/api/kubernetes/apis/${apiGroup.value}/${data.preferredVersion.version}`).then(
                data => {
                  let resourceListInApiGroupTemp = [];
                  //let apiGroupListWithResourceListTemp = [];
                  data.resources.sort(compareObjByName);
                  data.resources.forEach(
                    resource => {
                      resourceListInApiGroupTemp.push({ label: resource.name, value: resource.name });
                    });
                  apiGroupListWithResourceSetTemp.push({ apiGroup: apiGroup.value, resourceList: resourceListInApiGroupTemp });

                  apiGroupListWithResourceSet = apiGroupListWithResourceSetTemp;
                },
                err => {
                  console.log('Fail to get resource list');
                },
              );
            },
            err => {
              console.log('Fail to get resource list');
            }
          );
        }
      });
      setLoaded(true);
    });
  }, []);

  const methods = useFormContext();

  const kindToggle = useWatch({
    control: methods.control,
    name: 'kind',
    defaultValue: 'Role',
  });


  const {
    control: {
      defaultValuesRef: { current: defaultValues }
    },
  } = methods;

  const { t } = useTranslation();

  /*
  if (rules[0].apiGroups[0] === '*') {
    rules[0].apiGroups[0] = {'All': '*'};
  }
  */
  //metadata: { namespace: params.ns }
  return (
    <>
      <Section label={t('SINGLE:MSG_ROLES_CREATEFORM_DIV2_1')} id="roletype" >
        <RadioGroup name="kind" items={kindItems.bind(null, t)()} inline={false} initValue={kindToggle} />
      </Section>

      <div className="co-form-section__separator" />

      <Section label={t('SINGLE:MSG_ROLES_CREATEFORM_DIV2_6')} id="name" isRequired={true}>
        <TextInput inputClassName="pf-c-form-control" id="metadata.name" name="metadata.name" defaultValue="role-example" />
      </Section>

      {kindToggle === 'Role' && (
        <Section label={t('SINGLE:MSG_ROLES_CREATEFORM_DIV2_7')} id="namespace" isRequired={true}>
          <ResourceListDropdown name="metadata.namespace" useHookForm resourceList={namespaces} kind="Namespace" resourceType="Namespace" type="single" placeholder={t('SINGLE:MSG_ROLES_CREATEFORM_DIV2_8')} defaultValue={defaultValues.metadata.namespace} autocompletePlaceholder={t('SINGLE:MSG_ROLES_CREATEFORM_DIV2_8')} />
        </Section>
      )}

      {loaded ? (
        <Section id="rules" isRequired={true}>
          <ListView methods={methods} name={`rules`} addButtonText={t('SINGLE:MSG_ROLES_CREATEFORM_DIV2_22')} headerFragment={<></>} itemRenderer={ruleItemRenderer} defaultItem={{ apiGroups: [{ label: 'All', value: '*', checked: false, added: true  }], resources: [{ label: 'All', value: '*' }], verbs: ['*'] }} defaultValues={defaultValues.rules} />
        </Section>
      ) : (
        <LoadingInline />
      )}
    </>
  );
};

export const CreateRole: React.FC<CreateRoleProps> = ({ match: { params }, kind, obj }) => {
  const { t } = useTranslation();
  const formComponent = roleFormFactory(params, obj);
  const RoleFormComponent = formComponent;
  return <RoleFormComponent fixed={{}} explanation={t('SINGLE:MSG_ROLES_CREATEFORM_DIV1_1')} titleVerb='Create' onSubmitCallback={onSubmitCallback} isCreate={true} useDefaultForm={false} />;
};

export const onSubmitCallback = data => {
  let apiVersion = data.kind === 'Role' ? `${RoleModel.apiGroup}/${RoleModel.apiVersion}` : `${ClusterRoleModel.apiGroup}/${ClusterRoleModel.apiVersion}`;

  let rules = data.rules.map(rule => {
    if (data.kind === 'ClusterRole' && rule.nonResourceURLs) {
      let nonResourceURLs = new Array;
      rule.nonResourceURLs?.forEach((r, index) => {
        nonResourceURLs[index] = r.value;
      });
      return {
        nonResourceURLs: nonResourceURLs,
        verbs: rule.verbs ?? [''],
      };
    }
    else {
      let apiGroups = new Array;
      rule.apiGroups = rule.apiGroups.filter( r => {if (r.added === true) return true });
      rule.apiGroups?.forEach((r, index) => {
          apiGroups[index] = r.value;
      });
      apiGroups = apiGroups.filter(function () { return true });
      let resources = new Array;
      rule.resources?.forEach((r, index) => {
        resources[index] = r.value;
      });
      let resourceNames = new Array;
      rule.resourceNames?.forEach((r, index) => {
        resourceNames[index] = r.value;
      });

      return {
        apiGroups: apiGroups === ['Core'] ? [''] : apiGroups ?? ['*'],
        resources: resources ?? ['*'],
        resourceNames: resourceNames ?? [],
        verbs: rule.verbs ?? [''],
      };
    }
  });

  delete data.apiVersion;
  delete data.rules;

  data = _.defaultsDeep({ apiVersion: apiVersion, rules: rules }, data);
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
