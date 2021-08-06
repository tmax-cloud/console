import * as React from 'react';
import '@testing-library/jest-dom';
import 'url-search-params-polyfill';
import { render as rtlRender } from '@testing-library/react';
import { Provider } from 'react-redux';
import store from '@console/internal/redux';

const render = (ui, options) => {
  const Wrapper = ({ children }) => {
    return <Provider store={store}>{children}</Provider>;
  };
  return rtlRender(ui, { wrapper: Wrapper, ...options });
};

export * from '@testing-library/react';
export { render };
