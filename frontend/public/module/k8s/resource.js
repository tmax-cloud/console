import * as _ from 'lodash-es';
import { coFetchJSON } from '../../co-fetch';
import { k8sBasePath, multiClusterBasePath } from './k8s';
import { selectorToString } from './selector';
import { WSFactory } from '../ws-factory';
import { PerspectiveType, isSingleClusterPerspective, getSingleClusterFullBasePath } from '@console/internal/hypercloud/perspectives';
import { getActivePerspective, getActiveCluster } from '../../actions/ui';
import { getId, getUserGroup } from '../../hypercloud/auth';
import { resourceSchemaBasedMenuMap } from '../../components/hypercloud/form'


const getDynamicProxyPath = cluster => {
  if (isSingleClusterPerspective()) {
    return `${getSingleClusterFullBasePath()}/api/kubernetes`;
  } else if (cluster) {
    return `${window.SERVER_FLAGS.basePath}api/${cluster}`;
  } else {
    return k8sBasePath;
  }
};

/** @type {(model: K8sKind, cluster?: string, basePath?: string) => string} */
export const getK8sAPIPath = ({ apiGroup = 'core', apiVersion }, cluster, basePath) => {
  const isLegacy = apiGroup === 'core' && apiVersion === 'v1';

  let p = basePath || getDynamicProxyPath(cluster);

  if (isLegacy) {
    p += '/api/';
  } else {
    p += '/apis/';
  }

  if (!isLegacy && apiGroup) {
    p += `${apiGroup}/`;
  }

  p += apiVersion;
  return p;
};

/** @type {(model: K8sKind) => string} */
const getClusterAPIPath = ({ apiGroup = 'core', apiVersion }, cluster) => {
  const isLegacy = apiGroup === 'core' && apiVersion === 'v1';
  let p = multiClusterBasePath;

  if (isSingleClusterPerspective()) {
    p = getSingleClusterFullBasePath();
  } else if (cluster) {
    p = `${window.SERVER_FLAGS.basePath}api/${cluster}`;
  }
  return p;
};

/** @type {(model: GroupVersionKind, options: {ns?: string, name?: string, path?: string, queryParams?: {[k: string]: string}, cluster?: string, basePath?: string, customPath?: string}) => string} */
export const resourceURL = (model, options) => {
  let u;
  let q = '';

  if (options.customPath) {
    u = options.customPath;
  } else {
    u = getK8sAPIPath(model, options.cluster, options.basePath);

    if (options.ns) {
      u += `/namespaces/${options.ns}`;
    }
    u += `/${model.plural}`;
    if (options.name) {
      // Some resources like Users can have special characters in the name.
      u += `/${encodeURIComponent(options.name)}`;
    }
    if (options.path) {
      u += `/${options.path}`;
    }
  }

  if (!_.isEmpty(options.queryParams)) {
    q = _.map(options.queryParams, function (v, k) {
      return `${k}=${v}`;
    });
    u += `${u.indexOf('?') === -1 ? '?' : '&'}${q.join('&')}`;
  }

  return u;
};

export const resourceClusterURL = (model, options) => {
  let q = '';
  let u = getClusterAPIPath(model, options.cluster);

  if (options.ns) {
    u += `/namespaces/${options.ns}`;
  }
  u += `/${model.plural}`;
  if (options.name) {
    // Some resources like Users can have special characters in the name.
    u += `/${encodeURIComponent(options.name)}`;
  }
  if (options.path) {
    u += `/${options.path}`;
  }
  if (!_.isEmpty(options.queryParams)) {
    q = _.map(options.queryParams, function (v, k) {
      return `${k}=${v}`;
    });
    u += `?${q.join('&')}`;

  }

  if (isCluster(model)) {
    return `${u}?userId=${getId()}${getUserGroup()}&accessOnly=false`;
  }
  return `${u}?userId=${getId()}${getUserGroup()}`;
}

export const resourceApprovalURL = (model, options, approval) => {
  return resourceURL(model, options).replace('cicd', 'cicdapi') + `/${approval}`
}

