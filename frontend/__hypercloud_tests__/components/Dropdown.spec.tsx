import * as React from 'react';
import { render } from '@testing-library/react';
import { useForm, FormProvider } from 'react-hook-form';
import { configure } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { act } from 'react-dom/test-utils';
import { Dropdown, DropdownProps } from '../../public/components/hypercloud/utils/dropdown';

configure({ testIdAttribute: 'data-test-id' });

const mockSubmit = jest.fn(data => {});
const resources = {
  Mi: 'MiB',
  Gi: 'GiB',
  Ti: 'TiB',
};

const renderDropdown = ({ name, required, items, defaultValue, disabled }: DropdownProps) => {
  return render(
    <Dropdown
      name={name}
      className="btn-group"
      items={items} // (필수)
      required={required}
      defaultValue={defaultValue}
      disabled={disabled}
      buttonClassName="dropdown-btn" // 선택된 아이템 보여주는 button (title) 부분 className
      itemClassName="dropdown-item" // 드롭다운 아이템 리스트 전체의 className - 각 row를 의미하는 것은 아님
    />,
    {
      wrapper: ({ children }) => {
        const methods = useForm();
        return (
          <FormProvider {...methods}>
            <form
              onSubmit={methods.handleSubmit(data => {
                console.log('눌렸니?: ', data);
                mockSubmit(data);
              })}
            >
              {children}
              <button type="submit">Submit</button>
            </form>
          </FormProvider>
        );
      },
    },
  );
};

const defaultParameters = { name: 'dropdown1', items: resources };

describe('Dropdown test', () => {
  it('초기 렌더 스냅샷 테스트입니다.', () => {
    const { container } = renderDropdown({ ...defaultParameters });
    expect(container.firstChild).toMatchSnapshot();
  });

  it('defaultValue 프로퍼티 추가시에 정상동작 테스트입니다.', () => {
    const { getByText } = renderDropdown({ ...defaultParameters, defaultValue: 'Gi' });

    expect(getByText('GiB')).toBeTruthy();
  });

  it('드롭다운 활성화 되었을 때 menulist 펼쳐지는 여부.', () => {
    const { getByTestId } = renderDropdown({ ...defaultParameters });

    userEvent.click(getByTestId('dropdown-button'));

    expect(getByTestId('menu-list')).toBeTruthy();
  });

  it('disabled 프로퍼티가 true일 때 테스트.', () => {
    const { getByTestId } = renderDropdown({ ...defaultParameters, disabled: true });

    expect(getByTestId('dropdown-button')).toBeDisabled();
  });

  it('Submit 시 보내지는 value 형식 테스트', async () => {
    const { getByText } = renderDropdown({ ...defaultParameters, defaultValue: 'Gi' });

    await act(async () => {
      console.log('눌렸니?');
      userEvent.click(getByText('Submit'));
    });

    expect(mockSubmit).toHaveBeenCalledTimes(1);
    expect(mockSubmit).toHaveBeenCalledWith({ dropdown1: 'Gi' });
  });
});
