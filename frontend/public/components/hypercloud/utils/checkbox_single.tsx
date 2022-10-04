import * as React from 'react';
import { useFormContext } from 'react-hook-form';
import { Checkbox } from '../../checkbox';

export const CheckboxSingle: React.SFC<CheckboxSingleProps> = (props) => {
  const { name, label, defaultValue, required, methods } = props;

  const { register, unregister, setValue, watch } = methods ? methods : useFormContext();
  const selected = watch(name, defaultValue);

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
    setValue(name, event.target.checked)
  };

  return <div className="form-group">
    <div className="checkbox-group">
      <Checkbox name={name} label={label} onChange={onChange} checked={(selected)}/>
    </div>
  </div>
};


export type CheckboxSingleProps = {
  name: string;
  label: string;
  defaultValue?: boolean;
  required?: boolean;
  methods?: any;
};
