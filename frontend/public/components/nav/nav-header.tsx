import * as React from 'react';
import { connect } from 'react-redux';
import { Dropdown, DropdownItem, DropdownToggle, Title, Tooltip } from '@patternfly/react-core';
import { CaretDownIcon } from '@patternfly/react-icons';
import { Perspective } from '@console/plugin-sdk';
import { getPerspectives, PerspectiveType } from '../../hypercloud/perspectives';
import { RootState } from '../../redux';
import { featureReducerName } from '../../reducers/features';
import { getActivePerspective } from '../../reducers/ui';
import * as UIActions from '../../actions/ui';
import { history } from '../utils';
import ClusterDropdown from '../hypercloud/nav/cluster-dropdown';
import { useTranslation } from 'react-i18next';
import { coFetchJSON } from '../../co-fetch';
import { getId, getUserGroup } from '../../hypercloud/auth';

type StateProps = {
  activePerspective: string;
  setActivePerspective?: (id: string) => void;
};

export type NavHeaderProps = {
  onPerspectiveSelected: () => void;
  onClusterSelected: () => void;
};

const NavHeader_: React.FC<NavHeaderProps & StateProps> = ({ setActivePerspective, onPerspectiveSelected, activePerspective, onClusterSelected }) => {
  const [isPerspectiveDropdownOpen, setPerspectiveDropdownOpen] = React.useState(false);
  const [isClusterExist, setIsClusterExist] = React.useState(false);

  React.useEffect(() => {
    if (isPerspectiveDropdownOpen) {
      coFetchJSON(`${location.origin}/api/multi-hypercloud/clustermanagers/access?userId=${getId()}${getUserGroup()}`, 'GET').then(res => (!res.items?.length ? setIsClusterExist(false) : setIsClusterExist(true)));
    }
  }, [isPerspectiveDropdownOpen]);

  const togglePerspectiveOpen = React.useCallback(() => {
    setPerspectiveDropdownOpen(!isPerspectiveDropdownOpen);
  }, [isPerspectiveDropdownOpen]);

  const onPerspectiveSelect = React.useCallback(
    (event: React.MouseEvent<HTMLLinkElement>, perspective: Perspective): void => {
      event.preventDefault();
      if (perspective.properties.id !== activePerspective) {
        setActivePerspective(perspective.properties.id);
        history.push('/'); // 루트로 이동하고 Default 페이지에서 리다이렉트 되도록 함
      }

      setPerspectiveDropdownOpen(false);
      onPerspectiveSelected && onPerspectiveSelected();
    },
    [activePerspective, onPerspectiveSelected, setActivePerspective],
  );

  const renderToggle = React.useCallback(
    (icon: React.ReactNode, name: string) => (
      <DropdownToggle isOpen={isPerspectiveDropdownOpen} onToggle={togglePerspectiveOpen} iconComponent={CaretDownIcon} data-test-id="perspective-switcher-toggle">
        <Title size="md">
          <span className="oc-nav-header__icon">{icon}</span>
          {name}
        </Title>
      </DropdownToggle>
    ),
    [isPerspectiveDropdownOpen, togglePerspectiveOpen],
  );

  const getPerspectiveItems = React.useCallback(
    (perspectives: Perspective[]) => {
      const { t } = useTranslation();

      return perspectives.map((nextPerspective: Perspective) =>
        isClusterExist === false && nextPerspective.properties.id == 'SINGLE' ? (
          <Tooltip key={nextPerspective.properties.id} position="top" content={t('COMMON:MSG_LNB_CONSOLE_1')}>
            <DropdownItem key={nextPerspective.properties.id} onClick={(event: React.MouseEvent<HTMLLinkElement>) => onPerspectiveSelect(event, nextPerspective)} component="button" isDisabled={true}>
              <Title size="md">
                <span className="oc-nav-header__icon">{nextPerspective.properties.icon}</span>
                {nextPerspective.properties.name}
              </Title>
            </DropdownItem>
          </Tooltip>
        ) : (
          <DropdownItem key={nextPerspective.properties.id} onClick={(event: React.MouseEvent<HTMLLinkElement>) => onPerspectiveSelect(event, nextPerspective)} isHovered={nextPerspective.properties.id === activePerspective} component="button">
            <Title size="md">
              <span className="oc-nav-header__icon">{nextPerspective.properties.icon}</span>
              {nextPerspective.properties.name}
            </Title>
          </DropdownItem>
        ),
      );
    },
    [activePerspective, onPerspectiveSelect, isClusterExist],
  );

  const { t } = useTranslation();
  const perspectives = getPerspectives.bind(null, t)();
  const { selectedIcon, name } = React.useMemo(() => perspectives.find(p => p.properties.id === activePerspective).properties, [activePerspective, perspectives]);

  return (
    <>
      <div className="oc-nav-header">
        <div className="hc-dropdown__title">{t('COMMON:MSG_LNB_MENU_CONSOLE_1')}</div>
        <Dropdown isOpen={isPerspectiveDropdownOpen} toggle={renderToggle(selectedIcon, name)} dropdownItems={getPerspectiveItems(perspectives)} data-test-id="perspective-switcher-menu" />
        {activePerspective == PerspectiveType.SINGLE && (
          <>
            <div className="hc-dropdown__title">{t('COMMON:MSG_LNB_MENU_CONSOLE_2')}</div>
            <ClusterDropdown onClusterSelected={onClusterSelected} />
          </>
        )}
      </div>
    </>
  );
};

const mapStateToProps = (state: RootState): StateProps => ({
  activePerspective: getActivePerspective(state),
});

export default connect<StateProps, {}, NavHeaderProps, RootState>(mapStateToProps, { setActivePerspective: UIActions.setActivePerspective }, null, {
  areStatesEqual: (next, prev) => next[featureReducerName] === prev[featureReducerName] && getActivePerspective(next) === getActivePerspective(prev),
})(NavHeader_);
