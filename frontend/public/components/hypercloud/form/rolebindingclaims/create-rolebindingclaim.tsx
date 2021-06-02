import * as _ from 'lodash-es';
import * as React from 'react';
import { match as RMatch } from 'react-router';
import { useFormContext, useWatch } from 'react-hook-form';
import { WithCommonForm } from '../create-form';
import { RoleBindingClaimModel } from '../../../../models';
import { Section } from '../../utils/section';
import { SelectorInput } from '../../../utils';
import { TextInput } from '../../utils/text-input';
import { ResourceListDropdown } from '../../utils/resource-list-dropdown';
import { ResourceDropdown } from '../../utils/resource-dropdown';
import { getActiveNamespace } from '../../../../reducers/ui';
import store from '../../../../redux';
//import { useTranslation } from 'react-i18next';
import { k8sList } from '../../../../module/k8s';
import { NamespaceModel } from '../../../../models';
import { RadioGroup } from '../../utils/radio';
import { useTranslation } from 'react-i18next';
//import { TFunction } from 'i18next';

const defaultValuesTemplate = {
    metadata: {
        name: 'example-name',
    },
    roleRef: {
        kind: '',
        name: ''
    },
    subjects: [
        {
            kind: 'User',
            name: '',
            namespace: ''
        }
    ]
};

/*
const kindItems = (t?: TFunction) => {
    return [
        {
            title: t('COMMON:MSG_ROLEBINDINGS_CREATEROLEBINDINGFORM_DIV2_15'),
            value: 'User',
        },
        {
            title: t('COMMON:MSG_ROLEBINDINGS_CREATEROLEBINDINGFORM_DIV2_16'),
            value: 'Group',
        },
        {
            title: t('COMMON:MSG_ROLEBINDINGS_CREATEROLEBINDINGFORM_DIV2_17'),
            value: 'Service Account',
        },
    ];
}
kindItems.displayName = 'kindItems';
*/

const kindItems = t => [    
    {
        title: t('SINGLE:MSG_ROLEBINDINGS_CREATEROLEBINDINGCLAIMFORM_DIV2_7'),
        value: 'User',
    },
    {
        title: t('SINGLE:MSG_ROLEBINDINGS_CREATEROLEBINDINGCLAIMFORM_DIV2_8'),
        value: 'Group',
    },
    {
        title: t('SINGLE:MSG_ROLEBINDINGS_CREATEROLEBINDINGCLAIMFORM_DIV2_9'),
        value: 'Service Account',
    },
];




const roleBindingClaimFormFactory = (params, obj) => {
    const defaultValues = obj || defaultValuesTemplate;
    console.log('defaultValues: ', defaultValues);

    return WithCommonForm(CreateRoleBindingClaimComponent, params, defaultValues);
};

const CreateRoleBindingClaimComponent: React.FC<RoleBindingClaimProps> = (props) => {
    //const { t } = useTranslation();
    console.log('CreateRoleBindingClaimComponent: ', props);

    const [namespaces, setNamespaces] = React.useState([]);
    React.useEffect(() => {
        k8sList(NamespaceModel)
            .then((list) => setNamespaces(list));
    }, [])

    const namespace = getActiveNamespace(store.getState());

    const methods = useFormContext();
    const {
        control,
        control: {
            defaultValuesRef: { current: defaultValues }
        }
    } = methods;

    const subjectToggle = useWatch({
        control: control,
        name: 'subjects.kind',
        defaultValue: 'User',
    });

    const { t } = useTranslation();

    return (
        <>
            <div className='co-form-section__separator' />

            <Section label='롤 이름' id='role' isRequired={true}>
                <ResourceDropdown
                    name='roleRef.name'
                    resources={[
                        {
                            kind: 'Role',
                            namespace: namespace, // 옵션
                            prop: 'role',
                        },
                        {
                            kind: 'ClusterRole',
                            prop: 'clusterrole',
                        },
                    ]}
                    placeholder='롤 이름 선택'
                    useHookForm
                    type='single'
                    idFunc={resource => `${resource.kind}~~${resource.metadata.name}`}
                    defaultValue={ `${defaultValues.roleRef.kind}~~${defaultValues.roleRef.name}`}
                />
            </Section>

            <div className='co-form-section__separator' />


            <Section label='대상' id='kind' isRequired>
                <RadioGroup
                    name='subjects.kind'
                    items={kindItems.bind(null, t)()}
                    inline={false}                    
                    initValue={defaultValues.subjects[0].kind}
                />
            </Section>


            {subjectToggle === "Service Account" &&
                <Section label='대상 네임스페이스' id='namespace' isRequired={true}>
                    <ResourceListDropdown
                        name='subjects.namespace'
                        useHookForm
                        resourceList={namespaces}
                        kind='Namespace'
                        resourceType='Namespace'
                        type='single'
                        placeholder='네임스페이스 선택'
                        defaultValue={defaultValues.subjects[0].namespace}
                    />
                </Section>
            }

            <Section label='대상 이름' id='name' isRequired={true}>
                <TextInput className='pf-c-form-control' id='subjects.name' name='subjects.name' defaultValue={defaultValues.subjects[0].name}/>
            </Section>

        </>
    )
}

export const CreateRoleBindingClaim: React.FC<CreateRoleBindingClaimProps> = (props) => {
    console.log('props: ', props);
    console.log('obj: ', props.obj);
    const formComponent = roleBindingClaimFormFactory(props.match.params, props.obj);
    const RoleBindingClaimFormComponent = formComponent;
    return <RoleBindingClaimFormComponent fixed={{ metadata: { namespace: props.match.params.ns } }} explanation={''} titleVerb="Create" onSubmitCallback={onSubmitCallback} isCreate={true} />;

}

export const onSubmitCallback = (data) => {
    let apiVersion = `${RoleBindingClaimModel.apiGroup}/${RoleBindingClaimModel.apiVersion}`
    let labels = SelectorInput.objectify(data.metadata.labels);
    delete data.metadata.labels;
    delete data.apiVersion;

    let kind = 'RoleBindingClaim';

    let subjects = data.subjects;
    delete data.subjects;

    let roleRefApiGroup = 'rbac.authorization.k8s.io';

    const roleRef = data.roleRef?.name;
    const roleRefKind = roleRef.split('~~')[0];
    const roleRefName = roleRef.split('~~')[1];

    delete data.roleRef.name;

    let name = data.metadata.name;

    data = _.defaultsDeep(data,
        {
            apiVersion: apiVersion,
            kind: kind,
            metadata: { labels: labels },
            subjects: [subjects],
            roleRef: { name: roleRefName, apiGroup: roleRefApiGroup, kind: roleRefKind },
            resourceName: name
        });
    return data;

}

type CreateRoleBindingClaimProps = {
    match: RMatch<{
        type?: string;
        ns?: string;
    }>;
    fixed: object;
    explanation: string;
    titleVerb: string;
    saveButtonText?: string;
    isCreate: boolean;
    obj: any;
};


type RoleBindingClaimProps = {
    onChange: Function;
    stringData: {
        [key: string]: string;
    };
    isCreate: boolean;
};

