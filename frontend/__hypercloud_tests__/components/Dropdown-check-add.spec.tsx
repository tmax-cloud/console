import * as React from "react";
import { render, act } from "../../test-utils";
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { configure } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import {
  DropdownCheckAddComponent,
  DropdownCheckAddComponentProps,
} from "../../public/components/hypercloud/utils/dropdown-check-add";
import * as _ from 'lodash-es';





configure({ testIdAttribute: "data-test-id" });

const mockSubmit = jest.fn((data) => {});
const resources = [
  { label: "Core", value: "Core" },
  { label: "Apple", value: "Apple" },
  { label: "Banana", value: "Banana" },
];


const renderDropdownCheckAddComponent = (props: DropdownCheckAddComponentProps) => {  
  return render(<DropdownCheckAddComponent {...props} />, {
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
//const defaultParameters = { name: 'test1', useResourceItemsFormatter: true, items: resources };

describe("DropdownCheckAddComponent test", () => {
  it("초기 렌더 스냅샷 테스트입니다.", () => {
    const { container } = renderDropdownCheckAddComponent({
      ...defaultParameters,
      defaultValues: [{ label: "All", value: "*", checked: true, added: true}],
    });
    expect(container.firstChild).toMatchSnapshot();
  });

  it("defaultValue 프로퍼티 추가시에 정상동작 테스트입니다.", () => {
    const { getByText } = renderDropdownCheckAddComponent({
      ...defaultParameters,
      defaultValues: [{ label: "Apple", value: "Apple" }],
    });

    expect(getByText("Apple")).toBeTruthy();
  });

  it("드롭다운 활성화 되었을 때 menulist 펼쳐지는 여부.", () => {
    const { getByText } = renderDropdownCheckAddComponent({
      ...defaultParameters,
      defaultValues: [{ label: "All", value: "*", checked: true, added: true}],      
    });

    userEvent.click(getByText("Select Resources"));

    resources.forEach( r => {
      expect(getByText(r.label)).toBeTruthy();

    });
  });

  it("add 클릭", () => {    
    let getValues;
    const { getByText, getAllByText, getAllByTestId } = render(
      <DropdownCheckAddComponent
        name="test1"
        useResourceItemsFormatter={false}
        items={resources}
        defaultValues={[{ label: "All", value: "*", checked: true, added: true}]}
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
                  defaultValue={[{ label: "All", value: "*", checked: true, added: true}]}
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
    userEvent.click(getAllByTestId("pairs-list__add-icon")[2]);
    expect(getAllByText("Apple")[1]).toBeTruthy();    
    
    expect(getValues()).toEqual({
      test1: [{ label: "Apple", value: "Apple", added: true, key: "Apple-Apple"}]
    });
  });

  it("check 클릭", async () => {
    let getValues;
    const { getByText, getAllByText, getAllByTestId } = render(
      <DropdownCheckAddComponent
        name="test1"
        useResourceItemsFormatter={false}
        items={resources}
        defaultValues={[{ label: "All", value: "*", checked: true, added: true}]}
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
                  defaultValue={[{ label: "All", value: "*", checked: true, added: true}]}
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
    userEvent.click(getAllByTestId("pairs-list__add-icon")[2]);
    userEvent.click(getAllByTestId("checkbox")[2]);
    expect(getAllByText("Apple")[1]).toBeTruthy();
    expect(getValues()).toEqual({
      test1: [{ label: "Apple", value: "Apple", checked: true, added: true, key: "Apple-Apple"}]
    });
  });
  

  

  it("delete 클릭", () => {
    configure({ testIdAttribute: 'id' });
    let getValues;
    const { getByText, getByTestId } = render(
      <DropdownCheckAddComponent
        name="test1"
        useResourceItemsFormatter={false}
        items={resources}
        defaultValues = {[{ label: "Apple", value: "Apple" }]}
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
                  defaultValue = {[{ label: "Apple", value: "Apple" }]}
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
    userEvent.click(getByTestId('remove_pf-random-id-15'));
    userEvent.click(getByTestId('remove_pf-random-id-16'));
    
    expect(getValues()).toEqual({
      test1: []
    });
    

    //expect(getByText("Apple")).toBeNull();
  });
  it("delete 클릭 - one chip", () => {
    configure({ testIdAttribute: 'id' });
    let getValues;
    const { getByText, getByTestId } = render(
      <DropdownCheckAddComponent
        name="test1"
        useResourceItemsFormatter={false}
        items={resources}
        defaultValues = {[{ label: "Apple", value: "Apple" }, { label: "Banana", value: "Banana" }]}
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
                  defaultValue = {[{ label: "Apple", value: "Apple" }, { label: "Banana", value: "Banana" }]}
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
    userEvent.click(getByTestId('remove_pf-random-id-18'));    
    
    expect(getValues()).toEqual({
      test1: [{ label: "Apple", value: "Apple" }, { label: "Banana", value: "Banana" }]
    });
    

    //expect(getByText("Apple")).toBeNull();
  });
  it("delete group 클릭", () => {
    configure({ testIdAttribute: 'id' });
    let getValues;
    const { getByText, getByTestId } = render(
      <DropdownCheckAddComponent
        name="test1"
        useResourceItemsFormatter={false}
        items={resources}
        defaultValues = {[{ label: "Apple", value: "Apple" }]}
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
                  defaultValue = {[{ label: "Apple", value: "Apple" }]}
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
    userEvent.click(getByTestId('remove_group_pf-random-id-22'));
    
    expect(getValues()).toEqual({
      test1: []
    });
    

    //expect(getByText("Apple")).toBeNull();
  });
  it("all delete 클릭", () => {
    let getValues;
    const { getByText, getAllByText } = render(
      <DropdownCheckAddComponent
        name="test1"
        useResourceItemsFormatter={false}
        items={resources}
        defaultValues = {[{ label: "Apple", value: "Apple" }]}
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
                  defaultValue = {[{ label: "Apple", value: "Apple" }]}
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
    const { getByText } = renderDropdownCheckAddComponent({
      ...defaultParameters,
      defaultValues: [{ label: "Apple", value: "Apple", checked: true, added: true }],
    });

    await act(async () => {
      console.log("눌렸니?");
      userEvent.click(getByText("Submit"));
    });

    expect(mockSubmit).toHaveBeenCalledTimes(1);
    expect(mockSubmit).toHaveBeenCalledWith({ test1: [{ label: "Apple", value: "Apple", checked: true, added: true}] });
  });
  it("Submit 시 보내지는 value 형식 테스트", async () => {
    const { getByText } = renderDropdownCheckAddComponent({
      ...defaultParameters,
      defaultValues: [{label: "All", value: "*", checked: true, added: true}],
    });

    await act(async () => {
      console.log("눌렸니?");
      userEvent.click(getByText("Submit"));
    });

    expect(mockSubmit).toHaveBeenCalledTimes(2);
    expect(mockSubmit).toHaveBeenLastCalledWith({ test1: [{ label: "All", value: "*", checked: true, added: true}] });
  });
  
});
