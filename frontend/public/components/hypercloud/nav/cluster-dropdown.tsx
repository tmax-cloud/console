import * as React from 'react';
import * as _ from 'lodash-es';
import { connect } from 'react-redux';
import { Dropdown, DropdownItem, DropdownToggle, Title } from '@patternfly/react-core';
import { CaretDownIcon } from '@patternfly/react-icons';
import { history, Loading } from '@console/internal/components/utils';
import { RootState } from '../../../redux';
import { featureReducerName } from '../../../reducers/features';
import { getActiveCluster } from '../../../reducers/ui';
import * as UIActions from '../../../actions/ui';
import { coFetchJSON } from '../../../co-fetch';
import { getId, getUserGroup } from '../../../hypercloud/auth';
import { useTranslation } from 'react-i18next';

type clusterItemProps = {
  displayName: string;
  name: string;
  namespace: string;
};

type StateProps = {
  activeCluster: string;
  setActiveCluster?: (name: string) => void;
};

export type ClusterDropdownProps = {
  onClusterSelected: () => void;
};

const ClusterDropdown_: React.FC<ClusterDropdownProps & StateProps> = ({ setActiveCluster, onClusterSelected, activeCluster }) => {
  const [isClusterDropdownOpen, setClusterDropdownOpen] = React.useState(false);
  const [clusters, setClusters] = React.useState([]);
  const [loaded, setLoaded] = React.useState(false);

  const toggleClusterOpen = React.useCallback(() => {
    setClusterDropdownOpen(!isClusterDropdownOpen);
  }, [isClusterDropdownOpen]);

  const onClusterSelect = React.useCallback(
    (event: React.MouseEvent<HTMLLinkElement>, cluster): void => {
      event.preventDefault();
      const clusterName = `${cluster.namespace}/${cluster.name}`;

      if (clusterName !== activeCluster) {
        setActiveCluster(clusterName);
        history.push('/');
      }

      setClusterDropdownOpen(false);
      onClusterSelected && onClusterSelected();
    },
    [activeCluster, onClusterSelected, setActiveCluster],
  );

  const renderClusterToggle = React.useCallback(
    (name: string) => {
      const isClusterExists = !!name && clusters.find(cl => `${cl.namespace}/${cl.name}` === name);
      const { t } = useTranslation();
      return loaded ? (
        <DropdownToggle isOpen={isClusterDropdownOpen} onToggle={toggleClusterOpen} iconComponent={CaretDownIcon} data-test-id="perspective-switcher-toggle">
          <Title size="md" style={{ color: _.isEmpty(clusters) && 'var(--pf-global--disabled-color--200)' }}>
            {isClusterExists ? name : t('COMMON:MSG_LNB_CONSOLE_1')}
          </Title>
        </DropdownToggle>
      ) : (
        <Loading className="hc-cluster-dropdown--loading" />
      );
    },
    [isClusterDropdownOpen, toggleClusterOpen, clusters, loaded],
  );

  const getClusterItems = React.useCallback(
    clusters => {
      let clusterItmes = [];
      clusters.forEach(nextCluster => {
        const clusterName = `${nextCluster.namespace}/${nextCluster.name}`;
        clusterItmes.push(
          <DropdownItem key={nextCluster.name} onClick={(event: React.MouseEvent<HTMLLinkElement>) => onClusterSelect(event, nextCluster)} isHovered={clusterName === activeCluster} component="button">
            <Title size="md">{clusterName}</Title>
          </DropdownItem>,
        );
      });
      return clusterItmes;
    },
    [activeCluster, onClusterSelect],
  );

  React.useEffect(() => {
    if (clusters.length == 0 || isClusterDropdownOpen) {
      setLoaded(false);
      // MEMO : 마스터클러스터용 콜을 할 땐 location.origin 붙여줘야 함.
      coFetchJSON(`${location.origin}/api/multi-hypercloud/clustermanagers/access?userId=${getId()}${getUserGroup()}`, 'GET')
        .then(result => result.items)
        .then(res => {
          const clusterList: clusterItemProps[] = res.reduce((list, cluster) => {
            if (cluster.status.ready) {
              list.push({ displayName: cluster.metadata.name, name: cluster.metadata.name, namespace: cluster.metadata.namespace });
            }
            return list;
          }, []);

          if (!_.isEqual(clusterList, clusters)) {
            setClusters(clusterList);
          }

          const hasCluster = activeCluster && clusterList.find(cl => `${cl.namespace}/${cl.name}` === activeCluster);

          if (!hasCluster) {
            setActiveCluster(`${clusterList[0]?.namespace}/${clusterList[0]?.name}`);
          }

          setLoaded(true);
        });
    }
  }, [isClusterDropdownOpen]);

  return <Dropdown isOpen={isClusterDropdownOpen} toggle={renderClusterToggle(activeCluster)} dropdownItems={getClusterItems(clusters)} data-test-id="perspective-switcher-menu" />;
};

const mapStateToProps = (state: RootState): StateProps => ({
  activeCluster: getActiveCluster(state),
});

export default connect<StateProps, {}, ClusterDropdownProps, RootState>(mapStateToProps, { setActiveCluster: UIActions.setActiveCluster }, null, {
  areStatesEqual: (next, prev) => next[featureReducerName] === prev[featureReducerName] && getActiveCluster(next) === getActiveCluster(prev),
})(ClusterDropdown_);
