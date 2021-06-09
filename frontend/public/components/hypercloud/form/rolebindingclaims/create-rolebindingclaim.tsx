import * as _ from 'lodash-es';
import * as React from 'react';
import { match as RMatch } from 'react-router';
import { useFormContext, useWatch } from 'react-hook-form';
import { WithCommonForm, isCreatePage } from '../create-form';
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

const kindItems = t => [
    {
        title: t('SINGLE:MSG_ROLEBINDINGS_CREATEROLEBINDINGCLAIMFORM_DIV2_19'),
        value: 'User',
    },
    {
        title: t('SINGLE:MSG_ROLEBINDINGS_CREATEROLEBINDINGCLAIMFORM_DIV2_20'),
        value: 'Group',
    },
    {
        title: t('SINGLE:MSG_ROLEBINDINGS_CREATEROLEBINDINGCLAIMFORM_DIV2_21'),
        value: 'ServiceAccount',
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
        },
    } = methods;

    const subjectToggle = useWatch({
        control: control,
        name: 'subject.kind',
        defaultValue: 'User',
    });

    const { t } = useTranslation();

    return (
        <>
            <div className='co-form-section__separator' />

            <div>
                <div className="co-form-section__label">{t('SINGLE:MSG_ROLEBINDINGS_CREATEROLEBINDINGCLAIMFORM_DIV2_13')}</div>
            </div>
            <Section label={t('SINGLE:MSG_ROLEBINDINGS_CREATEROLEBINDINGCLAIMFORM_DIV2_14')} id='roleName' isRequired={true}>
                { !isCreatePage(defaultValues) ? 
                    defaultValues.metadata.name : 
                    <TextInput className='pf-c-form-control' id='metadata.name' name='metadata.name' defaultValue={defaultValues.metadata.name} />
                }                
            </Section>

            <div className='co-form-section__separator' />

            <div>
                <div className="co-form-section__label">{t('SINGLE:MSG_ROLEBINDINGS_CREATEROLEBINDINGCLAIMFORM_DIV2_15')}</div>
            </div>


            <Section label={t('SINGLE:MSG_ROLEBINDINGS_CREATEROLEBINDINGCLAIMFORM_DIV2_16')} id='roleName' isRequired={true}>

                <ResourceDropdown
                    name='roleRef.kindAndname'
                    resources={[
                        {
                            kind: 'Role',
                            namespace: namespace,
                            prop: 'role',
                        },
                        {
                            kind: 'ClusterRole',
                            prop: 'clusterrole',
                        },
                    ]}
                    placeholder={t('SINGLE:MSG_ROLEBINDINGS_CREATEROLEBINDINGCLAIMFORM_DIV2_17')}
                    useHookForm
                    type='single'
                    idFunc={resource => `${resource.kind}~~${resource.metadata.name}`}
                    defaultValue={`${defaultValues.roleRef.kind}~~${defaultValues.roleRef.name}`}
                />
            </Section>

            <div className='co-form-section__separator' />


            <Section label={t('SINGLE:MSG_ROLEBINDINGS_CREATEROLEBINDINGCLAIMFORM_DIV2_18')} id='kind' isRequired>
                <RadioGroup
                    name='subject.kind'
                    items={kindItems.bind(null, t)()}
                    inline={false}
                    initValue={defaultValues.subjects[0].kind}
                />
            </Section>


            {subjectToggle === "ServiceAccount" &&
                <Section label={t('SINGLE:MSG_ROLEBINDINGS_CREATEROLEBINDINGCLAIMFORM_DIV2_23')} id='namespace' isRequired={true}>
                    <ResourceListDropdown
                        name='subject.namespace'
                        useHookForm
                        resourceList={namespaces}
                        kind='Namespace'
                        resourceType='Namespace'
                        type='single'
                        placeholder={t('SINGLE:MSG_ROLEBINDINGS_CREATEROLEBINDINGCLAIMFORM_DIV2_24')}
                        defaultValue={defaultValues.subjects[0].namespace}
                    />
                </Section>
            }

            <Section label={t('SINGLE:MSG_ROLEBINDINGS_CREATEROLEBINDINGCLAIMFORM_DIV2_22')} id='name' isRequired={true}>
                <TextInput className='pf-c-form-control' id='subject.name' name='subject.name' defaultValue={defaultValues.subjects[0].name} />
            </Section>

        </>
    )
}

export const CreateRoleBindingClaim: React.FC<CreateRoleBindingClaimProps> = (props) => {
    const { t } = useTranslation();
    console.log('props: ', props);
    console.log('obj: ', props.obj);
    const formComponent = roleBindingClaimFormFactory(props.match.params, props.obj);
    const RoleBindingClaimFormComponent = formComponent;
    return <RoleBindingClaimFormComponent fixed={{ metadata: { namespace: props.match.params.ns } }} explanation={t('SINGLE:MSG_ROLEBINDINGS_CREATEROLEBINDINGCLAIMFORM_DIV1_1')} titleVerb="Create" onSubmitCallback={onSubmitCallback} isCreate={true} useDefaultForm={false} />;

}

export const onSubmitCallback = (data) => {
    let apiVersion = `${RoleBindingClaimModel.apiGroup}/${RoleBindingClaimModel.apiVersion}`
    let labels = SelectorInput.objectify(data.metadata.labels);
    delete data.metadata.labels;
    delete data.apiVersion;

    let kind = 'RoleBindingClaim';

    let subjects = data.subject;
    delete data.subject;

    let roleRefApiGroup = 'rbac.authorization.k8s.io';

    let roleRefkindAndname = data.roleRef?.kindAndname;
    const roleRefKind = roleRefkindAndname.split('~~')[0];
    const roleRefName = roleRefkindAndname.split('~~')[1];

    delete data.roleRef.kindAndname;

    let name = data.metadata.name;

    data = _.defaultsDeep(
        {
            apiVersion: apiVersion,
            kind: kind,
            metadata: { name: name, labels: labels },
            subjects: [subjects],
            roleRef: { name: roleRefName, apiGroup: roleRefApiGroup, kind: roleRefKind },
            resourceName: name
        }, data);
    
    //if ( !name || roleRefkindAndname === '~~' || !data.subject.name ) {
    if ( !name || !subjects.name || (subjects.kind==='ServiceAccount' && !subjects.namespace) || !roleRefName ) {    
        data = _.defaultsDeep({ error: 'Please complete all fields.' }, data);
        return data;
    }

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