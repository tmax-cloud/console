import * as React from 'react';
import { ResourceDropdown, ResourceDropdownProps } from '@console/internal/components/hypercloud/utils/resource-dropdown';
import { render, act } from '@testing-library/react';
import { DeploymentModel } from '@console/internal/models';
import { DeploymentsTestData } from '../../__hypercloud_mocks__/deploymentMocks';
import * as _ from 'lodash-es';
import { Provider } from 'react-redux';
import store from '@console/internal/redux';
import userEvent from '@testing-library/user-event';
import { configure } from '@testing-library/dom';
import { useForm, FormProvider } from 'react-hook-form';
import * as k8sActions from '@console/internal/actions/k8s';
import { inject } from '@console/internal/components/utils/inject';

const mockSubmit = jest.fn(data => {});

jest.mock('react-i18next', () => ({
  useTranslation: () => {
    return {
      t: str => str,
      i18n: {
        changeLanguage: () => new Promise(() => {}),
      },
    };
  },
  withTranslation: () => Component => {
    Component.defaultProps = { ...Component.defaultProps, t: () => '' };
    return Component;
  },
}));

// MEMO : ResourceDropdown의 ResourceDropdownWrapper_가 Firehose로 감싸져있어서 Firehose컴포넌트에 대한 mocking 해줌
jest.mock('@console/internal/components/utils/firehose', () => {
  return {
    Firehose: props => {
      return inject(props.children, {
        filters: null,
        loaded: true,
        loadError: null,
        resources: {
          deployments: DeploymentsTestData,
        },
      });
    },
  };
});

const renderResourceDropdownForm = (props: ResourceDropdownProps) => {
  return render(<ResourceDropdown {...props} />, {
    wrapper: ({ children }) => {
      const methods = useForm();
      return (
        <Provider store={store}>
          <FormProvider {...methods}>
            <form
              onSubmit={methods.handleSubmit(data => {
                mockSubmit(data);
              })}
            >
              {children}
              <button type="submit">Submit</button>
            </form>
          </FormProvider>
        </Provider>
      );
    },
  });
};

