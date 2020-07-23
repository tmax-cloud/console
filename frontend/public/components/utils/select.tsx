import React from 'react';
import Select from 'react-select';

type OptionType = {
  value: string;
  label: string;
};

type SingleSelectProps = {
  name: string;
  options: OptionType[];
  label?: string;
  value?: string;
  placeholder?: string;
  className?: string;
  id?: string;
  onChange: () => {};
};

const SingleSelect = ({ options, name, id, value, placeholder, label, onChange }: SingleSelectProps) => {
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
      <Select className="basic-single" classNamePrefix="select" value={newValue} id={id} placeholder={placeholder} name={name} options={options} onChange={onChange} styles={colorStyles} isSearchable={false} />
    </React.Fragment>
  );
};

export default SingleSelect;
