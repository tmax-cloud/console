import * as React from 'react';
import { RadioInput, RadioGroup } from '../../public/components/hypercloud/utils/radio';
import { mount, ReactWrapper } from 'enzyme';
import { act } from 'react-dom/test-utils';
import { useForm, FormProvider } from 'react-hook-form';

describe('RadioGroupTestSample', () => {
  let wrapper: ReactWrapper;

  beforeEach(async () => {
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

    await act(async () => {
      wrapper = mount(<RadioGroup name="radio-group" items={resources} inline={false} />, {
        wrappingComponent: ({ children }) => {
          const methods = useForm();
          return (
            <FormProvider {...methods}>
              <form>{children}</form>
            </FormProvider>
          );
        },
      });
    });
  });

  it('radio group items rendered', async () => {
    expect(wrapper.debug()).toMatchSnapshot();
    expect(wrapper.find(RadioInput).exists()).toBe(true);
    expect(wrapper.find(RadioInput).length).toBe(3);
  });
});
