import * as React from 'react';
import { InputSelectBox } from '@console/internal/components/hypercloud/utils/inputSelectBox';
import { render, act } from '../../test-utils';
import { configure } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { useForm, FormProvider } from 'react-hook-form';

configure({ testIdAttribute: 'data-test-id' });

const mockSubmit = jest.fn(data => {});

const dropdownUnits = {
  Mi: 'MiB',
  Gi: 'GiB',
  Ti: 'TiB',
};

const renderInputSelectBoxForm = () => {
  return render(<InputSelectBox textName="spec.section.cpu" id="cpu" dropdownName="spec.section.cpuRange" selectedKey="Gi" items={dropdownUnits} />, {
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

describe('InputSelectBox Test', () => {
  beforeEach(() => {
    // Empty
  });
  it('selectedKey로 설정한 값이 selectbox에 default로 선택 되어야 합니다.', () => {
    const { container, getByText } = renderInputSelectBoxForm();
    expect(getByText('GiB')).toBeTruthy();
    expect(container).toMatchSnapshot();
  });

  it('SelectBox 클릭 시 드롭다운 메뉴가 펼쳐져야 합니다.', () => {
    const { container, getByTestId, getAllByRole } = renderInputSelectBoxForm();
    const button = getByTestId('dropdown-button');
    userEvent.click(button);
    expect(getAllByRole('listitem')).toHaveLength(3);
    expect(container).toMatchSnapshot();
  });

  it('Submit 시 보내지는 value 형식 테스트입니다.', async () => {
    const { getByTestId, getByRole, getByText } = renderInputSelectBoxForm();

    // MEMO : input에 300입력, 드롭다운에서 TiB 선택 후 Submit버튼 클릭.
    userEvent.type(getByRole('spinbutton'), '300');
    userEvent.click(getByTestId('dropdown-button'));
    await act(async () => userEvent.click(getByText('TiB')));
    await act(async () => userEvent.click(getByText('Submit')));
    expect(mockSubmit).toHaveBeenCalledTimes(1);
    expect(mockSubmit).toHaveBeenCalledWith({ spec: { section: { cpu: '300', cpuRange: 'Ti' } } });
  });
});
