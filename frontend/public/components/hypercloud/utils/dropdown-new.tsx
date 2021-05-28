import * as React from 'react';
import { useFormContext } from 'react-hook-form';
import Select, { components } from 'react-select';
import { CaretDownIcon } from '@patternfly/react-icons';

import { ResourceIcon } from '../../utils';

const { Option, IndicatorsContainer, SingleValue } = components;

const ResourceItem = props => {
  return (
    <Option {...props}>
      <span className={'co-resource-item'}>
        <span className="co-resource-icon--fixed-width">
          <ResourceIcon kind={props.data.kind} />
        </span>
        <span className="co-resource-item__resource-name">
          <span>{props.data.label}</span>
        </span>
      </span>
    </Option>
  );
};

const TextItem = props => {
  return (
    <Option {...props}>
      <span className={'co-resource-item'}>
        <span className="co-resource-item__resource-name">
          <span>{props.data.label}</span>
        </span>
      </span>
    </Option>
  );
};

const ArrowContainer = props => {
  return (
    <IndicatorsContainer {...props}>
      <CaretDownIcon className="hc-dropdown-select_toggle-icon" />
    </IndicatorsContainer>
  );
};

const ResourceSingleValue = props => {
  return (
    <SingleValue {...props}>
      <span className={'co-resource-item'}>
        <span className="co-resource-icon--fixed-width">
          <ResourceIcon kind={props.data.kind} />
        </span>
        <span className="co-resource-item__resource-name">
          <span>{props.data.label}</span>
        </span>
      </span>
    </SingleValue>
  );
};

const TextSingleValue = props => {
  return <SingleValue {...props} />;
};
export const DropdownWithRef = React.forwardRef<HTMLInputElement, DropdownWithRefProps>((props, ref) => {
  const { name, defaultValue, methods, items, useResourceItemsFormatter, kind, width } = props;
  const { setValue } = methods ? methods : useFormContext();

  const [selected, setSelected] = React.useState(defaultValue);

  const handleChange = (value, action, setStateFunction, childSelect = null) => {
    const inputRef = action.name;
    setValue(inputRef, value);
    setStateFunction(value);
  };

  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      borderRadius: 0,
      borderColor: '#ededed',
      borderBottomColor: '#8a8d90',
      cursor: 'pointer',
      '&:hover': { borderBottomColor: '#06c' },
      boxShadow: 'none',
      minHeight: '33px',
    }),
    singleValue: (provided, state) => {
      const opacity = state.isDisabled ? 0.5 : 1;
      const transition = 'opacity 300ms';

      return { ...provided, opacity, transition };
    },
    option: (styles, { data, isDisabled, isFocused, isSelected }) => {
      return {
        ...styles,
        ':active': {
          ...styles[':active'],
          backgroundColor: isSelected ? '#2684ff' : 'trasparent',
        },
      };
    },
    menu: provided => ({
      ...provided,
      marginTop: 0,
    }),
    container: (provided, state) => {
      return { ...provided, width: width || '200px' };
    },
  };

  let formattedOptions = [];
  if (useResourceItemsFormatter && Array.isArray(items)) {
    formattedOptions = items.map(item => {
      return {
        apiVersion: item.apiVersion || '',
        kind: item.kind || kind || '',
        label: item.spec?.externalName || item.metadata?.name || '',
        value: item.metadata?.name || item.metadata?.uid || '',
      };
    });
  }

  let options = items;
  if (!Array.isArray(items)) {
    options = [];
    for (const key in items) {
      options.push({
        value: key,
        label: items[key],
      });
    }
  }

  return (
    <Select
      name={name}
      styles={customStyles}
      value={selected || defaultValue}
      options={useResourceItemsFormatter ? formattedOptions : options}
      components={{
        Option: useResourceItemsFormatter ? ResourceItem : TextItem,
        IndicatorSeparator: () => null,
        IndicatorsContainer: ArrowContainer,
        SingleValue: useResourceItemsFormatter ? ResourceSingleValue : TextSingleValue,
      }}
      ref={ref}
      onChange={(value, action) => {
        handleChange(value, action, setSelected, 'subtype');
      }}
      classNamePrefix="hc-select"
      isSearchable={false}
    />
  );
});

type DropdownWithRefProps = {
  id?: string;
  name: string;
  defaultValue?: any;
  methods?: any;
  items?: any;
  useResourceItemsFormatter?: boolean;
  kind?: string;
  width?: string;
};
