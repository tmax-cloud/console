import * as React from 'react';
import * as _ from 'lodash';
import { Dropdown } from '@console/internal/components/utils';
import { JSONSchema7 } from 'json-schema';
// import { useTranslation } from 'react-i18next';

export const OneOfFields: React.FC<OneOfFieldsProps> = props => {
  const { uid, formData, onChange, schema } = props;
  let items = {};
  const defaultValue = typeof formData === 'undefined' ? schema.oneOf[0]?.['title'] : typeof formData === 'string' ? 'string' : schema.oneOf[1]?.['title'];
  schema.oneOf.forEach((cur: any) => {
    if ('title' in cur) {
      if (typeof cur['type'] === 'string') {
        items[cur['title']] = _.startCase(cur['type']);
      } else {
        items[cur['title']] = _.startCase(cur['type'][0]);
      }
    }
    // description 추가한다고 하면 items안에 객체형식으로 해야할듯
  });

  const [type, setType] = React.useState(defaultValue);
  React.useEffect(() => {
    setType(defaultValue);
  }, []);
  return (
    <>
      <div className="key-operator-value__row">
        <Dropdown id={uid} key={uid} selectedKey={type} items={items ?? {}} onChange={setType} />
      </div>
      <label className={'control-label '}>{type}</label>
      <div className="">{items[type] === 'String' ? <input className="pf-c-form-control" id={uid} key={uid} onChange={({ currentTarget }) => onChange(currentTarget.value)} value={formData} type="text" /> : <input className="pf-c-form-control" id={uid} key={uid} onChange={({ currentTarget }) => onChange(currentTarget.value !== '' ? _.toNumber(currentTarget.value) : '')} value={formData} type="number" />}</div>{' '}
    </>
  );
};

export type OneOfFieldsProps = {
  formData: any;
  onChange?: ({}) => void;
  onBlur?: ({}) => void;
  uid?: string;
  schema?: JSONSchema7;
};
