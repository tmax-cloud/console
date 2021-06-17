import * as React from 'react';
import * as _ from 'lodash';
import { Dropdown } from '@console/internal/components/utils';
import { JSONSchema6 } from 'json-schema';
// import { useTranslation } from 'react-i18next';

export const OneOfFields: React.FC<OneOfFieldsProps> = props => {
  const { uid, formData, onChange, schema } = props;
  let items = { title: {}, description: {} };
  schema.oneOf.forEach(cur => {
    items.title[cur['title']] = _.startCase(cur['title']);
    items.description[cur['description']] = _.startCase(cur['description']);
  });

  const [type, setType] = React.useState('string');
  React.useEffect(() => {
    if (typeof formData === 'string') {
      setType('string');
    } else if (typeof formData !== 'undefined') {
      // string이랑 undefined가 아니면 integer밖에 없음
      setType('integer');
    }
  }, []);
  return (
    <>
      <div className="key-operator-value__row">
        <Dropdown id={uid} key={uid} title={items[type]} selectedKey={type} items={items.title ?? {}} onChange={setType} />
      </div>
      <label className={'control-label '}>{type}</label>
      <div className="">{type === 'string' ? <input className="pf-c-form-control" id={uid} key={uid} onChange={({ currentTarget }) => onChange(currentTarget.value)} value={formData} type="text" /> : <input className="pf-c-form-control" id={uid} key={uid} onChange={({ currentTarget }) => onChange(currentTarget.value !== '' ? _.toNumber(currentTarget.value) : '')} value={formData} type="number" />}</div>{' '}
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
