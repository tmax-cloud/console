import * as React from 'react';
import * as _ from 'lodash';
import { FormikValues, useFormikContext } from 'formik';
import { TextInputTypes, FormGroup } from '@patternfly/react-core';
import { InputField, CheckboxField, getFieldId, TextColumnField } from '@console/shared';
import { NameValueEditor } from '@console/internal/components/utils/name-value-editor';
import { Resources } from '../import/import-types';
import { useTranslation } from 'react-i18next';

interface RequestTypeFormProps {
  probeType?: string;
}

export const renderPortField = (fieldName: string, resourceType: Resources) => {
  const { t } = useTranslation();
  if (resourceType === Resources.KnativeService) {
    return <InputField type={TextInputTypes.text} name="knative-port" label={t('SINGLE:MSG_DEPLOYMENTS_EDITDEPLOYMENTS_ADDHEALTHCHECKS_15')} placeholder="0" isDisabled />;
  }
  return <InputField type={TextInputTypes.text} name={fieldName} label={t('SINGLE:MSG_DEPLOYMENTS_EDITDEPLOYMENTS_ADDHEALTHCHECKS_15')} required />;
};

export const HTTPRequestTypeForm: React.FC<RequestTypeFormProps> = ({ probeType }) => {
  const { t } = useTranslation();
  const {
    values: { healthChecks, resources },
    setFieldValue,
  } = useFormikContext<FormikValues>();
  const httpHeaders = healthChecks?.[probeType]?.data?.httpGet?.httpHeaders;
  const initialNameValuePairs = !_.isEmpty(httpHeaders) ? httpHeaders.map(val => _.values(val)) : [['', '']];
  const [nameValue, setNameValue] = React.useState(initialNameValuePairs);
  const portFieldName = `healthChecks.${probeType}.data.httpGet.port`;

  const handleNameValuePairs = React.useCallback(
    ({ nameValuePairs }) => {
      const updatedNameValuePairs = _.compact(
        nameValuePairs.map(([name, value]) => {
          if (_.isObject(value)) {
            return { name, valueFrom: value };
          }
          if (value.length) {
            return { name, value };
          }
          return null;
        }),
      );
      setNameValue(nameValuePairs);
      setFieldValue(`healthChecks.${probeType}.data.httpGet.httpHeaders`, updatedNameValuePairs);
    },
    [setFieldValue, probeType],
  );
  return (
    <>
      <CheckboxField name={`healthChecks.${probeType}.data.httpGet.scheme`} label={t('SINGLE:MSG_DEPLOYMENTS_EDITDEPLOYMENTS_ADDHEALTHCHECKS_16')} value="HTTPS" />
      <FormGroup fieldId={getFieldId(`healthChecks.${probeType}.data.httpGet.httpHeaders`, 'name-value')} name={`healthChecks.${probeType}.data.httpGet.httpHeaders`} label={t('SINGLE:MSG_DEPLOYMENTS_EDITDEPLOYMENTS_ADDHEALTHCHECKS_17')}>
        <NameValueEditor nameValuePairs={nameValue} valueString={t('SINGLE:MSG_DEPLOYMENTS_EDITDEPLOYMENTS_ADDHEALTHCHECKS_19')} nameString={t('SINGLE:MSG_DEPLOYMENTS_EDITDEPLOYMENTS_ADDHEALTHCHECKS_18')} addString={t('SINGLE:MSG_DEPLOYMENTS_EDITDEPLOYMENTS_ADDHEALTHCHECKS_20')} readOnly={false} allowSorting={false} updateParentData={handleNameValuePairs} />
      </FormGroup>
      <InputField type={TextInputTypes.text} name={`healthChecks.${probeType}.data.httpGet.path`} label={t('SINGLE:MSG_DEPLOYMENTS_EDITDEPLOYMENTS_ADDHEALTHCHECKS_21')} placeholder="/" />
      {renderPortField(portFieldName, resources)}
    </>
  );
};

export const TCPRequestTypeForm: React.FC<RequestTypeFormProps> = ({ probeType }) => {
  const {
    values: { resources },
  } = useFormikContext<FormikValues>();
  const portFieldName = `healthChecks.${probeType}.data.tcpSocket.port`;
  return renderPortField(portFieldName, resources);
};

export const CommandRequestTypeForm: React.FC<RequestTypeFormProps> = ({ probeType }) => {
  const { t } = useTranslation();
  const {
    values: { healthChecks },
  } = useFormikContext<FormikValues>();
  const commands = healthChecks?.[probeType]?.data?.exec?.command || [''];
  return <TextColumnField name={`healthChecks.${probeType}.data.exec.command`} label={t('SINGLE:MSG_DEPLOYMENTS_EDITDEPLOYMENTS_EDITHEALTHCHECKS_25')} addLabel={t('SINGLE:MSG_DEPLOYMENTS_EDITDEPLOYMENTS_EDITHEALTHCHECKS_27')} placeholder={t('SINGLE:MSG_DAEMONSETS_EDITDAEMONSETS_ADDHEALTHCHECKS_12')} helpText={t('SINGLE:MSG_DEPLOYMENTS_EDITDEPLOYMENTS_EDITHEALTHCHECKS_26')} required disableDeleteRow={commands.length === 1} />;
};
