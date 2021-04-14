import * as React from 'react';

import { Translation } from 'react-i18next';
import { HrefLink} from '../../nav/items';
import { NavSection } from '../../nav/section';

const DeveloperNav = () => (
  <Translation>
    {t => (
      <>
        <NavSection title={t('COMMON:MSG_LNB_MENU_1')}>
          <HrefLink href="/add" activePath="/add/" name="+ Add" />
        </NavSection>
      </>
    )}
  </Translation>
);

export default DeveloperNav;