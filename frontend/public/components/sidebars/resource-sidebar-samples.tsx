import * as _ from 'lodash-es';
import * as React from 'react';
import { Map as ImmutableMap } from 'immutable';
import { Button } from '@patternfly/react-core';
import MonacoEditor from 'react-monaco-editor';
import { ChevronDownIcon, ChevronRightIcon, DownloadIcon, PasteIcon } from '@patternfly/react-icons';

import { BuildConfigModel, ClusterRoleModel, ConsoleLinkModel, NetworkPolicyModel, ResourceQuotaModel, RoleModel } from '../../models';
import { apiVersionForModel, GroupVersionKind, K8sKind, K8sResourceKind, referenceFor, referenceForModel } from '../../module/k8s';
import { FirehoseResult } from '../utils';
import * as denyOtherNamespacesImg from '../../imgs/network-policy-samples/1-deny-other-namespaces.svg';
import * as limitCertainAppImg from '../../imgs/network-policy-samples/2-limit-certain-apps.svg';
import * as allowIngressImg from '../../imgs/network-policy-samples/3-allow-ingress.svg';
import * as defaultDenyAllImg from '../../imgs/network-policy-samples/4-default-deny-all.svg';
import * as webAllowExternalImg from '../../imgs/network-policy-samples/5-web-allow-external.svg';
import * as webDbAllowAllNsImg from '../../imgs/network-policy-samples/6-web-db-allow-all-ns.svg';
import * as webAllowProductionImg from '../../imgs/network-policy-samples/7-web-allow-production.svg';
// import { hyperCloudSamples } from '../hypercloud/sidebars/resource-sidebar-samples';

const getTargetResource = (model: K8sKind) => ({
  apiVersion: apiVersionForModel(model),
  kind: model.kind,
});

const clusterRoleBindingSamples: Sample[] = [
  {
    title: 'Allow reading Nodes in the core API groups (for ClusterRoleBinding)',
    description: 'This "ClusterRole" is allowed to read the resource "nodes" in the core group (because a Node is cluster-scoped, this must be bound with a "ClusterRoleBinding" to be effective).',
    id: 'read-nodes',
    targetResource: getTargetResource(ClusterRoleModel),
  },
  {
    title: '"GET/POST" requests to non-resource endpoint and all subpaths (for ClusterRoleBinding)',
    description: 'This "ClusterRole" is allowed to "GET" and "POST" requests to the non-resource endpoint "/healthz" and all subpaths (must be in the "ClusterRole" bound with a "ClusterRoleBinding" to be effective).',
    id: 'get-and-post-to-non-resource-endpoints',
    targetResource: getTargetResource(ClusterRoleModel),
  },
];