const isCluster = (model) => {
  if (model.kind === 'ClusterManager') {
    return true;
  }
  return false;
}

const isClusterClaim = (model) => {
  if (model.kind === 'ClusterClaim') {
    return true;
  }
  return false;
}

const isNamespace = (model) => {
  return model.kind === 'Namespace';
}

const isNamespaceClaim = (model) => {
  return model.kind === 'NamespaceClaim';
}

const isHelmRelease = (model) => {
  return model.kind === 'HelmRelease';
}

const resourceNamespaceURL = (model, isWS) => {
  if (isSingleClusterPerspective()) {
    // MEMO : 싱글클러스터의 경우 네임스페이스 조회콜은 kubernetes 콜로 보냄
    const plural = isNamespace(model) ? 'namespaces' : 'namespaceclaims';
    return `${getSingleClusterFullBasePath()}/api/kubernetes/api/v1/${plural}`;
  } else {
    const path = isNamespace(model) ? 'namespace' : 'namespaceClaim';
    return `${isWS ? '' : document.location.origin}/api/hypercloud/${isWS ? 'websocket/' : ''}${path}?userId=${getId()}${getUserGroup()}`;
  }
};

export const watchURL = (kind, options) => {
  const opts = options || {};

  opts.queryParams = opts.queryParams || {};
  opts.queryParams.watch = true;
  return resourceURL(kind, opts);
};

export const k8sGet = (kind, name, ns, opts) => coFetchJSON(resourceURL(kind, Object.assign({ ns, name }, opts)));

export const k8sCreate = (kind, data, opts = {}) => {
  // Occassionally, a resource won't have a metadata property.
  // For example: apps.openshift.io/v1 DeploymentRequest
  // https://github.com/openshift/api/blob/master/apps/v1/types.go
  data.metadata = data.metadata || {};

  // Lowercase the resource name
  // https://github.com/kubernetes/kubernetes/blob/HEAD/docs/user-guide/identifiers.md#names
  if (data.metadata.name && _.isString(data.metadata.name) && !data.metadata.generateName) {
    data.metadata.name = data.metadata.name.toLowerCase();
  }

  return coFetchJSON.post(resourceURL(kind, Object.assign({ ns: data.metadata.namespace }, opts)), data);
};

export const k8sCreateUrl = (kind, data, opts = {}) => {
  return coFetchJSON.post(resourceURL(kind, opts), data);
}


export const k8sUpdate = (kind, data, ns, name) => coFetchJSON.put(resourceURL(kind, { ns: ns || data.metadata.namespace, name: name || data.metadata.name }), data);

export const k8sUpdateApproval = (kind, resource, approval, data, method = 'PUT') => {
  const url = resourceApprovalURL(
    kind,
    Object.assign(
      {
        ns: resource.metadata.namespace,
        name: resource.metadata.name,
      },
    ),
    approval,
  );

  switch (method) {
    case 'PATCH': {
      return coFetchJSON.patch(url, data);
    }
    default: {
      return coFetchJSON.put(url, data);
    }
  }
}

export const k8sUpdateClaim = (kind, clusterClaim, admit, reason = '', nameSpace) => {

  const resourceClusterURL = `api/multi-hypercloud/namespaces/${nameSpace}/clusterclaims/${clusterClaim}?userId=${getId()}${getUserGroup()}`;

  const params = new URLSearchParams();
  const queryParams = { admit: admit.toString(), reason, memberName: 'cho' };
  _.each(queryParams, (value, key) => value && params.append(key, value.toString()));

  const url = `${resourceClusterURL}&${params.toString()}`;

  return coFetchJSON.put(url);
}

export const k8sPatch = (kind, resource, data, opts = {}) => {
  const patches = _.compact(data);

  if (_.isEmpty(patches)) {
    return Promise.resolve(resource);
  }

  return coFetchJSON.patch(
    resourceURL(
      kind,
      Object.assign(
        {
          ns: resource.metadata.namespace,
          name: resource.metadata.name,
        },
        opts,
      ),
    ),
    patches,
  );
};

