import * as React from 'react';
import { useFormContext } from 'react-hook-form';
import * as _ from 'lodash-es';
import Select, { components } from 'react-select';
import { CaretDownIcon } from '@patternfly/react-icons';
import { Firehose, FirehoseResult, FirehoseResource } from '@console/internal/components/utils';

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

/**
 * 기본형태의 드롭다운 컴포넌트이다.
 * @prop {string} name - hook form에 등록할 드롭다운의 name. Controller로 감싸서 사용할 때 Controller에 지정한 name과 같은 값이어야 한다.
 * @prop {string} kind - useResourceItemsFormatter를 true로 지정할 경우 드롭다운 item에 리소스아이콘이 표시 되는데, k8s 리소스리스트에 kind정보가 없을 경우 아이콘이 표시되지 않는다. 이럴 때 대체로 넣어줄 kind 값.
 * @prop {string} width - 드롭다운의 width 값.
 * @prop {boolean} useResourceItemsFormatter - k8s서비스콜을 통해 받아온 리소스리스트에서 필요한 정보를 사용해 {apiVersion, kind, label, value} 형태의 item으로 이루어진 드롭다운을 만들어주는 formatter 사용여부를 결정하는 값. 리소스 kind아이콘이 표시된 형태의 드롭다운을 만들어준다. 해당 옵션을 사용하려면 items props로 k8sList콜을 통해 가져온 리소스리스트를 넣어주어야 한다.
 * @prop {any} defaultValue - 드롭다운의 기본 선택값을 지정해주는 속성. {lable: 'AAA', value: 'aaa'} 형태로 설정해줘야 한다. (Controller로 감싸서 ListView컴포넌트 안에 사용 시 Controller의 defaultValue속성에도 같은 값을 지정해줘야 한다)
 * @prop {any | any[]} items - 옛버전의 dropdown에서 object로 사용해서 object도 받을 수 있게 처리해놓았으나, object[] 형태의 사용을 권장함. (예: [{lable: 'AAA', value: 'aaa'}, {label: 'BBB', value: 'bbb'}])
 * @prop {FirehoseResult[]} resources - Firehose 결과값을 받아오기 위한 속성으로, 컴포넌트 사용자를 위해 만든 속성은 아니다.
 */
export const DropdownWithRef = React.forwardRef<HTMLInputElement, DropdownWithRefProps>((props, ref) => {
  const { name, defaultValue, methods, items, resources: resourcesResult, useResourceItemsFormatter, kind, width, placeholder } = props;
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
  if (useResourceItemsFormatter) {
    // MEMO : Firehose로 들어온 resources값이 있으면 items속성보다 우선으로 받음.
    if (!!resourcesResult) {
      _.each(resourcesResult, resource => {
        if (resource.loaded) {
          _.each(resource.data, item => {
            const kindValue = item.kind || kind || '';
            const label = item.spec?.externalName || item.metadata?.name || '';
            const value = item.metadata?.name || '';
            formattedOptions.push({
              apiVersion: item.apiVersion || '',
              kind: kindValue,
              label: label,
              value: value,
            });
          });
        }
      });
    } else if (Array.isArray(items)) {
      formattedOptions = items.map(item => {
        const kindValue = item.kind || kind || '';
        const label = item.spec?.externalName || item.metadata?.name || '';
        const value = item.metadata?.name || '';
        return {
          apiVersion: item.apiVersion || '',
          kind: kindValue,
          label: label,
          value: value,
        };
      });
    }
  } else {
    // MEMO : 옛버전의 dropdown공통컴포넌트 사용 시 {[value1]: [label1], [value2]: [label2]} 형식으로 items값을 지정해주고있어서 예전 dropdown을 DropdownWithRef로 대체했을 때 동작하게하기 위해
    // 그렇게 들어왔을 때에도 object형태의 item으로 바꿔주기 위해 추가한 부분.
    // ***** 이후 DropdownWithRef컴포넌트를 새로 사용하는 상황이라면 items 형태는 object들로 이루어진 Array로 지정해주는 것을 권장함! *****

    if (!Array.isArray(items)) {
      formattedOptions = [];
      for (const key in items) {
        formattedOptions.push({
          value: key,
          label: items[key],
        });
      }
    } else {
      formattedOptions = items;
    }
  }

  return (
    <Select
      name={name}
      styles={customStyles}
      value={selected || defaultValue}
      options={formattedOptions}
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
      placeholder={placeholder}
    />
  );
});

/**
 * Firehose로 리소스리스트를 불러올 수 있는 기본형태의 드롭다운 컴포넌트이다.
 * @prop {FirehoseResource[]} resourcesConfig - 불러올 리소스 리스트에 대한 설정값. Firehose의 resources props와 동일한 형태로 넣어주면 된다. 리스트형태로 받아와야 하기 때문에 isList: true 값을 필수로 넣어줘야 한다. (예: [{kind: 'Pod', namespace: 'default', isList: true, prop: 'pod'}])
 * @prop {string} name - hook form에 등록할 드롭다운의 name. Controller로 감싸서 사용할 때 Controller에 지정한 name과 같은 값이어야 한다.
 * @prop {string} kind - useResourceItemsFormatter를 true로 지정할 경우 드롭다운 item에 리소스아이콘이 표시 되는데, k8s 리소스리스트에 kind정보가 없을 경우 아이콘이 표시되지 않는다. 이럴 때 대체로 넣어줄 kind 값.
 * @prop {string} width - 드롭다운의 width 값.
 * @prop {any} defaultValue - 드롭다운의 기본 선택값을 지정해주는 속성. {lable: 'AAA', value: 'aaa'} 형태로 설정해줘야 한다. (Controller로 감싸서 ListView컴포넌트 안에 사용 시 Controller의 defaultValue속성에도 같은 값을 지정해줘야 한다)
 * @prop {boolean} useResourceItemsFormatter - DropdownFirehose컴포넌트에선 미사용. (설정해도 적용 되지 않음)
 * @prop {any | any[]} items - DropdownFirehose컴포넌트에선 미사용. (설정해도 적용 되지 않음)
 */
export const DropdownFirehose = React.forwardRef<HTMLInputElement, DropdownFirehoseProps>((props, ref) => {
  return (
    <Firehose resources={props.resourcesConfig}>
      <DropdownWithRef {...props} useResourceItemsFormatter={true} ref={ref} />
    </Firehose>
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
  resources?: FirehoseResult[];
  placeholder?: string;
};

type DropdownFirehoseProps = {
  resourcesConfig: FirehoseResource[];
} & DropdownWithRefProps;
