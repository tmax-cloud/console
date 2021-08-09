import * as React from 'react';
import { render } from '../../test-utils';
import { Section } from '../../public/components/hypercloud/utils/section';
import { TextInput } from '../../public/components/hypercloud/utils/text-input';
import { useForm, FormProvider } from 'react-hook-form';

type RenderSectionProps = {
  childrens: React.ReactChild;
  isRequired?: boolean;
  description?: string;
};

describe('Section Test', () => {
  // 일반 컴포넌트를 children으로 갖는  Section
  const renderSection = ({ childrens, isRequired, description }: RenderSectionProps) =>
    render(
      <Section label="Test" id="test" isRequired={isRequired} description={description}>
        {childrens}
      </Section>,
    );

  // react-hook-form 컴포넌트를 children으로 갖는  Section
  const reactHookRenderSection = () =>
    render(
      <Section label="Test" id="test">
        <TextInput name="test-text" id="test-text" />
      </Section>,
      {
        wrapper: ({ children }) => {
          const methods = useForm();
          return (
            <FormProvider {...methods}>
              <form>{children}</form>
            </FormProvider>
          );
        },
      },
    );

  it('Section children 하나일 경우 snapshot이랑 매치 되는지', () => {
    const children = <span>test</span>;
    const { container } = renderSection({ childrens: children });
    expect(container).toMatchSnapshot();
  });

  it('Section children 하나인데 react-hook-form 컴포넌트 일 경우 snapshot이랑 매치 되는지', () => {
    const { container } = reactHookRenderSection();
    expect(container).toMatchSnapshot();
  });

  it('Section children 여러개인 경우 snapshot이랑 매치되는지', () => {
    const childrens = (
      <>
        <span>test 1</span>
        <span>test 2</span>
        <span>test 3</span>
        <span>test 4</span>
      </>
    );
    const { container } = renderSection({ childrens: childrens });
    expect(container).toMatchSnapshot();
  });

  it('Section에 각 프로퍼티 지정시에 잘 매핑되는지', () => {
    const children = <span>test</span>;
    const { getByText } = renderSection({ childrens: children, description: '나는 디스크립션입니다.', isRequired: true });

    // isRequired true일 때 co-required 잘 들어가는지
    expect(getByText('Test')).toHaveClass('co-required');

    // description 정상적으로 출력 잘 되는지
    expect(getByText('나는 디스크립션입니다.')).toMatchSnapshot();
  });
});
