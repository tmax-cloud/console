import * as React from 'react';
import { TextInput } from '../../public/components/hypercloud/utils/text-input';
import { render, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm, FormProvider } from 'react-hook-form';

const mockSubmit = jest.fn(data => {});

const renderTextInputForm = (props, formDefaultValues?: object) => {
  return render(<TextInput id="textinput" inputClassName="col-md-12" {...props} />, {
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

describe('TextInput Test', () => {
  beforeEach(() => {
    // Empty
  });

  it('defaultValues 초기세팅 테스트입니다.', () => {
    const { getByDisplayValue } = renderTextInputForm({ defaultValue: 'defaultValue' });
    getByDisplayValue('defaultValue');
  });

  it('error 상태일 경우 TextInput이 에러상태로 렌더되어야 합니다.', () => {
    const { container, getByRole } = renderTextInputForm({ valid: false });
    expect(getByRole('textbox')).toHaveClass('error-text');
    expect(container).toMatchSnapshot();
  });

  it('값 입력 후 submit 시 value 형태 테스트입니다.', async () => {
    const { getByRole, getByText } = renderTextInputForm({});
    userEvent.type(getByRole('textbox'), 'hello');
    await act(async () => userEvent.click(getByText('Submit')));
    expect(mockSubmit).toBeCalledTimes(1);
    expect(mockSubmit).toBeCalledWith({ textinput: 'hello' });
  });
});
