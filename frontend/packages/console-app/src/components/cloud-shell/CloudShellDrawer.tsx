import * as React from 'react';
import { Tooltip, Flex, FlexItem, FlexModifiers, Button } from '@patternfly/react-core';
import { CloseIcon, ExternalLinkAltIcon } from '@patternfly/react-icons';
import { InlineTechPreviewBadge } from '@console/shared';
import Drawer from '@console/shared/src/components/drawer/Drawer';
import MinimizeRestoreButton from './MinimizeRestoreButton';
import { useTranslation } from 'react-i18next';
import './CloudShellDrawer.scss';

type CloudShellDrawerProps = {
  onClose: () => void;
};

const getMastheadHeight = (): number => {
  const masthead = document.getElementById('page-main-header');
  if (!masthead) return 0;
  const { height } = masthead.getBoundingClientRect();
  return height;
};

const CloudShellDrawer: React.FC<CloudShellDrawerProps> = ({ children, onClose }) => {
  const [expanded, setExpanded] = React.useState<boolean>(true);
  const onMRButtonClick = (expandedState: boolean) => {
    setExpanded(!expandedState);
  };
  const handleChange = (openState: boolean) => {
    setExpanded(openState);
  };
  const { t } = useTranslation();
  const header = (
    <Flex style={{ flexGrow: 1 }}>
      <FlexItem className="co-cloud-shell-drawer__heading">Kubectl Command Line</FlexItem>
      <FlexItem>
        <InlineTechPreviewBadge />
      </FlexItem>
      <FlexItem breakpointMods={[{ modifier: FlexModifiers['align-right'] }]}>
        <Tooltip content={t('COMMON:MSG_MAIN_POPUP_TITLE_7')}>
          <Button variant="plain" component="a" href="/terminal" target="_blank" aria-label="Open terminal in new tab">
            <ExternalLinkAltIcon />
          </Button>
        </Tooltip>
        <MinimizeRestoreButton minimize={expanded} minimizeText={t('COMMON:MSG_MAIN_POPUP_TITLE_8')} restoreText="Restore terminal" onClick={onMRButtonClick} />
        <Tooltip content={t('COMMON:MSG_MAIN_POPUP_COMMIT_5')}>
          <Button variant="plain" data-test-id="cloudshell-terminal-close" type="button" onClick={onClose} aria-label="Close terminal">
            <CloseIcon />
          </Button>
        </Tooltip>
      </FlexItem>
    </Flex>
  );
  return (
    <Drawer open={expanded} defaultHeight={365} header={header} maxHeight={`calc(100vh - ${getMastheadHeight()}px)`} onChange={handleChange} resizable>
      {children}
    </Drawer>
  );
};

export default CloudShellDrawer;
