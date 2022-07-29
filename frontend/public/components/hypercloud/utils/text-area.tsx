import * as _ from 'lodash-es';
import * as React from 'react';
import { useFormContext } from 'react-hook-form';

export const TextArea: React.FC<TextAreaProps> = ({ id, methods, inputClassName, defaultValue, placeholder, type, hidden = false }) => {
  const { register } = methods ? methods : useFormContext();
  return <textarea className={inputClassName} rows={5} cols={100} placeholder={placeholder} defaultValue={defaultValue} name={id} ref={register} hidden={hidden}></textarea>;
};

type TextAreaProps = {
  id: string;
  methods?: any;
  inputClassName?: string;
  defaultValue?: string;
  placeholder?: string;
  type?: string;
} & React.HTMLProps<HTMLInputElement>;
