import * as _ from 'lodash-es';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Section } from '../../utils/section';
import { TextInput } from '../../utils/text-input';
import { Button } from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons';


export const BindingDataItem = props => {
  const { t } = useTranslation()
  const { item, name, index, onDeleteClick } = props;

  return(
    <>
      {/* <div className="co-form-section__separator" /> */}
      <div className="row" key={item.id}>
        <Section id={`${name}[${index}]`} description="">
          <div className="col-xs-12 pairs-list__value-field">
            <Section label={t('SINGLE:MSG_SERVICEBINDINGS_CREATEFORM_DIV2_20')} id={`${name}[${index}].name`} description="" >
              <TextInput inputClassName="pf-c-form-control" id={`${name}[${index}].name`} name={`${name}[${index}].name`} defaultValue={item.name}/>
            </Section>
            <Section label={t('SINGLE:MSG_SERVICEBINDINGS_CREATEFORM_DIV2_21')} id={`${name}[${index}].value`} description="" >
              <TextInput inputClassName="pf-c-form-control" id={`${name}[${index}].value`} name={`${name}[${index}].value`} defaultValue={item.value}/>
            </Section>
          </div>
          <div className="col-xs-1 pairs-list__action">
            <Button type="button" data-test-id="pairs-list__delete-btn" className="pairs-list__span-btns" onClick={onDeleteClick} variant="plain">
              <MinusCircleIcon className="pairs-list__side-btn pairs-list__delete-icon co-icon-space-r" />
              <span>{t('SINGLE:MSG_SERVICEBINDINGS_CREATEFORM_DIV2_19')}</span>
            </Button>
          </div>
        </Section>
      </div>
    </>
  )
}
