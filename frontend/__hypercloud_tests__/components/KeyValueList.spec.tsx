import * as React from 'react';
import { render } from '../../test-utils';
import { KeyValueListEditor } from '../../public/components/hypercloud/utils/key-value-list-editor';
import { useForm, FormProvider } from 'react-hook-form';
import { act } from 'react-dom/test-utils';
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
  return render(<KeyValueListEditor name="metadata.keyvaluelist" disableReorder={disableReorder} />, {
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
};

describe('KeyValueList Test', () => {
  // snapshot 테스트는 이 컴포넌트 자체가 id를 랜덤하게 gen해줘서 매번 실패함 (의미가 없음)

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

  // it('DnD 테스트', async () => {
  //   const { getAllByRole, container } = renderKeyValueList({ disableReorder: false });
  //   let start;
  //   let end;

  //   getAllByRole('button')
  //     .filter(cur => cur.classList.contains('pairs-list__action'))
  //     .forEach((cur, idx) => {
  //       if (idx === 0) {
  //         start = cur;
  //       } else if (idx === 3) {
  //         end = cur;
  //       }
  //     });
  //   fireEvent.click(start);
  //   expect(container.firstChild).toMatchSnapshot();
  // });
});
