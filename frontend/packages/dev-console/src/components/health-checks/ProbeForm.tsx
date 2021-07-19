import * as React from 'react';
import * as _ from 'lodash';
import { FormikValues, useFormikContext } from 'formik';
import { TextInputTypes, InputGroupText } from '@patternfly/react-core';
import { InputGroupField, InputField, DropdownField, ActionGroupWithIcons } from '@console/shared';
import { HTTPRequestTypeForm, TCPRequestTypeForm, CommandRequestTypeForm } from './RequestTypeForms';
import { RequestType } from './health-checks-types';
import FormSection from '../import/section/FormSection';
import { useTranslation } from 'react-i18next';
import './ProbeForm.scss';

const getRequestTypeForm = (value: string, probeType: string) => {
  switch (value) {
    case RequestType.HTTPGET:
      return <HTTPRequestTypeForm probeType={probeType} />;
    case RequestType.ContainerCommand:
      return <CommandRequestTypeForm probeType={probeType} />;
    case RequestType.TCPSocket:
      return <TCPRequestTypeForm probeType={probeType} />;
    default:
      return null;
  }
};

interface ProbeFormProps {
  onSubmit: () => void;
  onClose: () => void;
  probeType: string;
}

const ProbeForm: React.FC<ProbeFormProps> = ({ onSubmit, onClose, probeType }) => {
  const { t } = useTranslation();
  const {
    values: { healthChecks },
    errors,
  } = useFormikContext<FormikValues>();

  const RequestTypeOptions = {
    httpGet: t('SINGLE:MSG_DEPLOYMENTS_EDITDEPLOYMENTS_EDITHEALTHCHECKS_28'),
    command: t('SINGLE:MSG_DEPLOYMENTS_EDITDEPLOYMENTS_EDITHEALTHCHECKS_29'),
    tcpSocket: t('SINGLE:MSG_DEPLOYMENTS_EDITDEPLOYMENTS_EDITHEALTHCHECKS_30'),
  };

  return (
    <div className="odc-heath-check-probe-form">
      <FormSection>
        <DropdownField name={`healthChecks.${probeType}.data.requestType`} label={t('SINGLE:MSG_DEPLOYMENTS_EDITDEPLOYMENTS_ADDHEALTHCHECKS_15')} items={RequestTypeOptions} title={RequestType.HTTPGET} fullWidth />
        {getRequestTypeForm(healthChecks?.[probeType]?.data?.requestType, probeType)}
        <InputField type={TextInputTypes.number} name={`healthChecks.${probeType}.data.failureThreshold`} label={t('SINGLE:MSG_DEPLOYMENTS_EDITDEPLOYMENTS_ADDHEALTHCHECKS_23')} style={{ maxWidth: '100%' }} helpText={t('SINGLE:MSG_DEPLOYMENTS_EDITDEPLOYMENTS_ADDHEALTHCHECKS_24')} />
        <InputField type={TextInputTypes.number} name={`healthChecks.${probeType}.data.successThreshold`} label={t('SINGLE:MSG_DEPLOYMENTS_EDITDEPLOYMENTS_ADDHEALTHCHECKS_25')} style={{ maxWidth: '100%' }} helpText={t('SINGLE:MSG_DEPLOYMENTS_EDITDEPLOYMENTS_ADDHEALTHCHECKS_26')} />
        <InputGroupField type={TextInputTypes.number} name={`healthChecks.${probeType}.data.initialDelaySeconds`} label={t('SINGLE:MSG_DEPLOYMENTS_EDITDEPLOYMENTS_ADDHEALTHCHECKS_27')} helpText={t('SINGLE:MSG_DEPLOYMENTS_EDITDEPLOYMENTS_ADDHEALTHCHECKS_29')} afterInput={<InputGroupText>{t('SINGLE:MSG_DEPLOYMENTS_EDITDEPLOYMENTS_ADDHEALTHCHECKS_28')}</InputGroupText>} style={{ maxWidth: '100%' }} />
        <InputGroupField type={TextInputTypes.number} name={`healthChecks.${probeType}.data.periodSeconds`} label={t('SINGLE:MSG_DEPLOYMENTS_EDITDEPLOYMENTS_ADDHEALTHCHECKS_30')} helpText={t('SINGLE:MSG_DEPLOYMENTS_EDITDEPLOYMENTS_ADDHEALTHCHECKS_31')} afterInput={<InputGroupText>{t('SINGLE:MSG_DEPLOYMENTS_EDITDEPLOYMENTS_ADDHEALTHCHECKS_28')}</InputGroupText>} style={{ maxWidth: '100%' }} />
        <InputGroupField type={TextInputTypes.number} name={`healthChecks.${probeType}.data.timeoutSeconds`} label={t('SINGLE:MSG_DEPLOYMENTS_EDITDEPLOYMENTS_ADDHEALTHCHECKS_32')} helpText={t('SINGLE:MSG_DEPLOYMENTS_EDITDEPLOYMENTS_ADDHEALTHCHECKS_33')} afterInput={<InputGroupText>{t('SINGLE:MSG_DEPLOYMENTS_EDITDEPLOYMENTS_ADDHEALTHCHECKS_28')}</InputGroupText>} style={{ maxWidth: '100%' }} />
      </FormSection>
      <ActionGroupWithIcons onSubmit={onSubmit} onClose={onClose} isDisabled={!_.isEmpty(errors?.healthChecks?.[probeType])} />
    </div>
  );
};

export default ProbeForm;
