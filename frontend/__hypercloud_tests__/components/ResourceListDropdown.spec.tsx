import * as React from 'react';
import { ResourceListDropdown, ResourceListDropdownProps } from '@console/internal/components/hypercloud/utils/resource-list-dropdown';
import { render, act } from '../../test-utils';
import * as _ from 'lodash-es';
import userEvent from '@testing-library/user-event';
import { configure } from '@testing-library/dom';
import { useForm, FormProvider } from 'react-hook-form';

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

const renderResourceListDropdownForm = (props: ResourceListDropdownProps) => {
  return render(<ResourceListDropdown {...props} />, {
    wrapper: ({ children }) => {
      const methods = useForm();
      return (
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
      );
    },
  });
};

const ClusterResourceList = [
  {
    kind: 'ClusterManager',
    apiVersion: 'cluster.tmax.io/v1alpha1',
    metadata: {
      name: 'jmc-zgw2v',
      uid: '1a482d7d-ac35-46d3-8496-a94688fc6d0e',
    },
    fakeMetadata: {
      fakename: 'jmc',
    },
  },
  {
    kind: 'ClusterClaim',
    apiVersion: 'cluster.tmax.io/v1alpha1',
    metadata: {
      name: 'example',
      uid: '436b6e22-748e-4e04-aea5-156f2ed35fa0',
    },
  },
];

describe('ResourceListDropdown Test', () => {
  beforeEach(() => {
    // Empty
  });

  it('Single ResourceListDropdown 펼쳤을 때 리스트아이템 CC, CM 2개가 있어야 합니다.', () => {
    const { container, getByText, getAllByRole } = renderResourceListDropdownForm({
      resourceList: ClusterResourceList,
      autocompletePlaceholder: 'search by name',
      placeholder: 'Resource Dropdown',
      type: 'single',
    });
    userEvent.click(getAllByRole('button')[0]);
    getByText('CC');
    getByText('CM');
    expect(getAllByRole('option')).toHaveLength(2);
    expect(container).toMatchSnapshot();
  });

  it('Single ResourceListDropdown 아이템 선택 시 드롭다운이 접히고 타이틀이 변경되어야 합니다.', () => {
    const { container, getByText, getAllByRole, queryByRole } = renderResourceListDropdownForm({
      resourceList: ClusterResourceList,
      autocompletePlaceholder: 'search by name',
      placeholder: 'Resource Dropdown',
      type: 'single',
    });
    userEvent.click(getAllByRole('button')[0]);
    expect(queryByRole('textbox')).toBeTruthy();
    userEvent.click(getByText('jmc'));
    expect(queryByRole('textbox')).toBeNull();
    getByText('jmc');
    expect(container).toMatchSnapshot();
  });

  it('Multi ResourceListDropdown 드롭다운 아이템리스트 검색 결과 테스트입니다.', () => {
    configure({ testIdAttribute: 'data-test-id' });
    const { container, getByText, getAllByRole, getByTestId } = renderResourceListDropdownForm({
      name: 'RLD-multiple',
      resourceList: ClusterResourceList,
      resourceType: 'Cluster and Cluster Claim',
      autocompletePlaceholder: 'search by name',
      type: 'multiple',
      useHookForm: true,
      idFunc: resource => `${resource.kind}~~${resource.metadata.name}`,
    });
    userEvent.click(getAllByRole('button')[0]);
    userEvent.type(getByTestId('dropdown-text-filter'), 'j');
    getByText('jmc');
    expect(getAllByRole('option')).toHaveLength(1);
    expect(container).toMatchSnapshot();
  });

  it('Multi ResourceListDropdown 아이템 선택 시 onChange 바인딩함수 콜여부 및 checkbox 상태와 Submit 시 value형태 테스트입니다.', async () => {
    configure({ testIdAttribute: 'data-test-id' });
    const onChangeMock = jest.fn();
    const { getByText, getAllByRole } = renderResourceListDropdownForm({
      name: 'RLD-multiple2',
      resourceList: ClusterResourceList,
      onChange: onChangeMock,
      resourceType: 'Cluster and Cluster Claim',
      autocompletePlaceholder: 'search by name',
      type: 'multiple',
      useHookForm: true,
      idFunc: resource => `${resource.kind}~~${resource.metadata.name}`,
    });
    userEvent.click(getAllByRole('button')[0]);
    userEvent.click(getByText('jmc'));
    expect(onChangeMock).toHaveBeenCalledWith('ClusterManager~~jmc-zgw2v');
    userEvent.click(getByText('example'));
    expect(onChangeMock).toHaveBeenCalledWith('ClusterClaim~~example');
    getAllByRole('checkbox').forEach(item => expect(item).toBeChecked());

    await act(async () => userEvent.click(getByText('Submit')));
    expect(mockSubmit).toBeCalled();
    expect(mockSubmit).toHaveBeenLastCalledWith({ 'RLD-multiple2': ['ClusterManager~~jmc-zgw2v', 'ClusterClaim~~example'] });
  });
});
