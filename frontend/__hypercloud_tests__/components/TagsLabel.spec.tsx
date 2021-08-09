import * as React from 'react';
import { TagsLabel } from '@console/internal/components/hypercloud/utils/tags-label';
import { render, act } from '../../test-utils';
import userEvent from '@testing-library/user-event';
import { configure } from '@testing-library/dom';
import { useForm, FormProvider } from 'react-hook-form';

configure({ testIdAttribute: 'id' });

const mockSubmit = jest.fn(data => {});

const renderTagsLabelForm = () => {
  return render(<TagsLabel name="metadata.tags" placeholder="Enter tag" />, {
    wrapper: ({ children }) => {
      const methods = useForm({
        defaultValues: {
          metadata: {
            tags: ['AAA', 'BBB'],
          },
        },
      });
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

describe('TagsLabel Test', () => {
  beforeEach(() => {
    // Empty
  });

  it('form의 defaultValues로 기본 tag들이 생성돼야 합니다.', () => {
    const { container, getByText } = renderTagsLabelForm();
    expect(getByText('AAA')).toBeTruthy();
    expect(getByText('BBB')).toBeTruthy();
    expect(container).toMatchSnapshot();
  });

  it('input에 값을 입력하고 엔터치면 해당 값의 chip이 추가돼야 합니다.', () => {
    const { container, getByText, getByTestId } = renderTagsLabelForm();
    const tagsInput = getByTestId('tags-input');

    userEvent.type(tagsInput, 'CCC');
    userEvent.keyboard('{Enter}');
    expect(tagsInput).toHaveValue('');
    expect(getByText('CCC')).toBeTruthy();
    expect(container).toMatchSnapshot();
  });

  it('x 아이콘 클릭 시 해당 tag가 제거돼야 합니다.', () => {
    const { container, queryByText, getAllByText } = renderTagsLabelForm();

    userEvent.click(getAllByText('×')[0]);
    userEvent.click(getAllByText('×')[0]);
    expect(queryByText('×')).toBeNull();
    expect(container).toMatchSnapshot();
  });

  it('Submit 시 보내지는 value 형식 테스트입니다.', async () => {
    const { getByText, getByTestId } = renderTagsLabelForm();
    const tagsInput = getByTestId('tags-input');

    // MEMO : 'CCC' 태그 chip 추가
    userEvent.type(tagsInput, 'CCC');
    userEvent.keyboard('{Enter}');

    // MEMO : Submit 버튼 클릭하면 TagsLabel name="metadata.tags" 이니까 { metadata: { tags: ['AAA', 'BBB', 'CCC'] } 형식으로 value 세팅돼야 함.
    await act(async () => userEvent.click(getByText('Submit')));
    expect(mockSubmit).toHaveBeenCalledTimes(1);
    expect(mockSubmit).toHaveBeenCalledWith({ metadata: { tags: ['AAA', 'BBB', 'CCC'] } });
  });
});
