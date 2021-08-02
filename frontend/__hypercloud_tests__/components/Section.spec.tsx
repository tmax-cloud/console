import * as React from 'react';
import { Section } from '../../public/components/hypercloud/utils/section';
import { TextInput } from '../../public/components/hypercloud/utils/text-input';
import { mount, ReactWrapper } from 'enzyme';
import { act } from 'react-dom/test-utils';
import { useForm, FormProvider } from 'react-hook-form';

describe('Section Test', () => {
  it('Section children 하나일 경우 snapshot이랑 매치 되는지', () => {
    const wrapper: ReactWrapper = mount(
      <Section label="Test" id="test">
        <span>test</span>
      </Section>,
    );
    expect(wrapper.debug()).toMatchSnapshot();
  });

  it('Section children 하나인데 react-hook-form 컴포넌트 일 경우 snapshot이랑 매치 되는지', async () => {
    let wrapper: ReactWrapper;
    await act(async () => {
      wrapper = mount(
        <Section label="Test" id="test">
          <TextInput name="test-text" id="test-text" />
        </Section>,
        {
          wrappingComponent: ({ children }) => {
            const methods = useForm();
            return (
              <FormProvider {...methods}>
                <form>{children}</form>
              </FormProvider>
            );
          },
        },
      );
    });

    expect(wrapper.debug()).toMatchSnapshot();
  });

  it('Section children 여러개인 경우 snapshot이랑 매치되는지', () => {
    const wrapper: ReactWrapper = mount(
      <Section label="Test" id="test">
        <span>test 1</span>
        <span>test 2</span>
        <span>test 3</span>
        <span>test 4</span>
      </Section>,
    );
    expect(wrapper.debug()).toMatchSnapshot();
  });

  it('Section에 각 프로퍼티 지정시에 잘 매핑되는지', () => {
    const wrapper: ReactWrapper = mount(
      <Section label="Test" description="나는 디스크립션입니다." isRequired={true} id="test">
        <span>test</span>
      </Section>,
    );
    expect(wrapper.debug()).toMatchSnapshot();
    expect(wrapper.props()['label']).toBe('Test');
    expect(wrapper.props()['description']).toBe('나는 디스크립션입니다.');
    expect(wrapper.props()['isRequired']).toBe(true);

    const pElement = wrapper.find('p');
    expect(pElement.text()).toBe('나는 디스크립션입니다.'); // description 잘 나오는지

    const labelElement = wrapper.find('label');
    expect(labelElement.hasClass('co-required')).toBe(true); // required 표시되는지
    expect(labelElement.text()).toBe('Test'); // 라벨 맞게 그려지는지
  });
});
