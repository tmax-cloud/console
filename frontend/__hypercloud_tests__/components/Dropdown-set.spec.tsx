import * as React from 'react';
import { render, act } from '../../test-utils';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { configure } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { DropdownSetComponent, DropdownSetComponentProps } from '../../public/components/hypercloud/utils/dropdown-set';

configure({ testIdAttribute: 'data-test-id' });

const mockSubmit = jest.fn(data => {});
const resources = [
  { label: "Pod", value: "Pod" , apiGroup: "Core", isFirstResource: true},
  { label: "Secret", value: "Secret" , apiGroup: "Core", isFirstResource: false},
  { label: "Node", value: "Node" , apiGroup: "Core", isFirstResource: false},
  { label: "Apple", value: "Apple" , apiGroup: "Fruit", isFirstResource: true},
  { label: "Banana", value: "Banana" , apiGroup: "Fruit", isFirstResource: false},
  { label: "Coconut", value: "Coconut" , apiGroup: "Fruit", isFirstResource: false},
];

const renderDropdownSetComponent = (props: DropdownSetComponentProps) => {  
  return render(<DropdownSetComponent {...props} />, {
    wrapper: ({ children }) => {
      const methods = useForm();
      return (
        <FormProvider {...methods}>
          <form
            onSubmit={methods.handleSubmit(data => {
              mockSubmit(data);
            })}
          >
            <Controller
              as={children}
              control={methods.control}
              name={props.name}
              onChange={([selected]) => {
                return { value: selected };
              }}
              defaultValue={props.defaultValues}
            />
            <button type="submit">Submit</button>
          </form>
        </FormProvider>
      );
    },
  });
};  

const defaultParameters = { name: 'test1', useResourceItemsFormatter: false, items: resources };

