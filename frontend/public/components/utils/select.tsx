import React from 'react';
import Select from 'react-select';

type OptionType = {
  value: string;
  label: string;
};

type SingleSelectProps = {
  name: string;
  options: OptionType[];
  value: string;
  className?: string;
  id?: string;
  onChange: () => {};
};

const SingleSelect = ({ options, name, value, id, onChange }: SingleSelectProps) => {
  const newValue = value ? { value, label: value } : options[0];
  const colorStyles = {
    control: styles => ({ ...styles, backgroundColor: 'white', borderRadius: 0, height: '27px', minHeight: '27px' }),
  };

  return (
    <React.Fragment>
      <Select
        className="basic-single"
        classNamePrefix="select"
        id={id}
        value={newValue}
        name={name}
        options={options}
        onChange={onChange}
        styles={colorStyles}
        isSearchable={false}
      />
    </React.Fragment>
  )
};

export default SingleSelect;
