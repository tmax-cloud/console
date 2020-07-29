import * as React from 'react';
import * as cx from 'classnames';
import {
  ActionGroup,
  Alert,
  Button,
  ButtonVariant
} from '@patternfly/react-core';
import { ButtonBar } from '../../../../../public/components/utils';
import { FormFooterProps } from './form-utils-types';
import './FormFooter.scss';

const FormFooter: React.FC<FormFooterProps> = ({
  handleSubmit,
  handleReset,
  handleCancel,
  submitLabel = 'Save',
  resetLabel = 'Reload',
  cancelLabel = 'Cancel',
  infoTitle = 'You made changes to this page.',
  infoMessage = `Click ${submitLabel} to save changes or ${resetLabel} to cancel changes.`,
  isSubmitting,
  errorMessage,
  successMessage,
  disableSubmit,
  showAlert,
  sticky
}) => (
  <ButtonBar
    className={cx('ocs-form-footer', {
      'ocs-form-footer__sticky': sticky
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
        style={{
          backgroundColor: '#1e6cb9',
          color: '#ffffff',
          padding: '2px 6px',
          border: 'none',
          borderRadius: '2px'
        }}
      >
        {submitLabel}
      </Button>
      {handleReset && (
        <Button
          type="button"
          data-test-id="reset-button"
          variant={ButtonVariant.secondary}
          onClick={handleReset}
          style={{
            marginLeft: '3px',
            backgroundColor: '#ffffff',
            color: '#4d5258',
            padding: '2px 6px',
            border: '1px solid #bbb',
            borderRadius: '2px'
          }}
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
);

export default FormFooter;
