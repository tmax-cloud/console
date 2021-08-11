import * as React from 'react';
import { MultiSelectDropdownWithRef, MultiSelectDropdownWithRefProps } from '@console/internal/components/hypercloud/utils/multi-dropdown-new';
import { render, act } from '../../test-utils';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import userEvent from '@testing-library/user-event';
import { configure } from '@testing-library/dom';

const mockSubmit = jest.fn(data => {});

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

const renderMultiSelectDropdownWithRef = (props: MultiSelectDropdownWithRefProps) => {
  return render(<MultiSelectDropdownWithRef {...props} />, {
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
              defaultValue={props.defaultValues}
            />
            <button type="submit">Submit</button>
          </form>
        </FormProvider>
      );
    },
  });
};

describe('MultiSelectDropdownWithRef test', () => {
  it('초기 렌더링 테스트', () => {
    const { container } = renderMultiSelectDropdownWithRef({ name: 'newmultidropdown-useformatter', items: ClusterResourceList });
    expect(container).toMatchSnapshot();
  });

  it('shrinkOnSelectAll 프로퍼티 true로 설정했을 때 동작 테스트2', async () => {
    const { getByText } = await renderMultiSelectDropdownWithRef({
      name: 'newmultidropdown-useformatter3',
      useResourceItemsFormatter: false,
      items: [
        { label: 'AAA', value: 'aaa' },
        { label: 'BBB', value: 'bbb' },
        { label: 'CCC', value: 'ccc' },
      ],
      shrinkOnSelectAll: true,
    });

    userEvent.click(getByText('Select Resources'));
    userEvent.click(getByText('AAA'));
    userEvent.click(getByText('BBB'));
    userEvent.click(getByText('CCC'));
    userEvent.click(getByText('Select Resources'));
    expect(getByText('All')).toBeInTheDocument();
  });
  it('defaultValue 설정했을 때 동작 테스트', () => {
    const { getByText } = renderMultiSelectDropdownWithRef({
      name: 'newmultidropdown-useformatter',
      defaultValues: [{ label: 'BBB', value: 'bbb' }],
      items: [
        { label: 'AAA', value: 'aaa' },
        { label: 'BBB', value: 'bbb' },
        { label: 'CCC', value: 'ccc' },
      ],
      shrinkOnSelectAll: true,
    });

    expect(getByText('BBB')).toBeInTheDocument();
  });

  it('Delete chip 눌렀을 때 동작 테스트', () => {
    configure({ testIdAttribute: 'id' });
    const { getAllByRole, getByText, getByTestId } = renderMultiSelectDropdownWithRef({
      name: 'newmultidropdown-useformatter',
      items: [
        { label: 'AAA', value: 'aaa' },
        { label: 'BBB', value: 'bbb' },
        { label: 'CCC', value: 'ccc' },
      ],
      shrinkOnSelectAll: true,
    });
    userEvent.click(getByText('Select Resources'));
    userEvent.click(getByText('AAA'));
    userEvent.click(getByText('Select Resources'));
    userEvent.click(getByTestId('remove_pf-random-id-7'));
    expect(getAllByRole('img', { hidden: true })).toHaveLength(1);
  });

  it('Clear All 눌렀을 때 동작 테스트', () => {
    const { getAllByRole } = renderMultiSelectDropdownWithRef({
      name: 'newmultidropdown-useformatter',
      defaultValues: [
        { label: 'AAA', value: 'aaa' },
        { label: 'BBB', value: 'bbb' },
      ],
      items: [
        { label: 'AAA', value: 'aaa' },
        { label: 'BBB', value: 'bbb' },
        { label: 'CCC', value: 'ccc' },
      ],
      shrinkOnSelectAll: true,
    });
    const imgCnt = getAllByRole('img', { hidden: true }).length;
    userEvent.click(getAllByRole('img', { hidden: true })[imgCnt - 1]);
    expect(getAllByRole('img', { hidden: true })).toHaveLength(1);
  });

  it('useResourceItemsFormatter 프로퍼티 true로 줬을 때 동작 테스트', () => {
    configure({ testIdAttribute: 'id' });
    const { container, getByText } = renderMultiSelectDropdownWithRef({
      name: 'newmultidropdown-useformatter',
      useResourceItemsFormatter: true,
      items: ClusterResourceList,
      shrinkOnSelectAll: true,
    });
    userEvent.click(getByText('Select Resources'));
    expect(container).toHaveTextContent('jmc-zgw2v');
  });

  it('Submit 시 보내지는 value 형식 테스트', async () => {
    const { getByText } = renderMultiSelectDropdownWithRef({
      name: 'newmultidropdown-useformatter',
      useResourceItemsFormatter: true,
      items: ClusterResourceList,
      shrinkOnSelectAll: true,
    });

    userEvent.click(getByText('Select Resources'));
    userEvent.click(getByText('example'));
    userEvent.click(getByText('Select Resources'));

    await act(async () => {
      userEvent.click(getByText('Submit'));
    });

    expect(mockSubmit).toHaveBeenCalledTimes(1);
    expect(mockSubmit).toHaveBeenCalledWith({
      'newmultidropdown-useformatter': [
        {
          apiVersion: 'cluster.tmax.io/v1alpha1',
          key: 'ClusterClaim_example',
          kind: 'ClusterClaim',
          label: 'example',
          value: 'example',
        },
      ],
    });
  });
});
