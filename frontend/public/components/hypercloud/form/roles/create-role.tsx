import * as _ from 'lodash-es';
import * as React from 'react';
import { match as RMatch } from 'react-router';
import { WithCommonForm } from '../create-form';
import { coFetchJSON } from '../../../../co-fetch';
import { NamespaceModel, ClusterRoleModel, RoleModel } from '../../../../models';
import { k8sList } from '../../../../module/k8s';
import { Section } from '../../utils/section';
import { LoadingInline } from '../../../utils';
import { TextInput } from '../../utils/text-input';
import { RadioGroup } from '../../utils/radio';
import { Dropdown } from '../../utils/dropdown';
import { ResourceListDropdown } from '../../utils/resource-list-dropdown';
import { useFormContext, useWatch } from 'react-hook-form';
import { Button } from '@patternfly/react-core';
import { ListView } from '../../utils/list-view';
import { CheckboxGroup } from '../../utils/checkbox';
import { MinusCircleIcon } from '@patternfly/react-icons';
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
  '*': 'All', pods: 'pods', configmaps: 'configmaps', secrets: 'secrets', replicationcontrollers: 'replicationcontrollers', services: 'services', persistentvolumeclaims: 'persistentvolumeclaims', persistentvolumes: 'persistentvolumes', namespaces: 'namespaces', limitranges: 'limitranges', resourcequotas: 'resourcequotas', nodes: 'nodes', serviceaccounts: 'serviceaccounts'
};
const defaultVerbs = [{ name: 'create', label: 'Create' }, { name: 'delete', label: 'Delete' }, { name: 'get', label: 'Get' }, { name: 'list', label: 'List' }, { name: 'patch', label: 'Patch' }, { name: 'update', label: 'Update' }, { name: 'watch', label: 'Watch' }]

const defaultValues = {
  // requestDo에 넣어줄 형식으로 defaultValues 작성
  apiGroup: '*'
};

const roleFormFactory = params => {
  return WithCommonForm(CreateRoleComponent, params, defaultValues);
};
const RuleItem = (props) => {
  const { item, name, index, onDeleteClick, methods } = props;

  const [resourceList, setResourceList] = React.useState<{ [key: string]: string }>({ '*': 'All' });
  const { control, register, getValues, setValue } = methods;
  const apiGroup = useWatch<string>({
    control: control,
    name: `${name}[${index}].apiGroup`,
  });

  React.useEffect(() => {
    if (apiGroup === '*') {
      setResourceList({ '*': 'All' });
    }
    else if (apiGroup === 'Core') {
      setResourceList(coreResources);
    } else {
      coFetchJSON(`${document.location.origin}/api/kubernetes/apis/${apiGroupList[apiGroup]}`).then(
        data => {
          let newResourceList = { '*': 'All' };
          data.resources.forEach(resource => newResourceList[resource.name] = resource.name);
          setResourceList(newResourceList);
        },
        err => {
          console.log("Fail to get resource list");
        },
      );
    }
  }, [apiGroup]);

  /* MEMO: 컴포넌트 내부적으로는 props/state 변화가 없기 때문에 register, setValue할 타이밍이 없어서 initValue 로직을 여기에 추가함.
   * useFieldArray item이 변화하면 form에서 다 삭제 후 다시 set하는데(컴포넌트는 다시 그리지 않는 것 같음), input 태그엔 ref를 달면 자체적으로 다시 set해주는 것으로 보임.
   * Dropdown, CheckboxGroup 에 ref를 달아서 initValue 로직을 대체해주면 좋을 것 같음. */
  const initValue = (name, defaultValue) => {
    const isRegistered = _.get(getValues(), name);

    if(!isRegistered){
      register(name);
      setValue(name, defaultValue);
    }
  }

  return (
    <>
      {index === 0 ? null : <div className='co-form-section__separator' />}
      <div className="row" key={item.id}>
        <div className="col-xs-4 pairs-list__value-field">
          <Section label='API Group' id={`apigroup[${index}]`} isRequired={true}>
            <Dropdown
              name={`${name}[${index}].apiGroup`}
              items={apiGroupList}
              defaultValue={item.apiGroup}
              methods={methods}
              {...initValue(`${name}[${index}].apiGroup`, item.apiGroup)}
            />
          </Section>
          <Section label='Resource' id={`resource[${index}]`} isRequired={true}>
            <Dropdown
              name={`${name}[${index}].resource`}
              items={resourceList}
              defaultValue={item.resource}
              methods={methods}
              {...initValue(`${name}[${index}].resource`, item.resource)}
            />
          </Section>
          <Section label='Verb' id={`verb[${index}]`} isRequired={true}>
            <CheckboxGroup name={`${name}[${index}].verbs`} items={defaultVerbs} useAll defaultValue={item.verbs} methods={methods} {...initValue(`${name}[${index}].verbs`, item.verbs)} />
          </Section>
        </div>
        <div className="col-xs-1 pairs-list__action">
          <Button
            type="button"
            data-test-id="pairs-list__delete-btn"
            className="pairs-list__span-btns"
            onClick={onDeleteClick}
            variant="plain"
          >
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
  }

  return <RuleItem item={item} name={name} index={index as number} onDeleteClick={onDeleteClick} methods={methods} />
};

