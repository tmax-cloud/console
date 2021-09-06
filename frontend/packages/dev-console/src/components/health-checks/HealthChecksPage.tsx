import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { FirehoseResource, Firehose } from '@console/internal/components/utils';
import AddHealthChecksForm from './AddHealthChecksForm';
import { pluralToKind } from '@console/internal/components/hypercloud/form';

type HealthChecksProps = RouteComponentProps<{
  ns: string;
  plural: string;
  name: string;
  containerName: string;
}>;

const HealthChecksPage: React.FC<HealthChecksProps> = ({ match }) => {
  const { ns, plural, name, containerName } = match.params;
  const resource: FirehoseResource[] = [
    {
      kind: pluralToKind(plural) || plural,
      namespace: ns,
      isList: false,
      name,
      prop: 'resource',
    },
  ];

  return (
    <Firehose resources={resource}>
      <AddHealthChecksForm currentContainer={containerName} />
    </Firehose>
  );
};

export default HealthChecksPage;
