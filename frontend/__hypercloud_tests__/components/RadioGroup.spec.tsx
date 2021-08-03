import * as React from 'react';
import { RadioGroup } from '../../public/components/hypercloud/utils/radio';
import { cleanup, render, fireEvent, act, screen } from '@testing-library/react';
import { useForm, FormProvider } from 'react-hook-form';

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
          <form>{children}</form>
        </FormProvider>
      );
    },
  });
};

describe('RadioGroupTest', () => {
  afterEach(cleanup);
  beforeEach(() => {});

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

  it("'Memory' Radio버튼 선택 후 submit 시 { 'radio-group': 'memory'} 형식으로 submit 되어야 합니다.", async () => {
    const mockSubmit = jest.fn(data => console.log(data));

    const RadioGroupForm = () => {
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
    };
    
    render(<RadioGroupForm />);
    fireEvent.click(screen.getByText('Memory'));
    await act(async () => fireEvent.submit(screen.getByText('Submit')));
    expect(mockSubmit).toHaveBeenCalledTimes(1);
    expect(mockSubmit).toHaveBeenCalledWith({ 'radio-group': 'memory' });
  });
});
