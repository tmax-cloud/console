import * as React from 'react';
import { Redirect } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ClusterManagerModel } from '@console/internal/models';
import { coFetchJSON } from '@console/internal/co-fetch';
import { getId, getUserGroup } from '@console/internal/hypercloud/auth';

export const MultiClusterRedirect = (props: MultiClusterRedirectProps) => {
  const { match } = props;
  const { t } = useTranslation();
  const [resolved, setResolved] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      try {
        const url = `/api/hypercloud/namespaces/${match.params.ns}/${ClusterManagerModel.plural}/${match.params.clusterName}/member_invitation/accept?userId=${getId()}${getUserGroup()}`;
        await coFetchJSON(url);
      } catch {
      } finally {
        setResolved(true);
      }
    })();
  }, [setResolved]);

  if (resolved) {
    return <Redirect to={`/k8s/ns/${match.params.ns}/${ClusterManagerModel.plural}/${match.params.clusterName}`} />;
  }

  return <div className="co-m-pane__body">{`${t('COMMON:MSG_DETAILS_TABLOGS_6')}...`}</div>;
};

interface MultiClusterRedirectProps {
  match: {
    params: { ns: string; clusterName: string };
  };
}
