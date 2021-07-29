import * as React from 'react';
import { Shortcut, ShortcutTable } from '@console/shared';

const TopologyShortcuts: React.ReactElement = (
  <ShortcutTable>
    <Shortcut drag>Move</Shortcut>
    <Shortcut rightClick>Access context menu</Shortcut>
    <Shortcut click>View details in side panel</Shortcut>
  </ShortcutTable>
);

export default TopologyShortcuts;
