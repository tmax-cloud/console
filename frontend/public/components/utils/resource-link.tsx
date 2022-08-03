import * as _ from 'lodash-es';
import * as React from 'react';
import { Link } from 'react-router-dom';
import * as classNames from 'classnames';

import { FLAGS } from '@console/shared/src/constants';
import { ResourceIcon } from './resource-icon';
import { modelFor, referenceForModel, K8sKind, K8sResourceKindReference, K8sResourceKind } from '../../module/k8s';
import { connectToModel } from '../../kinds';
import { connectToFlags, FlagsObject } from '../../reducers/features';
import { getQueryArgument } from '@console/internal/components/utils';

const unknownKinds = new Set();

export const resourcePathFromModel = (model: K8sKind, name?: string, namespace?: string) => {
  const { plural, namespaced, crd } = model;

  let url = '/k8s/';

  if (!namespaced) {
    url += 'cluster/';
  }

  if (namespaced) {
    url += namespace ? `ns/${namespace}/` : 'all-namespaces/';
  }

  if (crd) {
    url += referenceForModel(model);
  } else if (plural) {
    url += plural;
  }

  if (name) {
    // Some resources have a name that needs to be encoded. For instance,
    // Users can have special characters in the name like `#`.
    url += `/${encodeURIComponent(name)}`;
  }

  return url;
};

export const resourceListPathFromModel = (model: K8sKind, namespace: string) => resourcePathFromModel(model, null, namespace);

/**
 * NOTE: This will not work for runtime-defined resources. Use a `connect`-ed component like `ResourceLink` instead.
 */
export const resourcePath = (kind: K8sResourceKindReference, name?: string, namespace?: string) => {
  const model = modelFor(kind);
  if (!model) {
    if (!unknownKinds.has(kind)) {
      unknownKinds.add(kind);
      // eslint-disable-next-line no-console
      console.error(`resourcePath: no model for "${kind}"`);
    }
    return;
  }

  return resourcePathFromModel(model, name, namespace);
};

export const resourceObjPath = (obj: K8sResourceKind, kind: K8sResourceKindReference) => resourcePath(kind, _.get(obj, 'metadata.name'), _.get(obj, 'metadata.namespace'));

export const ResourceLink = connectToModel(({ className, displayName, inline = false, kind, linkTo = true, name, namespace, hideIcon, title, children }) => {
  const query = getQueryArgument('name');

  if (!kind) {
    return null;
  }
  const path = resourcePath(kind, name, namespace);
  const value = displayName ? displayName : name;
  const classes = classNames('co-resource-item', className, {
    'co-resource-item--inline': inline,
  });

  return (
    <span className={classes}>
      {!hideIcon && <ResourceIcon kind={kind} />}
      {path && linkTo ? (
        <Link to={path} title={title} className="co-resource-item__resource-name" data-test-id={value}>
          {query ? <ColoredValue query={query} value={value} /> : value}
        </Link>
      ) : (
        <span className="co-resource-item__resource-name" data-test-id={value}>
          {query ? <ColoredValue query={query} value={value} /> : value}
        </span>
      )}
      {children}
    </span>
  );
});

const NodeLink_: React.FC<NodeLinkProps> = props => {
  const { name, flags } = props;
  if (!name) {
    return <>-</>;
  }
  return flags[FLAGS.CAN_LIST_NODE] ? <ResourceLink kind="Node" name={name} title={name} /> : <span className="co-break-word">{name}</span>;
};

export const NodeLink = connectToFlags<NodeLinkProps>(FLAGS.CAN_LIST_NODE)(NodeLink_);

type NodeLinkProps = {
  name: string;
  flags: FlagsObject;
};

export const ColoredValue: React.FC<ColeredValueProps> = props => {
  const { query, value } = props;
  const coleredValue = value.split(query).map((subString, index) => {
    return index === 0 ? (
      <span>{subString}</span>
    ) : (
      <>
        <span style={{ backgroundColor: 'yellow' }}>{query}</span>
        <span>{subString}</span>
      </>
    );
  });
  return (
    <>
      {coleredValue}
      {/* {value.split(query)[0]}
      {value.length !== value.split(query)[0].length && <span style={{ backgroundColor: 'yellow' }}>{query}</span>}
      {value.split(query)[1]} */}
    </>
  );
};
type ColeredValueProps = {
  query?: string;
  value?: string;
};

ResourceLink.displayName = 'ResourceLink';
