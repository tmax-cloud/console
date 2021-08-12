import * as React from 'react';
import { MultiSelectDropdownFirehose, MultiSelectDropdownFirehoseProps } from '@console/internal/components/hypercloud/utils/multi-dropdown-new';
import { render } from '../../test-utils';
import { DeploymentModel } from '@console/internal/models';
import { DeploymentsTestData } from '../../__hypercloud_mocks__/firehoseMocks';
import * as _ from 'lodash-es';
import store from '@console/internal/redux';
import userEvent from '@testing-library/user-event';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import * as k8sActions from '@console/internal/actions/k8s';
import { inject } from '@console/internal/components/utils/inject';

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

let getValues;

const renderMultiSelectDropdownFirehoseForm = (props: MultiSelectDropdownFirehoseProps) => {
  return render(<MultiSelectDropdownFirehose {...props} />, {
    wrapper: ({ children }) => {
      const methods = useForm();
      getValues = methods.getValues;
      return (
        <FormProvider {...methods}>
          <form>
            <Controller
              as={children}
              control={methods.control}
              name={props.name}
              onChange={([selected]) => {
                return { value: selected };
              }}
            />
            <button type="submit">Submit</button>
          </form>
        </FormProvider>
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

  it('드롭다운 하위 모든 아이템을 선택하면 All chip이 추가되고 value도 세팅돼야 합니다.', async () => {
    const { getByText, getAllByText } = await renderMultiSelectDropdownFirehoseForm({
      name: 'MultiDropdownFirehose',
      resourcesConfig: [{ kind: 'Deployment', prop: 'deployment', isList: true }],
      kind: 'Deployment',
      shrinkOnSelectAll: true,
      selectAllChipObj: { label: 'All Select', value: 'all' },
    });
    userEvent.click(getByText('Select Resources'));
    userEvent.click(getAllByText('Deployment')[0]);
    userEvent.click(getAllByText('Deployment')[1]);
    userEvent.click(getByText('Select Resources'));
    getByText('2');
    getByText('All Select');
    expect(getValues?.()).toEqual({ MultiDropdownFirehose: { label: 'All Select', value: 'all' } });
  });

  it('모든 아이템을 체크한 상태에서 All의 체크를 해제하면 value가 비어야 합니다.', async () => {
    const { container, getByText, getAllByText, getAllByRole } = await renderMultiSelectDropdownFirehoseForm({
      name: 'MultiDropdownFirehose2',
      resourcesConfig: [{ kind: 'Deployment', prop: 'deployment', isList: true }],
      kind: 'Deployment',
      shrinkOnSelectAll: true,
      selectAllChipObj: { label: 'All Select', value: 'all' },
    });
    userEvent.click(getByText('Select Resources'));
    userEvent.click(getAllByText('Deployment')[0]);
    userEvent.click(getAllByText('Deployment')[1]);
    expect(getAllByRole('checkbox')[0]).toBeChecked();
    userEvent.click(getAllByText('All')[1]);
    expect(getValues?.()).toEqual({ MultiDropdownFirehose2: [] });
    expect(container).toMatchSnapshot();
  });

  it('검색 필터링 툴바 테스트입니다.', async () => {
    const { container, getByText, getByRole } = await renderMultiSelectDropdownFirehoseForm({
      name: 'MultiDropdownFirehose3',
      resourcesConfig: [{ kind: 'Deployment', prop: 'deployment', isList: true }],
      kind: 'Deployment',
      selectAllChipObj: { label: 'All Select', value: 'all' },
    });
    userEvent.click(getByText('Select Resources'));
    userEvent.type(getByRole('textbox'), 'catalog-catalog-w');
    getByText('catalog-catalog-webhook');
    expect(container).toMatchSnapshot();
  });

  it('shrinkOnSelectAll가 false인 드롭다운의 모든 아이템 선택 후 clear all 클릭 동작 테스트입니다.', async () => {
    const { container, getByText, getAllByText } = await renderMultiSelectDropdownFirehoseForm({
      name: 'MultiDropdownFirehose4',
      resourcesConfig: [{ kind: 'Deployment', prop: 'deployment', isList: true }],
      kind: 'Deployment',
      shrinkOnSelectAll: false,
    });
    userEvent.click(getByText('Select Resources'));
    userEvent.click(getAllByText('Deployment')[0]);
    userEvent.click(getAllByText('Deployment')[1]);
    expect(getValues?.()).toEqual({
      MultiDropdownFirehose4: [
        {
          key: 'Deployment_catalog-catalog-controller-manager',
          apiVersion: '',
          kind: 'Deployment',
          label: 'catalog-catalog-controller-manager',
          value: 'catalog-catalog-controller-manager',
        },
        {
          key: 'Deployment_catalog-catalog-webhook',
          apiVersion: '',
          kind: 'Deployment',
          label: 'catalog-catalog-webhook',
          value: 'catalog-catalog-webhook',
        },
      ],
    });
    userEvent.click(getAllByText('Clear all')[1]);
    expect(getValues?.()).toEqual({ MultiDropdownFirehose4: [] });
    expect(container).toMatchSnapshot();
  });
});
