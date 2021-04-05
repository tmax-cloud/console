import * as _ from 'lodash-es';
import * as React from 'react';
import { useFormContext } from 'react-hook-form';

export const TextInput: React.FC<TextInputProps> = ({ id, methods, inputClassName, defaultValue }) => {
  const { register } = methods ? methods : useFormContext();
  return <input className={inputClassName} defaultValue={defaultValue} name={id} ref={register}></input>;
};

type TextInputProps = {
  id: string;
  methods?: any;
  inputClassName?: string;
  defaultValue?: string;
} & React.HTMLProps<HTMLInputElement>;
