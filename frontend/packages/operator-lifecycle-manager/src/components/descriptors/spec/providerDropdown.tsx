import * as React from 'react';
import * as _ from 'lodash';
import { Dropdown } from '@console/internal/components/utils';
import { JSONSchema6 } from 'json-schema';

export const ProviderDropdownFields: React.FC<ProviderDropdownFieldsProps> = props => {
  const { id, formData, items, onChange } = props;
  const [value, setValue] = React.useState(formData);
  React.useEffect(() => {
    Object.keys(items)?.forEach(key => {
      // MEMO : provider에 대한 spec필드의 이름이 'provider[이름]Spec'으로 규칙 통일된다는 가정 하에 작성함. (서버담당자분께 확인 받음)
      const elementId = `root_spec_provider${_.capitalize(key)}Spec_field-group`;
      if (key === formData) {
        const el = document.getElementById(elementId);
        if (!!el) {
          el.style.display = 'flex';
        }
      } else {
        const el = document.getElementById(elementId);
        if (!!el) {
          el.style.display = 'none';
        }
      }
    });
  }, []);
  const onProviderChange = value => {
    Object.keys(items)?.forEach(key => {
      const elementId = `root_spec_provider${_.capitalize(key)}Spec_field-group`;
      if (key === value) {
        const el = document.getElementById(elementId);
        if (!!el) {
          el.style.display = 'flex';
        }
      } else {
        const el = document.getElementById(elementId);
        if (!!el) {
          el.style.display = 'none';
        }
      }
    });
    setValue(value);
    onChange(value);
  };
  return <Dropdown id={id} key={id} selectedKey={value} title="Select Provider" items={items} onChange={onProviderChange} />;
};

type ProviderDropdownFieldsProps = {
  formData: any;
  items: any;
  id: string;
  onChange: any;
  schema?: JSONSchema6;
};