const defaultSamples = ImmutableMap<GroupVersionKind, Sample[]>()
  .setIn(
    [referenceForModel(BuildConfigModel)],
    [
      {
        title: 'Build from Dockerfile',
        description: 'A Dockerfile build performs an image build using a Dockerfile in the source repository or specified in build configuration.',
        id: 'docker-build',
        targetResource: getTargetResource(BuildConfigModel),
      },
      {
        title: 'Source-to-Image (S2I) build',
        description: 'S2I is a tool for building reproducible container images. It produces ready-to-run images by injecting the application source into a container image and assembling a new image.',
        id: 's2i-build',
        targetResource: getTargetResource(BuildConfigModel),
      },
    ],
  )
  .setIn(
    [referenceForModel(NetworkPolicyModel)],
    [
      {
        // highlightText: 'Limit',
        title: 'SINGLE:MSG_NETWORKPOLICIES_CREATENETWORKPOLICYYAML_DIV3_TABSAMPLE_1',
        img: denyOtherNamespacesImg,
        description: 'SINGLE:MSG_NETWORKPOLICIES_CREATENETWORKPOLICYYAML_DIV3_TABSAMPLE_2',
        id: 'deny-other-namespaces',
        targetResource: getTargetResource(NetworkPolicyModel),
      },
      {
        // highlightText: 'Limit',
        title: 'SINGLE:MSG_NETWORKPOLICIES_CREATENETWORKPOLICYYAML_DIV3_TABSAMPLE_3',
        img: limitCertainAppImg,
        description: 'SINGLE:MSG_NETWORKPOLICIES_CREATENETWORKPOLICYYAML_DIV3_TABSAMPLE_4',
        id: 'db-or-api-allow-app',
        targetResource: getTargetResource(NetworkPolicyModel),
      },
      {
        // highlightText: 'Allow',
        title: 'SINGLE:MSG_NETWORKPOLICIES_CREATENETWORKPOLICYYAML_DIV3_TABSAMPLE_5',
        img: allowIngressImg,
        description: 'SINGLE:MSG_NETWORKPOLICIES_CREATENETWORKPOLICYYAML_DIV3_TABSAMPLE_6',
        id: 'api-allow-http-and-https',
        targetResource: getTargetResource(NetworkPolicyModel),
      },
      {
        // highlightText: 'Deny',
        title: 'SINGLE:MSG_NETWORKPOLICIES_CREATENETWORKPOLICYYAML_DIV3_TABSAMPLE_7',
        img: defaultDenyAllImg,
        description: 'SINGLE:MSG_NETWORKPOLICIES_CREATENETWORKPOLICYYAML_DIV3_TABSAMPLE_8',
        id: 'default-deny-all',
        targetResource: getTargetResource(NetworkPolicyModel),
      },
      {
        // highlightText: 'Allow',
        title: 'SINGLE:MSG_NETWORKPOLICIES_CREATENETWORKPOLICYYAML_DIV3_TABSAMPLE_9',
        img: webAllowExternalImg,
        description: 'SINGLE:MSG_NETWORKPOLICIES_CREATENETWORKPOLICYYAML_DIV3_TABSAMPLE_10',
        id: 'web-allow-external',
        targetResource: getTargetResource(NetworkPolicyModel),
      },
      {
        // highlightText: 'Allow',
        title: 'SINGLE:MSG_NETWORKPOLICIES_CREATENETWORKPOLICYYAML_DIV3_TABSAMPLE_11',
        img: webDbAllowAllNsImg,
        description: 'SINGLE:MSG_NETWORKPOLICIES_CREATENETWORKPOLICYYAML_DIV3_TABSAMPLE_12',
        id: 'web-db-allow-all-ns',
        targetResource: getTargetResource(NetworkPolicyModel),
      },
      {
        // highlightText: 'Allow',
        title: 'SINGLE:MSG_NETWORKPOLICIES_CREATENETWORKPOLICYYAML_DIV3_TABSAMPLE_13',
        img: webAllowProductionImg,
        description: 'SINGLE:MSG_NETWORKPOLICIES_CREATENETWORKPOLICYYAML_DIV3_TABSAMPLE_14',
        id: 'web-allow-production',
        targetResource: getTargetResource(NetworkPolicyModel),
      },
    ],
  )
  .setIn(
    [referenceForModel(ResourceQuotaModel)],
    [
      {
        title: 'SINGLE:MSG_RESOURCEQUOTAS_CREATERESOURCEQUOTAYAML_DIV3_TABSAMPLE_10',
        description: 'SINGLE:MSG_RESOURCEQUOTAS_CREATERESOURCEQUOTAYAML_DIV3_TABSAMPLE_11',
        id: 'rq-compute',
        targetResource: getTargetResource(ResourceQuotaModel),
      },
      {
        title: 'SINGLE:MSG_RESOURCEQUOTAS_CREATERESOURCEQUOTAYAML_DIV3_TABSAMPLE_12',
        description: 'SINGLE:MSG_RESOURCEQUOTAS_CREATERESOURCEQUOTAYAML_DIV3_TABSAMPLE_13',
        id: 'rq-counts',
        targetResource: getTargetResource(ResourceQuotaModel),
      },
      {
        title: 'SINGLE:MSG_RESOURCEQUOTAS_CREATERESOURCEQUOTAYAML_DIV3_TABSAMPLE_14',
        description: 'SINGLE:MSG_RESOURCEQUOTAS_CREATERESOURCEQUOTAYAML_DIV3_TABSAMPLE_15',
        id: 'rq-storageclass',
        targetResource: getTargetResource(ResourceQuotaModel),
      },
    ],
  )
  .setIn(
    [referenceForModel(RoleModel)],
    [
      {
        title: 'Allow reading the resource in API group',
        description: 'This "Role" is allowed to read the resource "Pods" in the core API group.',
        id: 'read-pods-within-ns',
        targetResource: getTargetResource(RoleModel),
      },
      {
        title: 'Allow reading/writing the resource in API group',
        description: 'This "Role" is allowed to read and write the "Deployments" in both the "extensions" and "apps" API groups.',
        id: 'read-write-deployment-in-ext-and-apps-apis',
        targetResource: getTargetResource(RoleModel),
      },
      {
        title: 'Allow different access rights to different types of resource and API groups',
        description: 'This "Role" is allowed to read "Pods" and read/write "Jobs" resources in API groups.',
        id: 'read-pods-and-read-write-jobs',
        targetResource: getTargetResource(RoleModel),
      },
      {
        title: 'Allow reading a ConfigMap in a specific namespace (for RoleBinding)',
        description: 'This "Role" is allowed to read a "ConfigMap" named "my-config" (must be bound with a "RoleBinding" to limit to a single "ConfigMap" in a single namespace).',
        id: 'read-configmap-within-ns',
        targetResource: getTargetResource(RoleModel),
      },
      ...clusterRoleBindingSamples,
    ],
  )
  .setIn([referenceForModel(ClusterRoleModel)], clusterRoleBindingSamples)
  .setIn(
    [referenceForModel(ConsoleLinkModel)],
    [
      {
        title: 'Add a link to the user menu',
        description: 'The user menu appears in the right side of the masthead below the username.',
        id: 'cl-user-menu',
        targetResource: getTargetResource(ConsoleLinkModel),
      },
      {
        title: 'Add a link to the application menu',
        description: 'The application menu appears in the masthead below the 9x9 grid icon.  Application menu links can include an optional image and section heading.',
        id: 'cl-application-menu',
        targetResource: getTargetResource(ConsoleLinkModel),
      },
      {
        title: 'Add a link to the namespace dashboard',
        description: 'Namespace dashboard links appear on the project dashboard and namespace details pages in a section called "Launcher".  Namespace dashboard links can optionally be restricted to a specific namespace or namespaces.',
        id: 'cl-namespace-dashboard',
        targetResource: getTargetResource(ConsoleLinkModel),
      },
    ],
  );

