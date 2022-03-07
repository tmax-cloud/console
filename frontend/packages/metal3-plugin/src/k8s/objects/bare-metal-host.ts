import { SecretModel, BareMetalHostModel } from '@console/internal/models';
import { BareMetalHostKind } from '../../types';

export const getSecretName = (name: string): string => `${name}-bmc-secret`;

export const buildBareMetalHostSecret = (name, namespace, username, password) => ({
  apiVersion: SecretModel.apiVersion,
  kind: SecretModel.kind,
  metadata: {
    namespace,
    name: getSecretName(name),
  },
  data: {
    username: btoa(username),
    password: btoa(password),
  },
  type: 'Opaque',
});

export const buildBareMetalHostObject = (
  name,
  namespace,
  BMCAddress,
  bootMACAddress,
  disableCertificateVerification = false,
  online = true,
  description = '',
): BareMetalHostKind => ({
  apiVersion: `${BareMetalHostModel.apiGroup}/${BareMetalHostModel.apiVersion}`,
  kind: BareMetalHostModel.kind,
  metadata: {
    name,
    namespace,
  },
  spec: {
    bmc: {
      address: BMCAddress,
      credentialsName: getSecretName(name),
      disableCertificateVerification,
    },
    bootMACAddress,
    description,
    online,
  },
});
