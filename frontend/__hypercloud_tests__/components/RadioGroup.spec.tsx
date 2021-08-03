import * as React from 'react';
import { RadioGroup } from '../../public/components/hypercloud/utils/radio';
import { cleanup, render, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm, FormProvider } from 'react-hook-form';

const mockSubmit = jest.fn(data => {});

const resources = [
  {
    title: 'Cpu',
    value: 'cpu',
  },
  {
    title: 'Gpu',
    value: 'gpu',
  },
  {
    title: 'Memory',
    value: 'memory',
  },
];

const renderRadioGroup = () => {
  return render(<RadioGroup name="radio-group" items={resources} inline={false} initValue="gpu" />, {
    wrapper: ({ children }) => {
      const methods = useForm();
      return (
        <FormProvider {...methods}>
          <form
            onSubmit={methods.handleSubmit(data => {
              mockSubmit(data);
            })}
          >
            <RadioGroup name="radio-group" items={resources} inline={false} initValue="gpu" />
            <button type="submit">Submit</button>
          </form>
        </FormProvider>
      );
    },
  });
};

describe('RadioGroupTest', () => {
  afterEach(cleanup);
  beforeEach(() => {
    // Empty
  });

  it('초기 렌더 스냅샷 테스트입니다.', () => {
    const { container } = renderRadioGroup();
    expect(container.firstChild).toMatchSnapshot();
  });

  it('items props로 받은 item들을 RadioInput아이템으로 렌더링 되어야 합니다.', () => {
    const { getByDisplayValue } = renderRadioGroup();
    expect(getByDisplayValue('cpu')).toBeTruthy();
    expect(getByDisplayValue('gpu')).toBeTruthy();
    expect(getByDisplayValue('memory')).toBeTruthy();
  });

  it('initValue로 설정한 input은 default로 체크 돼있어야 합니다.', () => {
    const { getByDisplayValue } = renderRadioGroup();
    const gpuRadio = getByDisplayValue('gpu') as HTMLInputElement;
    expect(gpuRadio.checked).toBeTruthy();
  });

  it('Submit 시 보내지는 value 형식 테스트입니다.', async () => {
    const { getByText } = renderRadioGroup();

    // MEMO : memory radio button 선택
    userEvent.click(getByText('Memory'));

    await act(async () => userEvent.click(getByText('Submit')));
    expect(mockSubmit).toHaveBeenCalledTimes(1);
    expect(mockSubmit).toHaveBeenCalledWith({ 'radio-group': 'memory' });
  });
});
