import * as _ from 'lodash-es';
import * as React from 'react';
import { Helmet } from 'react-helmet';
import { match as RMatch } from 'react-router';
import { Controller, FormProvider, useForm, useFormContext } from 'react-hook-form';
import { /*ActionGroup,*/ Button, Wizard } from '@patternfly/react-core';
import { AngleUpIcon, AngleDownIcon } from '@patternfly/react-icons';
import { ServiceInstanceModel, ServicePlanModel, ClusterServicePlanModel, ClusterServiceClassModel, ServiceClassModel } from '../../../../models';
import { k8sCreate, k8sGet, k8sList, K8sResourceKind, referenceFor /*k8sCreate, referenceFor, modelFor*/ } from '../../../../module/k8s';
import { Section } from '../../utils/section';
import { history, /*resourceObjPath, ButtonBar, */ LoadingInline, ResourceIcon, resourceObjPath, SelectorInput } from '../../../utils';
import { TextInput } from '../../utils/text-input';
import { RadioGroup } from '../../utils/radio';
import { ErrorMessage } from '../../../utils/button-bar';
import { DevTool } from '@hookform/devtools';
import { useTranslation } from 'react-i18next';

const Description = ({ spec }) => {
  const { t } = useTranslation();
  const [extraInfoOpened, setExtraInfoOpened] = React.useState(false);
  let showCostSection = !!spec.externalMetadata?.costs ? true : false;
  if (spec.free) {
    showCostSection = false;
  }
  const parameters = [];
  _.forEach(spec.instanceCreateParameterSchema.properties, (value, key) => {
    parameters.push(<li key={key}>{`${key}: ${value.default}`}</li>);
  });

  return (
    <div className="hc-create-service-instance__plan-desc">
      <span>{spec.description}</span>
      {spec.externalMetadata?.bullets?.length > 0 && (
        <Section label={t('SINGLE:MSG_SERVICEINSTANCES_CREATEFORM_STEP2_DIV2_2')} id="bullets">
          <div className="hc-create-service-instance__plan-bullets">
            {spec.externalMetadata.bullets.map(bullet => (
              <li>{bullet}</li>
            ))}
          </div>
        </Section>
      )}
      <Button variant="plain" className="pf-m-link--align-left hc-create-service-instance__plan-extra-info__more" type="button" onClick={() => setExtraInfoOpened(!extraInfoOpened)}>
        <span>{t('SINGLE:MSG_SERVICEINSTANCES_CREATEFORM_STEP1_DIV2_11')}</span>
        {extraInfoOpened ? <AngleUpIcon /> : <AngleDownIcon />}
      </Button>
      {extraInfoOpened ? (
        <div className="hc-create-service-instance__plan-extra-info">
          {!_.isEmpty(parameters) && (
            <Section label={t('SINGLE:MSG_SERVICEINSTANCES_CREATEFORM_STEP2_DIV2_3')} id="bullets">
              <div className="hc-create-service-instance__plan-parameters">{parameters}</div>
            </Section>
          )}
          {showCostSection && (
            <Section label={t('SINGLE:MSG_SERVICEINSTANCES_CREATEFORM_STEP2_DIV2_4')} id="bullets">
              <span className="hc-create-service-instance__plan-costs">{`${spec.externalMetadata.costs.amount}${spec.externalMetadata.costs.unit}`}</span>
            </Section>
          )}
        </div>
      ) : (
        false
      )}
    </div>
  );
};

const planItem = (plan, index) => {
  return {
    title: (
      <span>
        <ResourceIcon kind={plan.kind} />
        {plan.spec.externalName}
      </span>
    ),
    desc: <Description spec={plan.spec} />,
    value: index,
  };
};

