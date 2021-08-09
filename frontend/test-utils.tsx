import * as React from 'react';
import { render as rtlRender } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from './jest-setup';

// MEMO : redux Provider로 감싼 구조로 @testing-library/react의 render함수를 래핑함.
const render = (ui: React.ReactElement, options?) => {
  const Wrapper = ({ children }: { children?: React.ReactNode }) => {
    return <Provider store={store}>{!!options?.wrapper ? options.wrapper({ children: children }) : children}</Provider>;
  };

  // MEMO : options로 들어온 wrapper는 Wrapper컴포넌트에서 사용하고, 여기서 wrapper속성을 Wrapper로 덮어씌워서 설정해 줌.
  return rtlRender(ui, { ...options, wrapper: Wrapper });
};

export * from '@testing-library/react';
export { render };