export const getResourceSidebarSamples = (kindObj: K8sKind, yamlSamplesList: FirehoseResult) => {
  const yamlSamplesData = !_.isEmpty(yamlSamplesList) ? _.filter(yamlSamplesList.data, (sample: K8sResourceKind) => sample.spec.targetResource.apiVersion === apiVersionForModel(kindObj) && sample.spec.targetResource.kind === kindObj.kind) : [];
  // const existingSamples = hyperCloudSamples.get(referenceForModel(kindObj)) || defaultSamples.get(referenceForModel(kindObj)) || [];
  const existingSamples = defaultSamples.get(referenceForModel(kindObj)) || []; //  Sample 지원 일단 보류 (hypercloud 6이후일듯.)
  const extensionSamples = [];
  if (!_.isEmpty(yamlSamplesData)) {
    yamlSamplesData.map((sample: K8sResourceKind) => {
      if (sample.hasOwnProperty('samples')) {
        sample.samples.map(current => extensionSamples.push({ ...current, targetResource: sample.spec.targetResource }));
      } else {
        extensionSamples.push({ id: sample.metadata.uid, ...sample.spec, image: sample.image });
      }
    });
  }

  const allSamples = [...existingSamples, ...extensionSamples];

  // For the time being, `snippets` are a superset of `samples`
  const snippets = allSamples.filter((sample: Sample) => sample.snippet);
  const samples = allSamples.filter((sample: Sample) => !sample.snippet);

  return { snippets, samples };
};

