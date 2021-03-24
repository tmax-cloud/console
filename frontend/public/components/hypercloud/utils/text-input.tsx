import * as _ from 'lodash-es';
import * as React from 'react';
import { useFormContext } from 'react-hook-form';

export const TextInput: React.FC<TextInputProps> = ({ id, methods }) => {
  const { register } = methods ? methods : useFormContext();
  return <input name={id} ref={register}></input>;
};

type TextInputProps = {
  id: string;
  methods?: any;
} & React.HTMLProps<HTMLInputElement>;
