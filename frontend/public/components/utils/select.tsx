import React from 'react';
import Select from 'react-select';

type OptionType = {
  value: string;
  label: string;
};

type SingleSelectProps = {
  name: string;
  options: OptionType[];
  value?: string;
  placeholder?: string;
  className?: string;
  id?: string;
  onChange: () => {};
  onBlur: () => {};
};

const SingleSelect = ({ options, name, id, value, placeholder, onChange, onBlur }: SingleSelectProps) => {
  let newValue;
  const idx = options.findIndex(option => option.value === value);
  if (idx !== -1) {
    newValue = {
      value: options[idx].value,
      label: options[idx].label,
    };
  } else {
    newValue = placeholder ? undefined : options.length > 0 && options[0];
  }

  const colorStyles = {
    control: styles => ({ ...styles, backgroundColor: 'white', borderRadius: 0, height: '27px', minHeight: '27px' }),
  };

  return (
    <React.Fragment>
      <Select className="basic-single" classNamePrefix="select" value={newValue} id={id} placeholder={placeholder} name={name} options={options} onChange={onChange} onBlur={onBlur} styles={colorStyles} isSearchable={false} />
    </React.Fragment>
  );
};

export default SingleSelect;
