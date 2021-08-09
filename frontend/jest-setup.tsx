import '@testing-library/jest-dom';
import 'url-search-params-polyfill';

// MEMO : jest setup단계에서 store를 만들어주지 않으면 InputSelectBox.spec.tsx 테스트코드 실행 시 타는 createStore단계에서 UI 키에 대한 reducer가 없다는 에러가 뜸.
// setup단계에서 store를 만들어 export해주고 test-util에서 store를 사용해서 render함수 래핑하는 순서로 구현함.
import store from '@console/internal/redux';
export { store };
