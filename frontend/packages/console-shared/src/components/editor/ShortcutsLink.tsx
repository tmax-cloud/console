import * as React from 'react';
import { Popover, Button } from '@patternfly/react-core';
import { QuestionCircleIcon } from '@patternfly/react-icons';
import { ShortcutTable, Shortcut } from '../shortcuts';
import { useTranslation } from 'react-i18next';

interface ShortcutsLinkProps {
  onHideShortcuts?: () => {};
}

const ShortcutsLink: React.FC<ShortcutsLinkProps> = ({ onHideShortcuts }) => {
  const { t } = useTranslation();
  return (
    <Popover
      aria-label="Shortcuts"
      bodyContent={
        <ShortcutTable>
          <Shortcut ctrl keyName="space">
            Activate auto complete
        </Shortcut>
          <Shortcut ctrlCmd shift keyName="o">
            View document outline
        </Shortcut>
          <Shortcut hover>View property descriptions</Shortcut>
          <Shortcut ctrlCmd keyName="s">
            Save
        </Shortcut>
        </ShortcutTable>
      }
      maxWidth="25rem"
      distance={18}
      onHide={onHideShortcuts}
    >
      <Button type="button" variant="link" isInline>
        <QuestionCircleIcon className="co-icon-space-r co-p-has-sidebar__sidebar-link-icon" />
        {t('COMMON:MSG_COMMON_BUTTON_ETC_10')}
      </Button>
    </Popover>
  );
}

export default ShortcutsLink;