describe('ResourceDropdown Test', () => {
  beforeEach(() => {
    const resources = {
      models: [DeploymentModel],
      adminResources: [],
      allResources: [],
      configResources: [],
      namespacedSet: null,
      safeResources: [],
      preferredVersions: [],
    };
    const action = k8sActions.receivedResources(resources);
    store.dispatch(action);
  });

  it('Single ResourceDropdown 펼쳤을 때 Deployment 리스트아이템 2개가 있어야 합니다.', () => {
    const { container, getByText, getAllByRole } = renderResourceDropdownForm({
      name: 'RD-single',
      placeholder: 'select one deployment',
      resources: [
        {
          kind: 'Deployment',
          namespace: 'catalog',
          prop: 'deployments',
        },
      ],
      type: 'single',
      useHookForm: true,
    });
    userEvent.click(getAllByRole('button')[0]);
    getByText('catalog-catalog-controller-manager');
    expect(getAllByRole('option')).toHaveLength(2);
    expect(container).toMatchSnapshot();
  });

  it('idFunc 지정 시 해당 규칙으로 form value가 생성돼야 합니다.', async () => {
    const { getByText, getAllByRole } = renderResourceDropdownForm({
      name: 'RD-single2',
      resources: [
        {
          kind: 'Deployment',
          namespace: 'catalog',
          prop: 'deployments',
        },
      ],
      type: 'single',
      useHookForm: true,
      idFunc: resource => `${resource.metadata.uid}`,
    });

    userEvent.click(getAllByRole('button')[0]);
    // MEMO : 드롭다운에서 아이템 선택 시 idFunc에 의해 리소스의 metadata.uid value가 지정이 돼야 됨
    userEvent.click(getByText('catalog-catalog-controller-manager'));
    await act(async () => userEvent.click(getByText('Submit')));
    expect(mockSubmit).toBeCalledTimes(1);
    expect(mockSubmit).toHaveBeenCalledWith({ 'RD-single2': '8b12e367-e9e3-4596-9a5c-b4884887923d' });
  });

  it('Multi ResourceDropdown 초기렌더 후 드롭다운 펼쳤을 때의 모습 테스트입니다.', () => {
    const { container, getByText, getAllByRole, getAllByText } = renderResourceDropdownForm({
      name: 'RD-multi',
      resources: [
        {
          kind: 'Deployment',
          namespace: 'catalog',
          prop: 'deployments',
        },
      ],
      type: 'multiple',
      showAll: true,
      useHookForm: true,
    });

    userEvent.click(getAllByRole('button')[0]);
    getByText('All');
    getByText('0');
    expect(getAllByText('Deployment')).toHaveLength(2);
    expect(container).toMatchSnapshot();
  });

  it('Multi ResourceDropdown 드롭다운 내 한개의 아이템 선택 시 title에 개수가 1로 표시 되어야 합니다.', () => {
    configure({ testIdAttribute: 'id' });
    const { getAllByRole, getAllByText, getByTestId } = renderResourceDropdownForm({
      name: 'RD-multi2',
      resources: [
        {
          kind: 'Deployment',
          namespace: 'catalog',
          prop: 'deployments',
        },
      ],
      type: 'multiple',
      showAll: true,
      useHookForm: true,
    });

    userEvent.click(getAllByRole('button')[0]);
    userEvent.click(getAllByText('Deployment')[0]);
    expect(getByTestId('mrd-badge')).toHaveTextContent('1');
  });

  it('Multi ResourceDropdown 드롭다운 내 모든 아이템 선택 시 All아이템항목도 체크돼야 합니다.', () => {
    configure({ testIdAttribute: 'id' });
    const { getAllByRole, getAllByText, getByTestId } = renderResourceDropdownForm({
      name: 'RD-multi3',
      resources: [
        {
          kind: 'Deployment',
          namespace: 'catalog',
          prop: 'deployments',
        },
      ],
      type: 'multiple',
      showAll: true,
      useHookForm: true,
    });

    userEvent.click(getAllByRole('button')[0]);
    getAllByText('Deployment').forEach(item => userEvent.click(item));
    expect(getByTestId('mrd-badge')).toHaveTextContent('All');
    expect(getByTestId('all-resources')).toBeChecked();
  });

  it('Multi ResourceDropdown 드롭다운 아이템리스트 검색 결과 테스트입니다.', () => {
    configure({ testIdAttribute: 'data-test-id' });
    const { getAllByRole, getAllByText, getByTestId, getByText } = renderResourceDropdownForm({
      name: 'RD-multi4',
      resources: [
        {
          kind: 'Deployment',
          namespace: 'catalog',
          prop: 'deployments',
        },
      ],
      type: 'multiple',
      showAll: true,
      useHookForm: true,
    });

    userEvent.click(getAllByRole('button')[0]);
    userEvent.type(getByTestId('dropdown-text-filter'), 'catalog-catalog-w');
    getByText('catalog-catalog-webhook');
    expect(getAllByText('Deployment')).toHaveLength(1);
  });

  it('Multi ResourceDropdown 아이템 선택 후 Submit 시 value 형태 테스트입니다.', async () => {
    const { getAllByRole, getAllByText, getByText } = renderResourceDropdownForm({
      name: 'RD-multi5',
      resources: [
        {
          kind: 'Deployment',
          namespace: 'catalog',
          prop: 'deployments',
        },
      ],
      type: 'multiple',
      showAll: true,
      useHookForm: true,
    });

    userEvent.click(getAllByRole('button')[0]);
    getAllByText('Deployment').forEach(item => userEvent.click(item));
    await act(async () => userEvent.click(getByText('Submit')));
    expect(mockSubmit).toBeCalled();
    expect(mockSubmit).toHaveBeenLastCalledWith({ 'RD-multi5': ['catalog-catalog-controller-manager', 'catalog-catalog-webhook'] });
  });
});