describe('DropdownSetComponent test', () => {
  it('초기 렌더 스냅샷 테스트입니다.', () => {
    const { container } = renderDropdownSetComponent({ ...defaultParameters, defaultValues: [{ label: "All", value: "*"}] });
    expect(container.firstChild).toMatchSnapshot();
  });

  it("defaultValue 프로퍼티 추가시에 정상동작 테스트입니다.", () => {
    const { getByText } = renderDropdownSetComponent({
      ...defaultParameters,
      defaultValues: [{ label: "Apple", value: "Apple" , apiGroup: "Fruit", isFirstResource: true}],
    });

    expect(getByText("Apple")).toBeTruthy();
  });

  it("드롭다운 활성화 되었을 때 menulist 펼쳐지는 여부.", () => {
    const { getByText } = renderDropdownSetComponent({
      ...defaultParameters,
      defaultValues: [{ label: "All", value: "*"}],      
    });

    userEvent.click(getByText("Select Resources"));

    resources.forEach( r => {
      expect(getByText(r.label)).toBeTruthy();

    });
  });

  it("add 클릭", () => {    
    let getValues;
    const { getByText, getAllByText, getAllByTestId } = render(
      <DropdownSetComponent
        name="test1"
        useResourceItemsFormatter={false}
        items={resources}
        defaultValues = {[{ label: "All", value: "*"}]}
      />,
      {
        wrapper: ({ children }) => {
          const methods = useForm();
          getValues = methods.getValues;
          return (
            <FormProvider {...methods}>
              <form
                onSubmit={methods.handleSubmit((data) => {
                  mockSubmit(data);
                })}
              >
                <Controller
                  as={children}
                  control={methods.control}
                  name="test1"
                  defaultValue = {[{ label: "All", value: "*"}]}
                  onChange={([selected]) => {
                    return { value: selected };
                  }}
                />
              </form>
            </FormProvider>
          );
        },
      }
    );
    userEvent.click(getAllByText("Clear all")[1]);    
    userEvent.click(getByText("Select Resources"));
    userEvent.click(getAllByTestId("pairs-list__add-icon")[6]);
    expect(getAllByText("Apple")[1]).toBeTruthy();
    
    expect(getValues()).toEqual({
      test1: [{ label: "Apple", value: "Apple", added: true, key: "Apple-Apple", apiGroup: "Fruit", isFirstResource: true}]
    });
  });  

  it("default value 확인", () => {    
    let getValues;
    //const { getByText, getAllByText, getAllByTestId } = render(
      render(
      <DropdownSetComponent
        name="test1"
        useResourceItemsFormatter={false}
        items={resources}
        defaultValues = {[{ label: "Apple", value: "Apple" , apiGroup: "Fruit", isFirstResource: true}]}
      />,
      {
        wrapper: ({ children }) => {
          const methods = useForm();
          getValues = methods.getValues;
          return (
            <FormProvider {...methods}>
              <form
                onSubmit={methods.handleSubmit((data) => {
                  mockSubmit(data);
                })}
              >
                <Controller
                  as={children}
                  control={methods.control}
                  name="test1"
                  defaultValue = {[{ label: "Apple", value: "Apple" , apiGroup: "Fruit", isFirstResource: true}]}
                  onChange={([selected]) => {
                    return { value: selected };
                  }}
                />
              </form>
            </FormProvider>
          );
        },
      }
    );
    //expect(getAllByText("Apple")[1]).toBeTruthy();
    expect(getValues()).toEqual({
      test1: [{ label: "Apple", value: "Apple", apiGroup: "Fruit", isFirstResource: true}]
    });
  });
  it("delete 클릭", () => {
    configure({ testIdAttribute: 'id' });
    let getValues;
    const { getByText, getByTestId } = render(
      <DropdownSetComponent
        name="test1"
        useResourceItemsFormatter={false}
        items={resources}
        defaultValues = {[{ label: "Apple", value: "Apple" , apiGroup: "Fruit", isFirstResource: true}]}
      />,
      {
        wrapper: ({ children }) => {
          const methods = useForm();
          getValues = methods.getValues;
          return (
            <FormProvider {...methods}>
              <form
                onSubmit={methods.handleSubmit((data) => {
                  mockSubmit(data);
                })}
              >
                <Controller
                  as={children}
                  control={methods.control}
                  name="test1"
                  defaultValue = {[{ label: "Apple", value: "Apple" , apiGroup: "Fruit", isFirstResource: true}]}
                  onChange={([selected]) => {
                    return { value: selected };
                  }}
                />
              </form>
            </FormProvider>
          );
        },
      }
    );
    expect(getByText("Apple")).toBeTruthy();
    //userEvent.click(getByTestId("delete-chip"));
    userEvent.click(getByTestId('remove_pf-random-id-13'));
    userEvent.click(getByTestId('remove_pf-random-id-14'));
    
    expect(getValues()).toEqual({
      test1: []
    });
    

    //expect(getByText("Apple")).toBeNull();
  });  

  it("delete Group 클릭", () => {
    configure({ testIdAttribute: 'id' });
    let getValues;
    const { getByText, getByTestId } = render(
      <DropdownSetComponent
        name="test1"
        useResourceItemsFormatter={false}
        items={resources}
        defaultValues = {[{ label: "Apple", value: "Apple" , apiGroup: "Fruit", isFirstResource: true}]}
      />,
      {
        wrapper: ({ children }) => {
          const methods = useForm();
          getValues = methods.getValues;
          return (
            <FormProvider {...methods}>
              <form
                onSubmit={methods.handleSubmit((data) => {
                  mockSubmit(data);
                })}
              >
                <Controller
                  as={children}
                  control={methods.control}
                  name="test1"
                  defaultValue = {[{ label: "Apple", value: "Apple" , apiGroup: "Fruit", isFirstResource: true}]}
                  onChange={([selected]) => {
                    return { value: selected };
                  }}
                />
              </form>
            </FormProvider>
          );
        },
      }
    );
    expect(getByText("Apple")).toBeTruthy();
    //userEvent.click(getByTestId("delete-chip"));
    userEvent.click(getByTestId('remove_group_pf-random-id-15'));
    
    expect(getValues()).toEqual({
      test1: []
    });
    

    //expect(getByText("Apple")).toBeNull();
  });
  it("all delete 클릭", () => {
    let getValues;
    const { getByText, getAllByText } = render(
      <DropdownSetComponent
        name="test1"
        useResourceItemsFormatter={false}
        items={resources}
        defaultValues = {[{ label: "Apple", value: "Apple" , apiGroup: "Fruit", isFirstResource: true}]}
      />,
      {
        wrapper: ({ children }) => {
          const methods = useForm();
          getValues = methods.getValues;
          return (
            <FormProvider {...methods}>
              <form
                onSubmit={methods.handleSubmit((data) => {
                  mockSubmit(data);
                })}
              >
                <Controller
                  as={children}
                  control={methods.control}
                  name="test1"
                  defaultValue = {[{ label: "Apple", value: "Apple" , apiGroup: "Fruit", isFirstResource: true}]}
                  onChange={([selected]) => {
                    return { value: selected };
                  }}
                />
              </form>
            </FormProvider>
          );
        },
      }
    );
    expect(getByText("Apple")).toBeTruthy();
    userEvent.click(getAllByText("Clear all")[1]);    
    
    expect(getValues()).toEqual({
      test1: []
    });
  });
  
  it("Submit 시 보내지는 value 형식 테스트", async () => {
    const { getByText } = renderDropdownSetComponent({
      ...defaultParameters,
      defaultValues: [{ label: "Apple", value: "Apple" , apiGroup: "Fruit", isFirstResource: true}],
    });    
    await act(async () => {
      console.log("눌렸니?");
      userEvent.click(getByText("Submit"));
    });

    expect(mockSubmit).toHaveBeenCalledTimes(1);
    expect(mockSubmit).toHaveBeenCalledWith({ test1: [{ label: "Apple", value: "Apple", apiGroup: "Fruit", isFirstResource: true }] });
  });
  it("Submit 시 보내지는 value 형식 테스트", async () => {
    const { getByText } = renderDropdownSetComponent({
      ...defaultParameters,
      defaultValues: [{label: "All", value: "*"}],
    });

    await act(async () => {
      console.log("눌렸니?");
      userEvent.click(getByText("Submit"));
    });

    expect(mockSubmit).toHaveBeenCalledTimes(2);
    expect(mockSubmit).toHaveBeenLastCalledWith({ test1: [{ label: "All", value: "*"}] });
  });
  
});
