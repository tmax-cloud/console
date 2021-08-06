import * as React from 'react';
import { render } from '@testing-library/react';
import { KeyValueListEditor } from '../../public/components/hypercloud/utils/key-value-list-editor';
import { useForm, FormProvider } from 'react-hook-form';
import { act } from 'react-dom/test-utils';
import { mockGetComputedSpacing, mockDndElSpacing, makeDnd, DND_DIRECTION_DOWN, DND_DRAGGABLE_DATA_ATTR } from 'react-beautiful-dnd-test-utils';
import userEvent from '@testing-library/user-event';

const mockSubmit = jest.fn(data => {});

const defaultValues = {
  metadata: {
    keyvaluelist: [
      { key: 'A', value: 'aaa' },
      { key: 'B', value: 'bbb' },
      { key: 'C', value: 'ccc' },
      { key: 'D', value: 'ddd' },
      { key: 'E', value: 'eee' },
    ],
  },
};

const renderKeyValueList = ({ disableReorder: disableReorder }) => {
  const keyValueListContainer = render(<KeyValueListEditor name="metadata.keyvaluelist" disableReorder={disableReorder} />, {
    wrapper: ({ children }) => {
      const methods = useForm({ defaultValues: defaultValues });
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

  mockDndElSpacing(keyValueListContainer);

  const makeGetDragEl = elm => () => elm.closest(DND_DRAGGABLE_DATA_ATTR);

  return {
    makeGetDragEl,
    ...keyValueListContainer,
  };
};

const createTestTextOrderByTestIdHelper = getAllByTestId => {
  const testTextOrderByTestId = (testId, expectedTexts) => {
    const texts = getAllByTestId(testId).map(x => x.value);
    expect(texts).toEqual(expectedTexts);
  };
  return testTextOrderByTestId;
};

describe('KeyValueList Test', () => {
  beforeEach(() => {
    mockGetComputedSpacing();
  });
  it('disableReorder props가 true일 때  동작 테스트', () => {
    const { getAllByRole } = renderKeyValueList({ disableReorder: true });

    getAllByRole('img', { hidden: true }).forEach(cur => {
      if (cur.classList.contains('vertical-center')) {
        expect(cur.parentNode).toHaveClass('hide');
      }
    });
  });

  it('disableReorder props가 false 때  동작 테스트', () => {
    const { getAllByRole } = renderKeyValueList({ disableReorder: false });

    getAllByRole('img', { hidden: true }).forEach(cur => {
      if (cur.classList.contains('vertical-center')) {
        expect(cur.parentNode).not.toHaveClass('hide');
      }
    });
  });

  it('Submit 시 보내지는 value 형식 테스트', async () => {
    const { getByText } = renderKeyValueList({ disableReorder: false });

    await act(async () => userEvent.click(getByText('Submit')));

    expect(mockSubmit).toHaveBeenCalledTimes(1);
    expect(mockSubmit).toHaveBeenCalledWith(defaultValues);
  });

  it('DnD 테스트', async () => {
    const { getByText, makeGetDragEl, getAllByRole, getAllByTestId } = renderKeyValueList({ disableReorder: false });

    const elArr = getAllByRole('img', { hidden: true }).filter(cur => cur.classList.contains('vertical-center'));

    await makeDnd({
      getByText,
      getDragEl: makeGetDragEl(elArr[0]),
      direction: DND_DIRECTION_DOWN,
      positions: 2,
    });

    const testTextOrderByTestId = createTestTextOrderByTestIdHelper(getAllByTestId);

    testTextOrderByTestId('drag-value-id', ['B', 'C', 'A', 'D', 'E']);
  });
});
