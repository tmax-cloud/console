import * as React from 'react';
import { connect } from 'react-redux';
import { Dropdown, DropdownItem, DropdownToggle, Title } from '@patternfly/react-core';
import { CaretDownIcon } from '@patternfly/react-icons';
import { LoadingInline } from '@console/internal/components/utils';
import { RootState } from '../../../redux';
import { featureReducerName } from '../../../reducers/features';
import { getActiveCluster } from '../../../reducers/ui';
import * as UIActions from '../../../actions/ui';
import { coFetchJSON } from '../../../co-fetch';
import { getId, getUserGroup } from '../../../hypercloud/auth';

type clusterItemProps = {
    displayName: string;
    name: string;
}

type StateProps = {
    activeCluster: string;
    setActiveCluster?: (name: string) => void;
};

export type ClusterDropdownProps = {
    onClusterSelected: () => void;
};

const ClusterDropdown_: React.FC<ClusterDropdownProps & StateProps> = ({
    setActiveCluster,
    onClusterSelected,
    activeCluster,
}) => {
    const [isClusterDropdownOpen, setClusterDropdownOpen] = React.useState(false);
    const [clusters, setClusters] = React.useState([]);
    const [loaded, setLoaded] = React.useState(false);

    const toggleClusterOpen = React.useCallback(() => {
        setClusterDropdownOpen(!isClusterDropdownOpen);
    }, [isClusterDropdownOpen]);

    const onClusterSelect = React.useCallback(
        (event: React.MouseEvent<HTMLLinkElement>, cluster): void => {
            event.preventDefault();

            if (cluster.name !== activeCluster) {
                setActiveCluster(cluster.name);
                window.location.reload()
                // TODO: rerendering 고도화...
            }

            setClusterDropdownOpen(false);
            onClusterSelected && onClusterSelected();
        },
        [activeCluster, onClusterSelected, setActiveCluster],
    );

    const renderClusterToggle = React.useCallback(
        (name: string) => loaded ? (
            <DropdownToggle
                isOpen={isClusterDropdownOpen}
                onToggle={toggleClusterOpen}
                iconComponent={CaretDownIcon}
                data-test-id="perspective-switcher-toggle"
            >
                <Title size="md">
                    {name ? clusters.find(cl => cl.name === name)?.displayName ?? name : 'undefined'}
                </Title>
            </DropdownToggle>) : <LoadingInline />
        ,
        [isClusterDropdownOpen, toggleClusterOpen, clusters, loaded],
    );

    const getClusterItems = React.useCallback(
        (clusters) => {
            let clusterItmes = [];
            clusters.forEach((nextCluster) => (
                clusterItmes.push(
                    <DropdownItem
                        key={nextCluster.name}
                        onClick={(event: React.MouseEvent<HTMLLinkElement>) =>
                            onClusterSelect(event, nextCluster)
                        }
                        isHovered={(nextCluster.name) === activeCluster}
                        component="button"
                    >
                        <Title size="md">
                            {nextCluster.displayName}
                        </Title>
                    </DropdownItem>
                )
            ));
            return clusterItmes;
        },
        [activeCluster, onClusterSelect],
    );

    React.useEffect(() => {
        if (clusters.length == 0 || isClusterDropdownOpen) {
            setLoaded(false);
            coFetchJSON(`/api/multi-hypercloud/clustermanagers/access?userId=${getId()}${getUserGroup()}`, 'GET')
            .then((result) => result.items)
            .then((res) => {
                const clusterList: clusterItemProps[] = res.reduce((list, cluster)=> {
                    if(cluster.status.ready) {
                        list.push({displayName: cluster.fakeMetadata.fakename, name: cluster.metadata.name});
                    }
                    return list;
                }, []);
              
                setClusters(clusterList);

                const hasCluster = activeCluster && clusterList.find(cl => cl.name === activeCluster);

                if (!hasCluster) {
                    setActiveCluster(clusterList[0]?.name);
                }

                setLoaded(true);
            });
        }
    }, [isClusterDropdownOpen]);

    return (
        <Dropdown
            isOpen={isClusterDropdownOpen}
            toggle={renderClusterToggle(activeCluster)}
            dropdownItems={getClusterItems(clusters)}
            data-test-id="perspective-switcher-menu"
        />
    );
};

const mapStateToProps = (state: RootState): StateProps => ({
    activeCluster: getActiveCluster(state),
});

export default connect<StateProps, {}, ClusterDropdownProps, RootState>(
    mapStateToProps,
    { setActiveCluster: UIActions.setActiveCluster },
    null,
    {
        areStatesEqual: (next, prev) =>
            next[featureReducerName] === prev[featureReducerName] &&
            getActiveCluster(next) === getActiveCluster(prev),
    },
)(ClusterDropdown_);
