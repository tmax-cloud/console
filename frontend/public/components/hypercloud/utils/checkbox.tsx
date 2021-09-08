import * as React from 'react';
import { useFormContext } from 'react-hook-form';
import { Checkbox } from '../../checkbox';

export const CheckboxGroup: React.SFC<CheckboxGroupProps> = (props) => {
  const { name, items, defaultValue, useAll, required, methods } = props;
  const itemSize = items.length;
  const allItems = items.map(item => item.name);

  const { register, unregister, setValue, watch } = methods ? methods : useFormContext();
  const selected = watch(name, defaultValue);

  const [selectedList, setSelectedList] = React.useState(new Set<string>(selected ? selected : []));
  const [selectedSize, setSelectedSize] = React.useState(useAll && selectedList.has('*') ? itemSize : selectedList.size);

  React.useEffect(() => {
    register({ name }, { required });

    return () => {
      unregister(name);
    }
  }, [name, register, unregister]);

  React.useEffect(() => {
    setValue(name, defaultValue);
  }, [defaultValue]);

  const onChange = (event) => {
    let newList = new Set(selectedList);
    if (useAll && event.target.name === "*") {
      if (event.target.checked) {
        newList = new Set(['*']);
        setSelectedSize(itemSize);
      } else {
        newList = new Set([]);
        setSelectedSize(0);
      }
    } else {
      if (event.target.checked) {
        if (selectedSize === itemSize - 1) {
          newList = new Set(['*']);
        } else {
          newList.add(event.target.name);
        }
        setSelectedSize(selectedSize + 1);
      } else {
        if (selectedSize === itemSize) {
          newList = new Set(allItems);
        }
        newList.delete(event.target.name);
        setSelectedSize(selectedSize - 1);
      }
    }
    setSelectedList(newList);
    setValue(name, [...newList]);
  };

  return <div className="form-group">
    <div className="checkbox-group">
      {useAll && <Checkbox name='*' label='All' onChange={onChange} checked={selectedList.has('*')} />}
      {items.map((item, index) => <Checkbox name={item.name} label={item.label} onChange={onChange} checked={(useAll && selectedList.has('*')) || selectedList.has(item.name)} key={index}/>)}
    </div>
  </div>
};

export type CheckboxProps = {
  name: string;
  label: string;
};

export type CheckboxGroupProps = {
  name: string;
  items: CheckboxProps[];
  useAll?: boolean;
  defaultValue?: string[];
  required?: boolean;
  methods?: any;
};