const SelectServicePlanComponent = ({ loaded, servicePlanList, defaultPlan }) => {
  const canList = loaded && !_.isEmpty(servicePlanList);
  const planItemList = canList ? servicePlanList.map((plan, index) => planItem(plan, index)) : [];

  const { t } = useTranslation();

  return (
    <>
      <Section label={t('SINGLE:MSG_SERVICEINSTANCES_CREATEFORM_STEP1_DIV2_10')} id="serviceplan" isRequired>
        {loaded ? canList ? <RadioGroup id="service-plan" name="service-plan" items={planItemList} inline={false} initValue={planItemList?.[defaultPlan]?.value || planItemList?.[0]?.value} /> : <div>{t('SINGLE:MSG_SERVICEINSTANCES_CREATEFORM_STEP2_DIV2_1')}</div> : <LoadingInline />}
      </Section>
    </>
  );
};

const CreateServiceInstanceComponent = ({ selectedPlan, defaultValue, errorMsg }) => {
  const { control } = useFormContext();
  //const { t } = useTranslation();
  const parameters = [];
  _.forEach(selectedPlan.spec.instanceCreateParameterSchema.properties, (value, key) => {
    parameters.push(
      <ul>
        <Section label={key} id={key} description={value.description} isRequired={selectedPlan.spec.instanceCreateParameterSchema.required?.find(k => k === key)}>
          <TextInput id={`spec.parameters.${key}`} defaultValue={defaultValue?.spec?.parameters?.[key] ?? value.default} isDisabled={value?.fixed} />
        </Section>
      </ul>,
    );
  });

  const { t } = useTranslation();

  return (
    <>
      <Section label={t('SINGLE:MSG_TEMPLATEINSTANCES_CREATEFORM_DIV2_1')} id="name" isRequired={true}>
        <TextInput className="pf-c-form-control" id="metadata.name" name="metadata.name" defaultValue={defaultValue?.metadata?.name ?? 'example-name'} />
      </Section>

      <div className="co-form-section__separator" />

      {!_.isEmpty(parameters) && (
        <Section label={t('SINGLE:MSG_SERVICEINSTANCES_CREATEFORM_STEP2_DIV2_3')} id="param">
          <div>{parameters}</div>
        </Section>
      )}

      <Section label={t('SINGLE:MSG_SERVICEINSTANCES_CREATEFORM_STEP3_DIV2_3')} id="label" description={t('SINGLE:MSG_SERVICEINSTANCES_CREATEFORM_STEP3_DIV2_5')}>
        <Controller name="metadata.labels" id="label" labelClassName="co-text-sample" as={SelectorInput} control={control} tags={_.isEmpty(defaultValue?.metadata?.labels) ? [] : defaultValue?.metadata?.labels} defaultValue={defaultValue?.metadata?.labels} />
      </Section>
      {!!errorMsg && <ErrorMessage message={errorMsg} />}
    </>
  );
};

