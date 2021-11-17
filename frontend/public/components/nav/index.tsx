import * as React from 'react';
import * as classNames from 'classnames';
import { Nav, NavProps, NavList, PageSidebar } from '@patternfly/react-core';
import PerspectiveNav from './perspective-nav';
import NavHeader from './nav-header';
import NavFooter from './nav-footer';

type NavigationProps = {
  onNavSelect: NavProps['onSelect'];
  onPerspectiveSelected: () => void;
  onClusterSelected: () => void;
  isNavOpen: boolean;
  isMasterPerspective: boolean;
};

export const Navigation: React.FC<NavigationProps> = React.memo(({ isNavOpen, onNavSelect, onPerspectiveSelected, onClusterSelected, isMasterPerspective }) => (
  <PageSidebar
    nav={
      <>
        <Nav aria-label="Nav" onSelect={onNavSelect} theme="dark">
          <div className={classNames('pf-c-nav__list-container', { 'without-footer': !isMasterPerspective })}>
            <NavHeader onPerspectiveSelected={onPerspectiveSelected} onClusterSelected={onClusterSelected} />
            <NavList>
              <PerspectiveNav />
            </NavList>
          </div>
          {isMasterPerspective && <NavFooter />}
        </Nav>
      </>
    }
    isNavOpen={isNavOpen}
    theme="dark"
  />
));
