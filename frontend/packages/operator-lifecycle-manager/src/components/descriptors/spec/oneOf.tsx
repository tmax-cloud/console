import * as React from 'react';
import * as _ from 'lodash';
import { Dropdown } from '@console/internal/components/utils';
import { JSONSchema6 } from 'json-schema';
// import { useTranslation } from 'react-i18next';

export const OneOfFields: React.FC<OneOfFieldsProps> = props => {
  const { uid, formData, onChange } = props;
  enum items {
    string = 'String',
    number = 'Number',
  }
  const [type, setType] = React.useState('string');
  React.useEffect(() => {
    if (typeof formData === 'string') {
      setType('string');
    } else if (typeof formData === 'number') {
      setType('number');
    }
  }, []);
  return (
    <>
      <Dropdown id={uid} key={uid} title={items[type]} selectedKey={items[type]} items={items ?? {}} onChange={setType} />
      {type === 'string' ? <input className="pf-c-form-control" id={uid} key={uid} onChange={({ currentTarget }) => onChange(currentTarget.value)} value={formData} type="text" /> : <input className="pf-c-form-control" id={uid} key={uid} onChange={({ currentTarget }) => onChange(currentTarget.value !== '' ? _.toNumber(currentTarget.value) : '')} value={formData} type="number" />}
    </>
  );
};

export type OneOfFieldsProps = {
  formData: any;
  onChange?: ({}) => void;
  onBlur?: ({}) => void;
  uid?: string;
  schema?: JSONSchema6;
};
