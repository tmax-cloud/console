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
      /**
       * 초대 수락 api call
       * TODO: admit query parameter 필요
       * TODO: 서버에서 초대 링크를 받은 사용자와 api 콜을 보내는 사용자가 같은지 구분 필요
       */
      const url = `/api/hypercloud/namespaces/${match.params.ns}/${ClusterManagerModel.plural}/${match.params.clusterName}/member_invitation?userId=${getId()}${getUserGroup()}`;
      setResolved(Boolean(await coFetchJSON(url, 'POST')));
    })();
  }, [setResolved]);

  /* route test
  React.useEffect(() => {
    let timeout = setTimeout(() => setResolved(true), 2000);
    return () => {
      clearTimeout(timeout);
    };
  }, [setResolved]);*/

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
