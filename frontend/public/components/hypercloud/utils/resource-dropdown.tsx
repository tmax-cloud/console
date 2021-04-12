import * as _ from 'lodash-es';
import * as React from 'react';
import * as classNames from 'classnames';
import { ResourceName } from '../../utils/resource-icon';
import { Firehose, FirehoseResult, FirehoseResource, LoadingInline } from '@console/internal/components/utils';
import { Dropdown } from './dropdown';

const ResourceDropdownInner: React.FC<ResourceDropdownInnerProps> = (props) => {
  const getItems = (resources) => {
    const items = {};
    _.each(resources, (resource, k) => {
      if (resource.loaded) {
        const kind = resource.data.kind.replace(/(List$)/g, ''); // TODO: 다른 방법...
        _.each(
          resource.data.items,
          ({ metadata }) => {
            const id = metadata.name;
            items[id] = (
              <span className={'hc-resource-item'}>
                <ResourceName name={metadata.name} kind={kind} />
              </span>)
          }
        );
      }
    })
    return items;
  };

  //const [title, setTitle] = React.useState(props.loaded ? props.placeholder : <LoadingInline />);
  const [rows, setRows] = React.useState(props.loaded ? getItems(props.resources) : {});


  React.useEffect(() => {
    if (props.loaded) {
      //setTitle(props.placeholder);
      setRows(getItems(props.resources));
    }
  }, [props.loaded]);

  return (
    <Dropdown
      name={props.name}
      items={rows}
      title={props.loaded && !_.isEmpty(rows) ?
        props.placeholder : <LoadingInline />}
      className={classNames('hc-resource-dropdown-wrapper', props.className)}
      dropDownClassName={classNames('hc-resource-dropdown', props.dropDownClassName)}
      menuClassName={classNames('hc-resource-dropdown-menu', props.menuClassName)}
      buttonClassName={classNames('hc-resource-dropdown-button', props.buttonClassName)}
    />
  )
}

type ResourceDropdownInnerProps = {
  name: string;
  kinds: string[];
  type?: string;
  loaded?: boolean;
  placeholder?: string;
  resources?: FirehoseResult[];
  className?: string;
  dropDownClassName?: string;
  menuClassName?: string;
  buttonClassName?: string;
}

export const ResourceDropdown: React.FC<ResourceDropdownProps> = ({ name, resources, ...props }) => {
  return (
    <Firehose resources={resources}>
      <ResourceDropdownInner
        name={name}
        kinds={resources.map(res => res.kind)}
        {...props}
      />
    </Firehose>
  )
}

type ResourceDropdownProps = {
  name: string;
  type?: string;
  placeholder?: string;
  resources: FirehoseResource[];
  className?: string;
  dropDownClassName?: string;
  menuClassName?: string;
  buttonClassName?: string;
}