export const k8sCreateSchema = (kind) => {
  const directory = resourceSchemaBasedMenuMap.get(kind)?.['directory'];
  const file = resourceSchemaBasedMenuMap.get(kind)?.['file'];
  const schemaUrl = `/api/resource/${directory}/${file}`;
  return coFetchJSON(`${schemaUrl}`, 'GET');
}

export const k8sPatchByName = (kind, name, namespace, data, opts = {}) => k8sPatch(kind, { metadata: { name, namespace } }, data, opts);

export const k8sKill = (kind, resource, opts = {}, json = null) => coFetchJSON.delete(resourceURL(kind, Object.assign({ ns: resource.metadata.namespace, name: resource.metadata.name }, opts)), opts, json);

export const k8sKillByName = (kind, name, namespace, opts = {}) => k8sKill(kind, { metadata: { name, namespace } }, opts);

export const k8sList = (kind, params = {}, raw = false, options = {}) => {
  const query = _.map(_.omit(params, 'ns'), (v, k) => {
    if (k === 'labelSelector') {
      v = selectorToString(v);
    }
    return `${encodeURIComponent(k)}=${encodeURIComponent(v)}`;
  }).join('&');

  let isMultiCluster = isCluster(kind) || isClusterClaim(kind);
  const _isNamespace = false
  // const _isNamespace = isNamespace(kind) || isNamespaceClaim(kind);
  let listURL = isMultiCluster ? resourceClusterURL(kind, { ns: params.ns }) : _isNamespace ? resourceNamespaceURL(kind) : resourceURL(kind, { ns: params.ns });

  //if(localStorage.getItem('bridge/last-perspective') === PerspectiveType.SINGLE) {
  if (sessionStorage.getItem('bridge/last-perspective') === PerspectiveType.SINGLE) {
    return coFetchJSON(`${listURL}?${query}`, 'GET', options).then(result => (raw ? result : result.items));
  }

  const url = listURL.includes('?') ? `${listURL}&${query}` : `${listURL}?${query}`
  return coFetchJSON(url, 'GET', options).then(result => (raw ? result : result.items));
};

export const k8sListPartialMetadata = (kind, params = {}, raw = false) => {
  return k8sList(kind, params, raw, {
    headers: {
      Accept: 'application/json;as=PartialObjectMetadataList;v=v1beta1;g=meta.k8s.io,application/json',
    },
  });
};

export const k8sWatch = (kind, query = {}, wsOptions = {}) => {
  const queryParams = { watch: true };
  const opts = { queryParams };
  wsOptions = Object.assign(
    {
      host: 'auto',
      reconnect: true,
      jsonParse: true,
      bufferFlushInterval: 500,
      bufferMax: 1000,
    },
    wsOptions,
  );

  const labelSelector = query.labelSelector || kind.labelSelector;
  if (labelSelector) {
    const encodedSelector = encodeURIComponent(selectorToString(labelSelector));
    if (encodedSelector) {
      queryParams.labelSelector = encodedSelector;
    }
  }

  if (query.fieldSelector) {
    queryParams.fieldSelector = encodeURIComponent(query.fieldSelector);
  }

  if (query.ns) {
    opts.ns = query.ns;
  }

  if (query.resourceVersion) {
    queryParams.resourceVersion = encodeURIComponent(query.resourceVersion);
  }

  // Namespace 한정하여 hypercloud-api-server 웹소켓 사용하도록 변경
  if (isNamespace(kind)) {
    opts.customPath = resourceNamespaceURL(kind, true);
  }

  const path = resourceURL(kind, opts);
  wsOptions.path = path;

  // Helm 리소스는 api-server 별도로 존재
  if (isHelmRelease(kind)) {
    wsOptions.path = `/helm/v1/${query.ns ? `namespaces/${query.ns}/` : ''}releases/websocket`;
  }

  return new WSFactory(path, wsOptions);
};
