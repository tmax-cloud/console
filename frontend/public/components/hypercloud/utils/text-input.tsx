import * as _ from 'lodash-es';
import * as React from 'react';
import { useFormContext } from 'react-hook-form';

export const TextInput: React.FC<TextInputProps> = ({ id, methods, inputClassName, defaultValue, placeholder, type }) => {
  const { register } = methods ? methods : useFormContext();
  return <input className="inputClassName" placeholder={placeholder} defaultValue={defaultValue} name={id} ref={register()} type={type}></input>;
};

type TextInputProps = {
  id: string;
  methods?: any;
  inputClassName?: string;
  defaultValue?: string;
  placeholder?: string;
  type?: string;
} & React.HTMLProps<HTMLInputElement>;