const ResourceSidebarSample: React.FC<ResourceSidebarSampleProps> = ({ sample, loadSampleYaml, downloadSampleYaml }) => {
  const { highlightText, title, img, description, id, yaml, targetResource, image } = sample;
  const reference = referenceFor(targetResource);

  console.log(`data:image/jpeg;base64,${image}`);
  return (
    <li className="co-resource-sidebar-item">
      <h3 className="h4">
        <span className="text-uppercase">{highlightText}</span> {title}
      </h3>
      {img && <img src={img} className="co-resource-sidebar-item__img img-responsive" />}
      {image && <img src={`data:image/jpeg;base64,${image}`} className="co-resource-sidebar-item__img img-responsive" />}
      <p>{description}</p>
      <Button type="button" variant="link" isInline onClick={() => loadSampleYaml(id, yaml, reference)}>
        <PasteIcon className="co-icon-space-r" />
        Try it
      </Button>
      <Button type="button" variant="link" isInline className="pull-right" onClick={() => downloadSampleYaml(id, yaml, reference)}>
        <DownloadIcon className="co-icon-space-r" />
        Download YAML
      </Button>
    </li>
  );
};

const lineHeight = 18;
const PreviewYAML = ({ maxPreviewLines = 20, yaml }) => {
  return (
    <div style={{ paddingTop: 10 }}>
      <MonacoEditor
        height={Math.min(yaml.split('\n').length, maxPreviewLines) * lineHeight}
        language="yaml"
        value={yaml}
        options={{
          lineHeight,
          readOnly: true,
          folding: false,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
        }}
      />
    </div>
  );
};

const ResourceSidebarSnippet: React.FC<any> = ({ snippet, insertSnippetYaml }) => {
  const [yamlPreviewOpen, setYamlPreviewOpen] = React.useState(false);
  const toggleYamlPreview = () => setYamlPreviewOpen(!yamlPreviewOpen);

  const { highlightText, title, id, yaml, targetResource, description } = snippet;
  const reference = referenceFor(targetResource);
  return (
    <li className="co-resource-sidebar-item">
      <h3 className="h4">
        <span className="text-uppercase">{highlightText}</span> {title}
      </h3>
      <p>{description}</p>
      <Button type="button" variant="link" isInline onClick={() => insertSnippetYaml(id, yaml, reference)}>
        <PasteIcon className="co-icon-space-r" />
        Insert Snippet
      </Button>
      <Button type="button" className="pull-right" variant="link" isInline onClick={() => toggleYamlPreview()}>
        {yamlPreviewOpen ? (
          <>
            Hide YAML
            <ChevronDownIcon className="co-icon-space-l" />
          </>
        ) : (
          <>
            Show YAML
            <ChevronRightIcon className="co-icon-space-l" />
          </>
        )}
      </Button>
      {yamlPreviewOpen && <PreviewYAML yaml={yaml} />}
    </li>
  );
};

export const ResourceSidebarSnippets = ({ snippets, insertSnippetYaml }) => {
  return (
    <ul className="co-resource-sidebar-list" style={{ listStyle: 'none', paddingLeft: 0 }}>
      {_.map(snippets, snippet => (
        <ResourceSidebarSnippet key={snippet.id} snippet={snippet} insertSnippetYaml={insertSnippetYaml} />
      ))}
    </ul>
  );
};

export const ResourceSidebarSamples: React.FC<ResourceSidebarSamplesProps> = ({ samples, loadSampleYaml, downloadSampleYaml }) => {
  return (
    <ol className="co-resource-sidebar-list">
      {_.map(samples, sample => (
        <ResourceSidebarSample key={sample.id} sample={sample} loadSampleYaml={loadSampleYaml} downloadSampleYaml={downloadSampleYaml} />
      ))}
    </ol>
  );
};

type Sample = {
  highlightText?: string;
  title: string;
  img?: string;
  image?: string;
  description: string;
  id: string;
  yaml?: string;
  snippet?: boolean;
  targetResource: {
    apiVersion: string;
    kind: string;
  };
};

type LoadSampleYaml = (id: string, yaml: string, kind: string) => void;

type DownloadSampleYaml = (id: string, yaml: string, kind: string) => void;

type ResourceSidebarSampleProps = {
  sample: Sample;
  loadSampleYaml: LoadSampleYaml;
  downloadSampleYaml: DownloadSampleYaml;
};

type ResourceSidebarSamplesProps = {
  samples: Sample[];
  loadSampleYaml: LoadSampleYaml;
  downloadSampleYaml: DownloadSampleYaml;
  yamlSamplesList: FirehoseResult;
  kindObj: K8sKind;
};
