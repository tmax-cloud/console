import * as React from 'react';
import { DropdownWithRef, DropdownWithRefProps } from '@console/internal/components/hypercloud/utils/dropdown-new';
import { render, act } from '../../test-utils';
import * as _ from 'lodash-es';
import userEvent from '@testing-library/user-event';
import { configure } from '@testing-library/dom';
import { useForm, FormProvider, Controller } from 'react-hook-form';

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

const newDropdownItemList = [
  {
    label: 'AAA',
    value: 'aaa',
  },
  {
    label: 'BBB',
    value: 'bbb',
  },
  {
    label: 'CCC',
    value: 'ccc',
  },
];

const renderDropdownWithRefForm = (props: DropdownWithRefProps) => {
  return render(<DropdownWithRef {...props} />, {
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
              defaultValue={props.defaultValue}
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
    // Empty
  });

  it('useResourceItemsFormatter를 true로 했을 때 리스트에 대해 아이템 포매팅이 이루어져야 합니다.', async () => {
    let getValues;
    const { getByText } = render(<DropdownWithRef name="DropdownWithRef1" useResourceItemsFormatter={true} items={ClusterResourceList} />, {
      wrapper: ({ children }) => {
        const methods = useForm();
        getValues = methods.getValues;
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
                name="DropdownWithRef1"
                onChange={([selected]) => {
                  return { value: selected };
                }}
              />
            </form>
          </FormProvider>
        );
      },
    });

    userEvent.click(getByText('Select...'));
    userEvent.click(getByText('jmc-zgw2v'));
    expect(getValues()).toEqual({
      DropdownWithRef1: {
        apiVersion: 'cluster.tmax.io/v1alpha1',
        kind: 'ClusterManager',
        label: 'jmc-zgw2v',
        value: 'jmc-zgw2v',
      },
    });
  });

  it('드롭다운 아이템 선택 시 타이틀에 반영되어야 합니다.', () => {
    const { container, getByText } = renderDropdownWithRefForm({ name: 'DropdownWithRef2', useResourceItemsFormatter: true, items: ClusterResourceList });
    userEvent.click(getByText('Select...'));
    userEvent.click(getByText('jmc-zgw2v'));
    expect(getByText('CM')).toHaveClass('co-m-resource-icon co-m-resource-clustermanager');
    getByText('jmc-zgw2v');
    expect(container).toMatchSnapshot();
  });

  it('드롭다운 초기렌더 시 props값들로 설정한 width, default, items값들이 잘 반영되어야 합니다.', () => {
    configure({ testIdAttribute: 'class' });
    const { container, getByText, getByTestId } = renderDropdownWithRefForm({ name: 'DropdownWithRef3', defaultValue: { label: 'default', value: 'default' }, useResourceItemsFormatter: false, width: '100px', items: newDropdownItemList });
    getByText('default');
    expect(getByTestId('css-tyvb83-container')).toHaveStyle({ width: '100px' });
    userEvent.click(getByText('default'));
    getByText('AAA');
    getByText('BBB');
    getByText('CCC');
    expect(container).toMatchSnapshot();
  });

  it('아이템 선택 후 Submit 시 value 형태 테스트입니다.', async () => {
    const { getByText } = renderDropdownWithRefForm({ name: 'DropdownWithRef4', defaultValue: { label: 'default', value: 'default' }, useResourceItemsFormatter: false, width: '100px', items: newDropdownItemList });
    userEvent.click(getByText('default'));
    userEvent.click(getByText('AAA'));
    await act(async () => userEvent.click(getByText('Submit')));
    expect(mockSubmit).toBeCalled();
    expect(mockSubmit).toBeCalledWith({ DropdownWithRef4: { label: 'AAA', value: 'aaa' } });
  });
});
