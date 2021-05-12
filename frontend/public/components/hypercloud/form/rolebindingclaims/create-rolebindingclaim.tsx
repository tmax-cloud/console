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
import { getActiveNamespace } from '../../../../reducers/ui';
import store from '../../../../redux';
//import { useTranslation } from 'react-i18next';
import { k8sList } from '../../../../module/k8s';
import { NamespaceModel, ClusterRoleModel, RoleModel } from '../../../../models';
import { RadioGroup } from '../../utils/radio';


const defaultValues = {
    metadata: {
        name: 'example-name',
    },
};

const kindItems = [    
    {
        title: '사용자',
        value: 'User',
    },
    {
        title: '그룹',
        value: 'Group',
    },
    {
        title: '서비스 어카운트',
        value: 'Service Account',
    },
];



const roleBindingClaimFormFactory = (params) => {
    return WithCommonForm(CreateRoleBindingClaimComponent, params, defaultValues);

};

const CreateRoleBindingClaimComponent: React.FC<RoleBindingClaimProps> = (props) => {
    
    const [namespaces, setNamespaces] = React.useState([]);   
    React.useEffect(() => {
        k8sList(NamespaceModel)
            .then((list) => setNamespaces(list));        
    }, [])

    const [roles, setRoles] = React.useState([]);
    const namespace = getActiveNamespace(store.getState());
    React.useEffect(() => {
        let roleAndClusterRoleList = [];
        k8sList(RoleModel, { ns: namespace }).then(list => {
            roleAndClusterRoleList = roleAndClusterRoleList.concat(list);
        });
        k8sList(ClusterRoleModel).then(list => {
            roleAndClusterRoleList = roleAndClusterRoleList.concat(list);
            setRoles(roleAndClusterRoleList);
        })
    }, [])


    const { control } = useFormContext();

    const subjectToggle = useWatch({
        control: control,
        name: 'subjects.kind',
        defaultValue: 'User',
    });

    return (
        <>
            <div className='co-form-section__separator' />

            <Section label='Role' id='role' isRequired={true}>
                <ResourceListDropdown
                    name='roleRef.name'
                    useHookForm
                    resourceList={roles}
                    resourceType='Role'
                    type='single'
                />
            </Section>

            <div className='co-form-section__separator' />


            <Section label='대상' id='kind' isRequired>
                <RadioGroup
                    name='subjects.kind'
                    items={kindItems}
                    inline={false}
                    initValue={subjectToggle}
                />
            </Section>

    
            {subjectToggle === "Service Account" &&
                <Section label='Namespace' id='namespace' isRequired={true}>
                    <ResourceListDropdown
                        name='subjects.namespace'
                        useHookForm
                        resourceList={namespaces}
                        kind='Namespace'
                        resourceType='Namespace'
                        type='single'
                    />
                </Section>
            }

            <Section label='대상 이름' id='name' isRequired={true}>
                <TextInput className='pf-c-form-control' id='subjects.name' name='subjects.name' />
            </Section>

        </>
    )
}

export const CreateRoleBindingClaim: React.FC<CreateRoleBindingClaimProps> = (props) => {
    const formComponent = roleBindingClaimFormFactory(props.match.params);
    const RoleBindingClaimFormComponent = formComponent;
    return <RoleBindingClaimFormComponent fixed={{metadata: { namespace: props.match.params.ns }}} explanation={''} titleVerb="Create" onSubmitCallback={onSubmitCallback} isCreate={true} />;

}

export const onSubmitCallback = (data) => {
    let apiVersion = `${RoleBindingClaimModel.apiGroup}/${RoleBindingClaimModel.apiVersion}`
    let labels = SelectorInput.objectify(data.metadata.labels);
    delete data.metadata.labels;
    delete data.apiVersion;
    let kind = 'RoleBindingClaim';
    let subjects = data.subjects;
    delete data.subjects;
    //let subjectList = [subjects];
    let roleRefApiGroup = '*';
    let roleKind = 'ClusterRole';
    let name = data.metadata.name;
    data = _.defaultsDeep(data, 
        { 
            apiVersion: apiVersion, 
            kind: kind, 
            metadata: { labels: labels }, 
            subjects: [subjects], 
            roleRef : {apiGroup: roleRefApiGroup, kind: roleKind},
            resourceName : name 
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
};


type RoleBindingClaimProps = {
    onChange: Function;
    stringData: {
        [key: string]: string;
    };
    isCreate: boolean;
};

