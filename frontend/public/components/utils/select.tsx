import React from 'react';
import Select from 'react-select';

type OptionType = {
  value: string;
  label: string;
};

type SingleSelectProps = {
  name: string;
  options: OptionType[];
  placeholder?: string;
  className?: string;
  id?: string;
  onChange: () => {};
};

const SingleSelect = ({ options, name, id, placeholder, onChange }: SingleSelectProps) => {
  const colorStyles = {
    control: styles => ({ ...styles, backgroundColor: 'white', borderRadius: 0, height: '27px', minHeight: '27px' }),
  };

  return (
    <React.Fragment>
      <Select className="basic-single" classNamePrefix="select" id={id} placeholder={placeholder} name={name} options={options} onChange={onChange} styles={colorStyles} isSearchable={false} />
    </React.Fragment>
  );
};

export default SingleSelect;
