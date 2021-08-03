import * as React from 'react';
import { SelectorInput } from '../../public/components/utils';
import { cleanup, render, act } from '@testing-library/react';
import { configure } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { useForm, FormProvider, Controller } from 'react-hook-form';

// MEMO : testId로 id사용하도록 설정. getByTestId('[id값]')으로 get 가능함.
configure({ testIdAttribute: 'id' });

const mockSubmit = jest.fn(data => {});

const renderSelectorInput = () => {
  const SelectorInputForm = () => {
    const methods = useForm();
    return (
      <FormProvider {...methods}>
        <form
          onSubmit={methods.handleSubmit(data => {
            mockSubmit(data);
          })}
        >
          <Controller name="metadata.labels" id="label" labelClassName="co-text-sample" as={SelectorInput} control={methods.control} tags={['AAA', 'BBB']} valid={true} />
          <button type="submit">Submit</button>
        </form>
      </FormProvider>
    );
  };
  return render(<SelectorInputForm />);
};

describe('SelectorInputTest', () => {
  beforeEach(() => {
    // Empty
  });

  it('tags로 설정한 태그들이 defaultTags로 세팅되어야 합니다.', () => {
    const { container, getByText } = renderSelectorInput();
    expect(getByText('AAA')).toBeTruthy();
    expect(getByText('BBB')).toBeTruthy();
    expect(container.firstChild).toMatchSnapshot();
  });

  it('input에 값을 입력하고 엔터치면 해당 값의 chip이 추가돼야 합니다.', () => {
    const { container, getByText, getByTestId } = renderSelectorInput();
    const tagsInput = getByTestId('tags-input');

    userEvent.type(tagsInput, 'abc');
    userEvent.keyboard('{Enter}');
    expect(tagsInput).toHaveValue('');
    expect(getByText('abc')).toBeTruthy();
    expect(container).toMatchSnapshot();
  });

  it('x 아이콘 클릭 시 해당 tag가 제거돼야 합니다.', () => {
    const { container, getAllByText, queryByText } = renderSelectorInput();
    userEvent.click(getAllByText('×')[1]);
    expect(queryByText('BBB')).toBeNull();
    expect(container).toMatchSnapshot();
  });

  it('Submit 시 보내지는 value 형식 테스트입니다.', async () => {
    const { getByText, getByTestId } = renderSelectorInput();
    const tagsInput = getByTestId('tags-input');

    // MEMO : 'CCC' 태그 chip 추가
    userEvent.type(tagsInput, 'CCC');
    userEvent.keyboard('{Enter}');

    // MEMO : Submit 버튼 클릭하면 Controller의 name="metadata.labels" 이니까 { metadata: { labels: ['AAA', 'BBB', 'CCC'] } 형식으로 value 세팅돼야 함.
    await act(async () => userEvent.click(getByText('Submit')));
    expect(mockSubmit).toHaveBeenCalledTimes(1);
    expect(mockSubmit).toHaveBeenCalledWith({ metadata: { labels: ['AAA', 'BBB', 'CCC'] } });
  });
});
