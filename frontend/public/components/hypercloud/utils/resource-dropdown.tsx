import * as _ from 'lodash-es';
import * as React from 'react';
import { Firehose, FirehoseResult, FirehoseResource, LoadingInline } from '@console/internal/components/utils';
import { ResourceListDropdown, SingleResourceDropdownProps, MultipleResourceDropdownProps } from './resource-list-dropdown';

const ResourceDropdownWrapper_: React.FC<ResourceDropdownWrapperProps> = (props) => {
  const getItems = (resources) => {
    const items = [];
    _.each(resources, (resource, k) => {
      if (resource.loaded) {
        const kind = resource.kind;
        _.each(
          resource.data,
          (item) => {
            item.kind = kind;
            items.push(item);
          }
        );
      }
    })
    return items;
  };

  //const [title, setTitle] = React.useState(props.loaded ? props.placeholder : <LoadingInline />);
  const [rows, setRows] = React.useState(props.loaded ? getItems(props.resources) : []);

  React.useEffect(() => {
    if (props.loaded) {
      //setTitle(props.placeholder);
      setRows(getItems(props.resources));
    }
  }, [props.loaded]);

  return (
    <ResourceListDropdown
      {...props}
      title={!props.loaded ? <LoadingInline /> : props.title}
      resourceList={rows} // 필수
      autocompletePlaceholder="search by name"
    />
  )
}

type ResourceDropdownWrapperProps = (SingleResourceDropdownProps | MultipleResourceDropdownProps) & {
  loaded?: boolean;
  resources?: FirehoseResult[];
}

export const ResourceDropdown: React.FC<ResourceDropdownProps> = ({ resources, ...props }) => {
  resources.map((resource)=>Object.assign(resource, {isList: true}));
  return (
    <Firehose resources={resources}>
      <ResourceDropdownWrapper_ {...props} />
    </Firehose>
  )
}

type ResourceDropdownProps = (SingleResourceDropdownProps | MultipleResourceDropdownProps) & {
  resources: FirehoseResource[];
}