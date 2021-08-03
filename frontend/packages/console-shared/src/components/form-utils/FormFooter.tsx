import * as React from 'react';
import * as cx from 'classnames';
import { ActionGroup, Alert, Button, ButtonVariant } from '@patternfly/react-core';
import { ButtonBar } from '@console/internal/components/utils';
import { FormFooterProps } from './form-utils-types';
import './FormFooter.scss';
import { useTranslation } from 'react-i18next';

const FormFooter: React.FC<FormFooterProps> = ({
  handleSubmit,
  handleReset,
  handleCancel,
  submitLabel,
  resetLabel,
  cancelLabel,
  infoTitle,
  infoMessage,
  isSubmitting,
  errorMessage,
  successMessage,
  disableSubmit,
  showAlert,
  sticky,
}) => {
  const { t } = useTranslation();
  infoTitle = infoTitle || t('SINGLE:MSG_PIPELINES_PIPELINEDETAILS_TABOVERVIEW_1');
  submitLabel = submitLabel || t('COMMON:MSG_COMMON_BUTTON_COMMIT_3');
  resetLabel = resetLabel || t('COMMON:MSG_COMMON_BUTTON_ETC_14');
  cancelLabel = cancelLabel || t('COMMON:MSG_COMMON_BUTTON_COMMIT_2');
  infoMessage = infoMessage || t('SINGLE:MSG_PIPELINES_PIPELINEDETAILS_TABOVERVIEW_2', { 0: resetLabel, 1: submitLabel });
  //infoMessage === `Click ${submitLabel} to save changes or ${resetLabel} to cancel changes.`

  return <ButtonBar
    className={cx('ocs-form-footer', {
      'ocs-form-footer__sticky': sticky,
    })}
    inProgress={isSubmitting}
    errorMessage={errorMessage}
    successMessage={successMessage}
  >
    {showAlert && (
      <Alert isInline className="co-alert" variant="info" title={infoTitle}>
        {infoMessage}
      </Alert>
    )}
    <ActionGroup className="pf-c-form pf-c-form__group--no-top-margin">
      <Button
        type={handleSubmit ? 'button' : 'submit'}
        {...(handleSubmit && { onClick: handleSubmit })}
        variant={ButtonVariant.primary}
        isDisabled={disableSubmit}
        data-test-id="submit-button"
      >
        {submitLabel}
      </Button>
      {handleReset && (
        <Button
          type="button"
          data-test-id="reset-button"
          variant={ButtonVariant.secondary}
          onClick={handleReset}
        >
          {resetLabel}
        </Button>
      )}
      {handleCancel && (
        <Button
          type="button"
          data-test-id="cancel-button"
          variant={ButtonVariant.secondary}
          onClick={handleCancel}
        >
          {cancelLabel}
        </Button>
      )}
    </ActionGroup>
  </ButtonBar>
};

export default FormFooter;
