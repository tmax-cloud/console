import * as React from 'react';
import { ListView } from '@console/internal/components/hypercloud/utils/list-view';
import { NumberSpinner } from '@console/internal/components/hypercloud/utils/number-spinner';
import { render, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm, FormProvider } from 'react-hook-form';
import { Button } from '@patternfly/react-core';

const mockSubmit = jest.fn(data => {});

const renderListViewForm = (props, formDefaultValues?: object) => {
  return render(<ListView {...props} />, {
    wrapper: ({ children }) => {
      const methods = useForm(formDefaultValues ? { defaultValues: formDefaultValues } : {});
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

describe('ListView Test', () => {
  beforeEach(() => {
    // Empty
  });

  it('react-hook-form defaultValues 초기세팅 테스트입니다.', () => {
    const { getAllByTestId, getByTestId } = renderListViewForm(
      { name: 'metadata.listview' },
      {
        metadata: {
          listview: [
            { key: 'A', value: 'a' },
            { key: 'B', value: 'b' },
          ],
        },
      },
    );

    const keyArray = [];
    getAllByTestId('row').forEach((rowItem, index) => {
      keyArray.push({ key: (getByTestId(`metadata.listview[${index}].key`) as HTMLInputElement).value, value: (getByTestId(`metadata.listview[${index}].value`) as HTMLInputElement).value });
    });
    expect(keyArray).toEqual([
      { key: 'A', value: 'a' },
      { key: 'B', value: 'b' },
    ]);
  });

  it('addButtonText로 지정한 값이 추가버튼의 text로 설정되어야 합니다.', () => {
    const { getByText } = renderListViewForm({ name: 'metadata.listview', addButtonText: 'Add Key/Value' });
    getByText('Add Key/Value');
  });

  it('아이템 추가 될 때 name이 형식에 맞게 세팅되고, defaultValue로 지정한 값들이 기본으로 채워져야 합니다.', () => {
    const { getByText, getByTestId } = renderListViewForm({ name: 'metadata.listview', addButtonText: 'Add Key/Value', defaultItem: { key: 'defaultKey', value: 'defaultValue' } });
    userEvent.click(getByText('Add Key/Value'));
    expect(getByTestId('metadata.listview[0].key')).toHaveValue('defaultKey');
    expect(getByTestId('metadata.listview[0].value')).toHaveValue('defaultValue');
  });

  it('아이템 추가 후 리스트뷰 중간 아이템을 제거하면 각 row의 순서 및 값이 유지 되어야 합니다.', () => {
    const { container, getByText, getAllByTestId, getByTestId, getAllByText } = renderListViewForm({
      name: 'metadata.listview',
      addButtonText: 'Add Key/Value',
      defaultValues: [
        { key: 'AAA', value: 'aaa' },
        { key: 'BBB', value: 'bbb' },
        { key: 'CCC', value: 'ccc' },
      ],
    });

    userEvent.click(getByText('Add Key/Value'));
    userEvent.type(getByTestId('metadata.listview[3].key'), 'DDD');
    userEvent.type(getByTestId('metadata.listview[3].value'), 'ddd');

    userEvent.click(getAllByText('Delete')[1]);

    const keyArray = [];
    getAllByTestId('row').forEach((rowItem, index) => {
      keyArray.push((getByTestId(`metadata.listview[${index}].key`) as HTMLInputElement).value);
    });
    expect(keyArray).toEqual(['AAA', 'CCC', 'DDD']);
    expect(container).toMatchSnapshot();
  });

  it('CustomListView 스냅샷 및 react-hook-form 싱크(Submit value) 테스트입니다.', async () => {
    const listHeaderFragment = (
      <div className="row pairs-list__heading">
        <div className="col-xs-4 text-secondary text-uppercase">NAME</div>
        <div className="col-xs-4 text-secondary text-uppercase">NUM</div>
        <div className="col-xs-1 co-empty__header" />
      </div>
    );

    const listItemRenderer = (methods, name, item, index, ListActions, ListDefaultIcons) => (
      <div className="row" key={item.id}>
        <div className="col-xs-4 pairs-list__name-field">
          <input ref={methods.register()} className="pf-c-form-control" data-testid={`metadata.spinnerNumList[${index}].name`} name={`metadata.spinnerNumList[${index}].name`} defaultValue={item.name}></input>
        </div>
        <div className="col-xs-4 pairs-list__value-field">
          <NumberSpinner initialValue={item.number} min={-15} max={15} data-testid={`metadata.spinnerNumList[${index}].number`} name={`metadata.spinnerNumList[${index}].number`} />
        </div>
        <div className="col-xs-1 pairs-list__action">
          <Button
            type="button"
            data-testid="delete-button"
            className="pairs-list__span-btns"
            onClick={() => {
              ListActions.remove(index);
            }}
            variant="plain"
          >
            {ListDefaultIcons.deleteIcon}
          </Button>
        </div>
      </div>
    );
    const { container, getByText, getAllByTestId } = renderListViewForm(
      {
        name: 'metadata.spinnerNumList',
        addButtonText: 'Add NumberSpinner',
        defaultValues: [
          { name: 'row1', number: 1 },
          { name: 'row2', number: 2 },
        ],
        headerFragment: listHeaderFragment,
        itemRenderer: listItemRenderer,
        defaultItem: { name: 'defaultName', number: 0 },
      },
      {},
    );

    // MEMO : item 하나 추가한 뒤 name='row2'인 아이템 삭제 후 Submit
    userEvent.click(getByText('Add NumberSpinner'));
    userEvent.click(getAllByTestId('delete-button')[1]);
    expect(container).toMatchSnapshot();
    await act(async () => userEvent.click(getByText('Submit')));
    expect(mockSubmit).toHaveBeenCalledTimes(1);
    expect(mockSubmit).toHaveBeenCalledWith({
      metadata: {
        spinnerNumList: [
          { name: 'row1', number: '1' },
          { name: 'defaultName', number: '0' },
        ],
      },
    });
  });
});
