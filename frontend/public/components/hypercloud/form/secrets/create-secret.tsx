import * as React from 'react';
import { isCreatePage } from '../create-form';
import { EditSecret as EditSecretPage } from '@console/internal/components/secrets/create-secret';
import { ErrorPage404 } from '@console/internal/components/error';

export const CreateSecret = props => {
  if (!!props.obj && !isCreatePage(props.obj)) {
    return <EditSecretPage kind={props.obj?.kind} {...props} />;
  } else {
    return <ErrorPage404 />;
  }
};
