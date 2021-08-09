import * as React from 'react';
import { DropdownFirehose, DropdownFirehoseProps } from '@console/internal/components/hypercloud/utils/dropdown-new';
import { render, act } from '../../test-utils';
import { DeploymentModel } from '@console/internal/models';
import { DeploymentsListDummyResponse } from '../../__hypercloud_mocks__/k8sListResponseMocks';
import * as _ from 'lodash-es';
import store from '@console/internal/redux';
import userEvent from '@testing-library/user-event';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import * as k8sActions from '@console/internal/actions/k8s';

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

// MEMO : Firehose에서 리소스리스트 가져올 때 사용하는 k8sList 함수에 대해 mocking 해줌.
const resources = require('@console/internal/module/k8s/resource');
jest.spyOn(resources, 'k8sList').mockImplementation(() => {
  return Promise.resolve(DeploymentsListDummyResponse);
});

const renderDropdownFirehoseForm = (props: DropdownFirehoseProps) => {
  return render(<DropdownFirehose {...props} />, {
    wrapper: ({ children }) => {
      const methods = useForm();
      return (
        <FormProvider {...methods}>
          <form
            onSubmit={methods.handleSubmit(data => {
              mockSubmit(data);
            })}
          >
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

describe('DropdownFirehose Test', () => {
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

  it('드롭다운을 펼쳤을 때 Deployment 리스트아이템 2개가 있어야 합니다.', async () => {
    const { container, getByText } = await renderDropdownFirehoseForm({
      name: 'DropdownFirehose_1',
      resourcesConfig: [
        {
          kind: 'Deployment',
          prop: 'deployment',
          isList: true,
        },
      ],
      kind: 'Deployment',
      width: '250px',
    });
    userEvent.click(getByText('Select...'));
    getByText('catalog-catalog-controller-manager');
    getByText('catalog-catalog-webhook');
    expect(container).toMatchSnapshot();
  });

  it('드롭다운 아이템 한개 선택 시 해당 아이템 선택상태로 드롭다운 타이틀이 변경되어야 합니다.', async () => {
    const { container, getByText, getAllByTitle } = await renderDropdownFirehoseForm({
      name: 'DropdownFirehose_2',
      resourcesConfig: [
        {
          kind: 'Deployment',
          prop: 'deployment',
          isList: true,
        },
      ],
      kind: 'Deployment',
      width: '250px',
    });
    userEvent.click(getByText('Select...'));
    userEvent.click(getByText('catalog-catalog-controller-manager'));

    expect(getAllByTitle('Deployment')).toHaveLength(1);
    expect(getAllByTitle('Deployment')[0]).toHaveClass('co-m-resource-deployment');
    getByText('catalog-catalog-controller-manager');
    expect(container).toMatchSnapshot();
  });

  it('드롭다운 아이템 선택 후 Submit 시 value 형태 테스트입니다.', async () => {
    const { getByText } = await renderDropdownFirehoseForm({
      name: 'DropdownFirehose_3',
      resourcesConfig: [
        {
          kind: 'Deployment',
          prop: 'deployment',
          isList: true,
        },
      ],
      kind: 'Deployment',
      width: '250px',
    });
    userEvent.click(getByText('Select...'));
    userEvent.click(getByText('catalog-catalog-controller-manager'));

    await act(async () => userEvent.click(getByText('Submit')));
    expect(mockSubmit).toBeCalled();
    // MEMO : submitCallback에서 정제하기 전 row한 데이터형식만 체크함.
    expect(mockSubmit).toHaveBeenLastCalledWith({
      DropdownFirehose_3: {
        apiVersion: '',
        kind: 'Deployment',
        label: 'catalog-catalog-controller-manager',
        value: 'catalog-catalog-controller-manager',
      },
    });
  });
});
