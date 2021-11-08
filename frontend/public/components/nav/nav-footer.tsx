import * as React from 'react';
import { Tooltip, TooltipPosition } from '@patternfly/react-core';
import { Link } from 'react-router-dom';
import { CogIcon } from '@patternfly/react-icons';

const NavFooter = props => {
  return (
    <div className="hc-nav-footer">
      <Tooltip content="Menu Settings" position={TooltipPosition.top}>
        <Link to="/k8s/cluster/clustermenupolicies" className="hc-settings-button" aria-label="Menu Settings">
          <CogIcon className="hc-settings-icon" color="#F9F9F9" />
        </Link>
      </Tooltip>
    </div>
  );
};

export default NavFooter;
