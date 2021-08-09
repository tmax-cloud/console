import * as _ from 'lodash-es';
import * as React from 'react';
import { Firehose, FirehoseResult, FirehoseResource, LoadingInline } from '@console/internal/components/utils';
import { ResourceListDropdown, SingleResourceDropdownProps, MultipleResourceDropdownProps } from './resource-list-dropdown';
import { useTranslation } from 'react-i18next';

const ResourceDropdownWrapper_: React.FC<ResourceDropdownWrapperProps> = props => {
  const { t } = useTranslation();
  const getItems = resources => {
    const items = [];
    _.each(resources, (resource, k) => {
      if (resource.loaded) {
        const kind = resource.kind;
        _.each(resource.data, item => {
          item.kind = kind;
          items.push(item);
        });
      }
    });
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
      autocompletePlaceholder={t('COMMON:MSG_COMMON_BUTTON_FILTER_PLACEHOLDER_1')}
    />
  );
};

type ResourceDropdownWrapperProps = (SingleResourceDropdownProps | MultipleResourceDropdownProps) & {
  loaded?: boolean;
  resources?: FirehoseResult[];
};

const ResourceDropdown_: React.FC<ResourceDropdownProps> = ({ resources, ...props }) => {
  const resourcesWithIsListProp = resources.map(resource => {
    return { ...resource, isList: true };
  });
  return (
    <Firehose resources={resourcesWithIsListProp}>
      <ResourceDropdownWrapper_ {...props} />
    </Firehose>
  );
};

function areEqual(prevProps, nextProps) {
  // MEMO : methods와 idFunc 속성은 매번 다르게 인식돼서 memo비교문에서 제거함
  return _.isEqual(_.omit(prevProps, ['methods', 'idFunc', 'onChange']), _.omit(nextProps, ['methods', 'idFunc', 'onChange']));
}

export const ResourceDropdown = React.memo(ResourceDropdown_, areEqual);

export type ResourceDropdownProps = (SingleResourceDropdownProps | MultipleResourceDropdownProps) & {
  resources: FirehoseResource[];
};
