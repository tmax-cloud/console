import * as React from 'react';
import * as PropTypes from 'prop-types';
import { Brand, PageHeader } from '@patternfly/react-core';

import { MastheadToolbar } from './masthead-toolbar';
import { history } from './utils';
import hcLogoImg from '../imgs/logo_hyper_cloud_text.svg';
import scLogoImg from '../imgs/logo_super_cloud_text.svg';

export const getBrandingDetails = () => {
  const productName = window.SERVER_FLAGS.customProductName.toLocaleLowerCase();
  switch (productName) {
    case 'hypercloud': {
      return { productName: 'HyperCloud', logoImg: hcLogoImg };
    }
    case 'supercloud': {
      return { productName: 'SuperCloud', logoImg: scLogoImg };
    }
    default: {
      return { productName: 'HyperCloud', logoImg: hcLogoImg };
    }
  }
};

// export const getBrandingDetails = () => {
//   const { logoImg, productName } = getProductLogo(window.SERVER_FLAGS.customProductName);
//   return { logoImg, productName };
// };

export const Masthead = React.memo(({ onNavToggle, keycloak }) => {
  const details = getBrandingDetails();
  const defaultRoute = '/';
  const logoProps = {
    href: defaultRoute,
    // use onClick to prevent browser reload
    onClick: e => {
      e.preventDefault();
      history.push(defaultRoute);
    },
  };

  return <PageHeader id="page-main-header" logo={<Brand src={details.logoImg} alt={details.productName} />} logoProps={logoProps} toolbar={<MastheadToolbar keycloak={keycloak} />} showNavToggle onNavToggle={onNavToggle} />;
});

Masthead.propTypes = {
  onNavToggle: PropTypes.func,
};