import * as React from 'react';
import { NumberSpinner } from '@console/internal/components/hypercloud/utils/number-spinner';
import { render, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm, FormProvider } from 'react-hook-form';

const mockSubmit = jest.fn(data => {});

const renderNumberSpinnerForm = () => {
  return render(<NumberSpinner initialValue={1} min={-2} max={2} name="spinner1" />, {
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

describe('NumberSpinner Test', () => {
  beforeEach(() => {
    // Empty
  });

  it('initValue로 설정한 값으로 input value가 초기세팅 되어야 합니다.', () => {
    const { container, getByRole } = renderNumberSpinnerForm();
    expect(getByRole('spinbutton')).toHaveValue(1);
    expect(container).toMatchSnapshot();
  });

  it('plus button을 한번 클릭하면 input value가 +1 되어야 합니다.', () => {
    const { container, getByTestId, getByRole } = renderNumberSpinnerForm();
    userEvent.click(getByTestId('plus-button'));
    expect(getByRole('spinbutton')).toHaveValue(2);
    expect(container).toMatchSnapshot();
  });

  it('설정한 max값 이상으로 input value가 증가하지 않고 plus button은 disabled 돼야 합니다.', () => {
    const { container, getByTestId, getByRole } = renderNumberSpinnerForm();
    userEvent.click(getByTestId('plus-button'));
    userEvent.click(getByTestId('plus-button'));
    userEvent.click(getByTestId('plus-button'));
    expect(getByRole('spinbutton')).toHaveValue(2);
    expect(getByTestId('plus-button')).toBeDisabled();
    expect(container).toMatchSnapshot();
  });

  it('Submit 시 보내지는 value 형식 테스트입니다.', async () => {
    const { getByText, getByTestId } = renderNumberSpinnerForm();

    // MEMO : minus button 한번 클릭
    userEvent.click(getByTestId('minus-button'));

    await act(async () => userEvent.click(getByText('Submit')));
    expect(mockSubmit).toHaveBeenCalledTimes(1);
    expect(mockSubmit).toHaveBeenCalledWith({ spinner1: '0' });
  });
});