const CreateRoleComponent: React.FC<RoleFormProps> = props => {
  const [namespaces, setNamespaces] = React.useState([]);
  const [loaded, setLoaded] = React.useState(false);
  React.useEffect(() => {
    k8sList(NamespaceModel)
      .then((list) => setNamespaces(list));
    coFetchJSON('api/kubernetes/apis')
      .then((result) => {
        let list = { '*': 'All', 'Core': 'Core' };
        result.groups.forEach(apigroup => { list[apigroup.name] = apigroup.preferredVersion.groupVersion });
        apiGroupList = list;
        setLoaded(true);
      });
  }, [])

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
      <Section label='롤 타입' id='roletype' isRequired>
        <RadioGroup
          name='kind'
          items={kindItems}
          inline={false}
          initValue={kindToggle}
        />
      </Section>

      <div className='co-form-section__separator' />

      <Section label='롤 이름' id='name' isRequired={true}>
        <TextInput inputClassName='pf-c-form-control' id='metadata.name' name='metadata.name' defaultValue='role-example' />
      </Section>

      {kindToggle === "Role" &&
        <Section label='Namespace' id='namespace' isRequired={true}>
          <ResourceListDropdown
            name='metadata.namespace'
            useHookForm
            resourceList={namespaces}
            kind='Namespace'
            resourceType='Namespace'
            type='single'
          />
        </Section>
      }

      {loaded ?
        <Section id='rules' isRequired={true}>
          <ListView methods={methods} name={`rules`} addButtonText="규칙 추가" headerFragment={<></>} itemRenderer={ruleItemRenderer} defaultItem={{ apiGroup: '*', resource: '*', verbs: ['*'] }} defaultValues={[{ apiGroup: '*', resource: '*', verbs: ['*'] }]} />
        </Section>
        : <LoadingInline />}
    </>
  );
};

export const CreateRole: React.FC<CreateRoleProps> = ({ match: { params }, kind }) => {
  const formComponent = roleFormFactory(params);
  const RoleFormComponent = formComponent;
  return <RoleFormComponent fixed={{}} explanation={''} titleVerb='Create' onSubmitCallback={onSubmitCallback} isCreate={true} useDefaultForm={false} />;
};

export const onSubmitCallback = data => {
  let apiVersion = data.kind === 'Role' ? `${RoleModel.apiGroup}/${RoleModel.apiVersion}` : `${ClusterRoleModel.apiGroup}/${ClusterRoleModel.apiVersion}`;

  let rules = data.rules.map((rule) => ({
    apiGroups: rule.apiGroup === 'Core' ? [''] : [rule.apiGroup ?? '*'],
    resources: [rule.resource ?? '*'],
    verbs: rule.verbs ?? ['*']
  }));

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
