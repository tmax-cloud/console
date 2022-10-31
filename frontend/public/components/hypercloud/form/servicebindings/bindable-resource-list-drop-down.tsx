import * as _ from 'lodash-es';
import * as React from 'react';
import { Dropdown, ResourceIcon } from '../../../utils';
import { useFormContext, useWatch } from 'react-hook-form';
import { coFetchJSON } from '../../../../co-fetch';
import * as classNames from 'classnames';
import { useEffect } from 'react';
import { OrderedMap } from 'immutable';

export const BindableResourceListDropDown = (props: BindableResourceListDropDownProps) => {
  const { name, required, methods, placeholder, defaultValue, watchedFieldName } = props;
  const { register, unregister, setValue } = methods ? methods : useFormContext();

  React.useEffect(() => {
    register({ name: name }, { required });

    return () => {
      unregister(name);
    };
  }, [name, register, unregister]);

  const [selectedKind, setSelectedKind] = React.useState(defaultValue ?? '');

  const kind: string = watchedFieldName ? useWatch({ control: methods.control, name: watchedFieldName }) : '';
  useEffect(() => {
    setSelectedKind(kind);
  }, [kind]);

  const [bindables, setBindables] = React.useState([]);
  const [items, setItems] = React.useState({});

  React.useEffect(() => {
    const getBindables = async () => {
      const data = await coFetchJSON('api/hypercloud/bindableResources');
      const keys = Object.keys(data);
      setBindables(keys);
    };
    getBindables();
  }, []);

  React.useEffect(() => {
    setItems(OrderedMap(_.map(bindables, resource => [resource, <DropdownItem resource={resource} />])).toJS() as { [s: string]: JSX.Element });
  }, [bindables]);

  const onSelectChange = (e: any) => {
    setSelectedKind(e);
    setValue(name, e);
  };

  const isSelected = !!selectedKind;

  return <Dropdown menuClassName="dropdown-menu--text-wrap" className={classNames('co-type-selector')} items={items} title={isSelected ? items[selectedKind] : placeholder} placeholder={placeholder} onChange={onSelectChange} type="single" />;
};

const DropdownItem: React.SFC<DropdownItemProps> = ({ resource }) => (
  <>
    <span className={'co-resource-item'}>
      <span className="co-resource-icon--fixed-width">
        <ResourceIcon kind={resource} />
      </span>
      <span className="co-resource-item__resource-name">
        <span>{resource}</span>
      </span>
    </span>
  </>
);

type BindableResourceListDropDownProps = {
  name: string;
  required?: boolean;
  defaultValue?: string;
  methods?: any;
  placeholder: string;
  watchedFieldName?: string;
};

type DropdownItemProps = {
  resource: string;
};
