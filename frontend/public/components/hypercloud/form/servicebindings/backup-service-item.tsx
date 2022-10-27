import * as _ from 'lodash-es';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Controller, useWatch } from 'react-hook-form';
import { Section } from '../../utils/section';
import { TextInput } from '../../utils/text-input';
import { Button } from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons';
import { NamespaceModel } from '../../../../models';
import { ResourceListDropdown } from '../../utils/resource-list-dropdown';
import { k8sList, modelFor } from '../../../../module/k8s';

import { BindableResourceListDropDown } from './bindable-resource-list-drop-down';

export const BackupServiceItem = props => {
  const { t } = useTranslation();
  const { item, name, index, onDeleteClick, methods } = props;
  const { control } = methods;

  const methodToggle = useWatch({
    name: 'method',
    defaultValue: 'Auto',
  });

  const selectedNS = useWatch<string>({
    control: control,
    name: `${name}[${index}].namespace`,
  });
  const selectedService = useWatch<string>({
    control: control,
    name: `${name}[${index}].kind`,
  });

  const [manualVis, setManualVis] = React.useState(false);
  const [autoVis, setAutoVis] = React.useState(true);
  React.useEffect(() => {
    if (methodToggle === 'Manual') {
      setManualVis(true);
      setAutoVis(false);
    } else if (methodToggle === 'Auto') {
      setManualVis(false);
      setAutoVis(true);
    }
  }, [methodToggle]);

  const [namespaces, setNamespaces] = React.useState([]);
  const [serviceList, setServiceList] = React.useState([]);

  React.useEffect(() => {
    k8sList(NamespaceModel).then(list => setNamespaces(list));
  }, []);

  React.useEffect(() => {
    if (selectedService) {
      const model = modelFor(selectedService);
      if (model) {
        methods.setValue(`${name}[${index}].group`, model.apiGroup);
        methods.setValue(`${name}[${index}].version`, model.apiVersion);
        k8sList(model, { ns: selectedNS }).then(list => {
          setServiceList(list);
        });
      } else {
        setServiceList([]);
      }
    }
  }, [selectedNS, selectedService]);

  return (
    <>
      <div style={{ display: manualVis ? 'block' : 'none' }}>
        {/* <div> */}
        <div className="co-form-section__separator" />
        <div className="row" key={item.id}>
          <Section label={t('SINGLE:MSG_SERVICEBINDINGS_CREATEFORM_DIV2_9')} id={`${name}[${index}]`} description="">
            <div className="col-xs-12 pairs-list__value-field">
              <Section label={t('SINGLE:MSG_SERVICEBINDINGS_CREATEFORM_DIV2_10')} id={'namespace'} description="" isRequired>
                <TextInput inputClassName="pf-c-form-control" id={`${name}[${index}].namespace`} name={`${name}[${index}].namespace`} methods={methods} />
              </Section>
              <Section label={t('SINGLE:MSG_SERVICEBINDINGS_CREATEFORM_DIV2_14')} id={`${name}[${index}].group`} description="" isRequired>
                <TextInput inputClassName="pf-c-form-control" id={`${name}[${index}].group`} name={`${name}[${index}].group`} defaultValue={item.group} />
              </Section>
              <Section label={t('SINGLE:MSG_SERVICEBINDINGS_CREATEFORM_DIV2_15')} id={`${name}[${index}].version`} description="" isRequired>
                <TextInput inputClassName="pf-c-form-control" id={`${name}[${index}].version`} name={`${name}[${index}].version`} defaultValue={item.version} />
              </Section>
              <Section label={t('SINGLE:MSG_SERVICEBINDINGS_CREATEFORM_DIV2_5')} id={`${name}[${index}].kind`} description="" isRequired>
                <TextInput inputClassName="pf-c-form-control" id={`${name}[${index}].kind`} name={`${name}[${index}].kind`} defaultValue={item.kind} />
              </Section>
              <Section label={t('SINGLE:MSG_SERVICEBINDINGS_CREATEFORM_DIV2_7')} id={`${name}[${index}].name`} description="" isRequired>
                <TextInput inputClassName="pf-c-form-control" id={`${name}[${index}].name`} name={`${name}[${index}].name`} defaultValue={item.name} />
              </Section>
            </div>
            <div className="col-xs-1 pairs-list__action">
              <Button type="button" data-test-id="pairs-list__delete-btn" className="pairs-list__span-btns" onClick={onDeleteClick} variant="plain">
                <MinusCircleIcon className="pairs-list__side-btn pairs-list__delete-icon co-icon-space-r" />
                <span>{t('SINGLE:MSG_SERVICEBINDINGS_CREATEFORM_DIV2_13')}</span>
              </Button>
            </div>
          </Section>
        </div>
      </div>

      <div style={{ display: autoVis ? 'block' : 'none' }}>
        <div className="co-form-section__separator" />
        <div className="row" key={item.id}>
          <Section label={t('SINGLE:MSG_SERVICEBINDINGS_CREATEFORM_DIV2_9')} id={`${name}[${index}]`} description="">
            <div className="col-xs-12 pairs-list__value-field">
              <Section label={t('SINGLE:MSG_SERVICEBINDINGS_CREATEFORM_DIV2_10')} id={`${name}[${index}].namespace`} description="" isRequired>
                <Controller as={<ResourceListDropdown key={`${name}[${index}].namespace`} name={`${name}[${index}].namespace`} defaultValue={item.namespace} methods={methods} placeholder={t('SINGLE:MSG_SERVICEBINDINGS_CREATEFORM_DIV2_11')} resourceList={namespaces} kind="Namespace" resourceType="Namespace" type="single" watchedFieldName={`${name}[${index}].namespace`} />} control={methods.control} name={`${name}[${index}].namespace`} defaultValue={item.namespace} />
              </Section>
              <Section label={t('SINGLE:MSG_SERVICEBINDINGS_CREATEFORM_DIV2_5')} id={`${name}[${index}].kind`} description="" isRequired>
                <Controller as={<BindableResourceListDropDown name={`${name}[${index}].kind`} defaultValue={item.kind} methods={methods} placeholder={t('SINGLE:MSG_SERVICEBINDINGS_CREATEFORM_DIV2_6')} watchedFieldName={`${name}[${index}].kind`} />} control={methods.control} name={`${name}[${index}].kind`} defaultValue={item.kind} />
              </Section>
              <Section label={t('SINGLE:MSG_SERVICEBINDINGS_CREATEFORM_DIV2_7')} id={`${name}[${index}].name`} description="" isRequired>
                <Controller as={<ResourceListDropdown name={`${name}[${index}].name`} useHookForm resourceList={serviceList} kind={selectedService} type="single" placeholder={t('SINGLE:MSG_SERVICEBINDINGS_CREATEFORM_DIV2_8')} defaultValue={item.name} autocompletePlaceholder={t('SINGLE:MSG_SERVICEBINDINGS_CREATEFORM_DIV2_8')} methods={methods} watchedFieldName={`${name}[${index}].name`} />} control={methods.control} name={`${name}[${index}].name`} defaultValue={item.name} />
              </Section>
            </div>
            <div className="col-xs-1 pairs-list__action">
              <Button type="button" data-test-id="pairs-list__delete-btn" className="pairs-list__span-btns" onClick={onDeleteClick} variant="plain">
                <MinusCircleIcon className="pairs-list__side-btn pairs-list__delete-icon co-icon-space-r" />
                <span>{t('SINGLE:MSG_SERVICEBINDINGS_CREATEFORM_DIV2_13')}</span>
              </Button>
            </div>
          </Section>
        </div>
      </div>
    </>
  );
};
