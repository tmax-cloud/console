import * as React from 'react';
import { Alert, AlertActionCloseButton } from '@patternfly/react-core';

export const ToastPopupAlert: React.FC<ToastPopupAlertProps> = ({ title, message, onceOption, sessionStoragekey, setIsAlert }) => (
  <div className="toast-popup-alert">
    <Alert
      variant="info"
      title={title}
      action={
        <AlertActionCloseButton
          onClose={() => {
            if (onceOption) {
              sessionStorage.setItem(sessionStoragekey, 'false');
              setIsAlert(false);
            }
          }}
        />
      }
    >
      {message}
    </Alert>
  </div>
);

type ToastPopupAlertProps = {
  title?: string;
  message?: string;
  onceOption?: boolean;
  sessionStoragekey?: string;
  setIsAlert?: Function;
};
