import * as React from 'react';
import * as _ from 'lodash';
import { MinusCircleIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { Button } from '@patternfly/react-core';

const AdditionalProperty: React.FC<AdditionalPropertyProps> = ({ property, onChange = () => {}, onClickRemove = () => {} }) => {
  let key = '';
  let value = '';
  for (let propertyKey in property) {
    key = propertyKey;
    value = property[propertyKey];
  }
  return (
    <div className="row key-operator-value__row">
      <div className="col-md-4 col-xs-5 key-operator-value__name-field">
        <div className="key-operator-value__heading hidden-md hidden-lg text-secondary text-uppercase">Key</div>
        <input type="text" className="pf-c-form-control" value={key} onChange={e => onChange({ [e.target.value]: value })} />
      </div>
      <div className="col-md-3 col-xs-5 key-operator-value__value-field key-operator-value__value-field--stacked">
        <div className="key-operator-value__heading hidden-md hidden-lg text-secondary text-uppercase">Value</div>
        <input className="pf-c-form-control" type="text" value={value} onChange={e => onChange({ [key]: e?.target?.value })} />
      </div>
      <div className="col-xs-1 key-operator-value__action key-operator-value__action--stacked">
        <div className="key-operator-value__heading key-operator-value__heading-button hidden-md hidden-lg" />
        <Button type="button" onClick={onClickRemove} aria-label="Delete" className="key-operator-value__delete-button" variant="plain">
          <MinusCircleIcon />
        </Button>
      </div>
    </div>
  );
};

export const AdditionalPropertyFields: React.FC<AdditionalPropertyFieldsProps> = ({
  formData,
  onChange = () => {}, // Default to noop
  uid = '',
}) => {
  const items = Array.isArray(formData) ? formData : _.keys(formData).map(cur => ({ [cur]: formData[cur] }));

  const updateProperty = (index: number, newProperty: any): void => {
    let obj = {};
    items.forEach((cur, i) => {
      if (i === index) {
        // 여기서 key값이 변경됬는지 value값이 변경됬는지
        if (obj[Object.keys(cur)[0]] === Object.keys(newProperty)[0]) {
          obj[Object.keys(newProperty)[0]] = Object.values(cur)[0]; // key 바뀐거
        } else {
          obj[Object.keys(cur)[0]] = Object.values(newProperty)[0]; // value 바뀐거
        }
      } else {
        obj[Object.keys(cur)[0]] = Object.values(cur)[0];
      }
    });
    onChange(obj);
  };

  const removeProperty = (index: number): void => {
    let obj = {};
    items.forEach((cur, i) => {
      if (i !== index) {
        obj[Object.keys(cur)[0]] = Object.values(cur)[0];
      }
    });
    onChange(obj);
  };

  const addProperty = (): void => {
    let obj = {};
    items.forEach((cur, i) => {
      obj[Object.keys(cur)[0]] = Object.values(cur)[0];
    });
    onChange({ ...obj, [`defaultKey_${items.length}`]: `defaultValue_${items.length}` }); // object값이라서 중복되는(빈 스트링인) key값이 여러개이면 안됨.
  };

  return (
    <>
      <div className="row key-operator-value__heading hidden-sm hidden-xs">
        <div className="col-md-4 text-secondary text-uppercase">Key</div>
        <div className="col-md-3 text-secondary text-uppercase">Value</div>
      </div>
      {items.map((property, index) => (
        // Have to use array index in the key bc any other unique id whould have to use editable fields.
        <AdditionalProperty
          // eslint-disable-next-line react/no-array-index-key
          key={`${uid}-property-${index}`}
          property={property}
          onClickRemove={() => removeProperty(index)}
          onChange={newProperty => updateProperty(index, newProperty)}
        />
      ))}
      <div className="row">
        <Button type="button" onClick={addProperty} variant="link">
          <PlusCircleIcon className="co-icon-space-r" />
          Add More
        </Button>
      </div>
    </>
  );
};

export type AdditionalPropertyFieldsProps = {
  formData: any;
  onChange?: ({}) => void;
  uid?: string;
};

export type AdditionalPropertyProps = {
  property: any;
  onChange?: ({}) => void;
  onClickRemove?: () => void;
};