export const CreateServiceInstance: React.FC<CreateServiceInstanceProps> = ({ match: { params }, location: { search }, kind }) => {
  const { t } = useTranslation();
  const [loaded, setLoaded] = React.useState(false);
  const [serviceClass, setServiceClass] = React.useState<K8sResourceKind>();
  const [servicePlanList, setServicePlanList] = React.useState([]);
  const [selectedPlan, setSelectedPlan] = React.useState(-1);
  const [data, setData] = React.useState<K8sResourceKind>();
  const [error, setError] = React.useState('');

  const { namespace, serviceClassName, isClusterServiceClass } = React.useMemo(() => {
    const searchParams = new URLSearchParams(location.search);
    const isClusterServiceClass = searchParams.has('cluster-service-class');
    const serviceClassName = isClusterServiceClass ? searchParams.get('cluster-service-class') : searchParams.get('service-class');
    k8sGet(isClusterServiceClass ? ClusterServiceClassModel : ServiceClassModel, serviceClassName, !isClusterServiceClass && params.ns).then(res => {
      setServiceClass(res);
    });
    return { namespace: params.ns, serviceClassName, isClusterServiceClass };
  }, []);

  React.useEffect(() => {
    k8sList(isClusterServiceClass ? ClusterServicePlanModel : ServicePlanModel, !isClusterServiceClass ? { ns: namespace } : {}).then(plans => {
      const newPlanList = plans.filter(plan => {
        return isClusterServiceClass ? plan.spec.clusterServiceClassRef.name === serviceClassName : plan.spec.serviceClassRef.name === serviceClassName;
      });
      setServicePlanList(newPlanList);
      newPlanList.length > 0 && setSelectedPlan(0);
      setLoaded(true);
    });
  }, []);

  const methods = useForm();
  const serviceClassExternalName = !!serviceClass?.spec?.externalName ? ` (${serviceClass.spec?.externalName} ${isClusterServiceClass ? t('COMMON:MSG_LNB_MENU_110') : t('COMMON:MSG_LNB_MENU_108')})` : '';
  const title = t('SINGLE:MSG_SERVICEINSTANCES_CREATEFORM_DIV1_1');

  const steps = [
    { name: t('SINGLE:MSG_SERVICEINSTANCES_CREATEFORM_STEP2_DIV1_1'), component: <SelectServicePlanComponent loaded={loaded} servicePlanList={servicePlanList} defaultPlan={selectedPlan} />, enableNext: selectedPlan >= 0, nextButtonText: t('COMMON:MSG_COMMON_BUTTON_COMMIT_5') },
    { name: t('SINGLE:MSG_SERVICEINSTANCES_CREATEFORM_STEP3_DIV1_1'), component: <CreateServiceInstanceComponent selectedPlan={servicePlanList[selectedPlan]} defaultValue={data} errorMsg={error} />, nextButtonText: t('COMMON:MSG_COMMON_BUTTON_COMMIT_1'), canJumpTo: selectedPlan >= 0 },
  ];

  return (
    <FormProvider {...methods}>
      <div>
        <Helmet>
          <title>{title}</title>
        </Helmet>
        <div className="co-m-nav-title co-m-nav-title--detail">
          <h1 className="co-m-pane__heading co-m-pane__heading--baseline">
            <div className="co-m-pane__name">
              {title}
              <span className="h2">{serviceClassExternalName}</span>
            </div>
          </h1>
          <p className="co-m-pane__explanation"></p>
        </div>
        <div className="co-m-page__body">
          <Wizard
            className="hc-create-service-instance__wizard"
            key="service-instance-wizard"
            isInPage
            isFullHeight
            isFullWidth
            steps={steps}
            backButtonText={t('COMMON:MSG_COMMON_BUTTON_COMMIT_4')}
            cancelButtonText={t('COMMON:MSG_COMMON_BUTTON_COMMIT_2')}
            onNext={() => {
              const planData = methods.getValues()['service-plan'];
              planData && setSelectedPlan(planData);
            }}
            onBack={() => {
              setData(methods.getValues());
            }}
            onGoToStep={() => {
              const formData = methods.getValues();
              if (formData['service-plan']) {
                setSelectedPlan(formData['service-plan']);
              } else {
                setData(formData);
              }
            }}
            onClose={() => {
              history.goBack();
            }}
            onSave={() => {
              let submitData = methods.getValues();

              let apiVersion = `${ServiceInstanceModel.apiGroup}/${ServiceInstanceModel.apiVersion}`;
              let labels = SelectorInput.objectify(submitData.metadata.labels);
              let spec = { [isClusterServiceClass ? 'clusterServicePlanExternalName' : 'servicePlanExternalName']: servicePlanList[selectedPlan].spec.externalName, [isClusterServiceClass ? 'clusterServiceClassExternalName' : 'serviceClassExternalName']: serviceClass.spec.externalName };

              delete submitData.metadata.labels;

              submitData = _.defaultsDeep({ apiVersion: apiVersion, kind: 'ServiceInstance', metadata: { namespace: namespace, labels: labels }, spec: spec }, submitData);

              k8sCreate(ServiceInstanceModel, submitData)
                .then(() => {
                  history.push(resourceObjPath(submitData, referenceFor(ServiceInstanceModel)));
                })
                .catch(e => {
                  setError(e.message);
                });
            }}
          />
        </div>
        <DevTool control={methods.control} />
      </div>
    </FormProvider>
  );
};

type CreateServiceInstanceProps = {
  match: RMatch<{
    ns?: string;
  }>;
  location?: Location;
  kind: string;
};
