import * as _ from 'lodash-es';
import * as React from 'react';
import * as classNames from 'classnames';
import { useFormContext } from 'react-hook-form';

export const TextInput: React.FC<TextInputProps> = ({ id, methods, inputClassName, defaultValue, placeholder, type, isDisabled = false, valid = true }) => {
  const { register } = methods ? methods : useFormContext();
  return <input className={classNames(inputClassName, { ['error-text']: !valid })} placeholder={placeholder} defaultValue={defaultValue} name={id} ref={register()} disabled={isDisabled} type={type}></input>;
};

type TextInputProps = {
  id: string;
  methods?: any;
  inputClassName?: string;
  defaultValue?: string;
  placeholder?: string;
  type?: string;
  valid?: boolean;
  isDisabled?: boolean;
} & React.HTMLProps<HTMLInputElement>;
