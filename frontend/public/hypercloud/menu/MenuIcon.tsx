import * as React from 'react';
import * as HomeIcon from '@console/internal/imgs/hypercloud/lnb/filled/home_filled.svg';
import * as WorkloadIcon from '@console/internal/imgs/hypercloud/lnb/filled/workload_filled.svg';
import * as HelmIcon from '@console/internal/imgs/hypercloud/lnb/filled/helm_filled_lnb.svg';
import * as NetworkIcon from '@console/internal/imgs/hypercloud/lnb/filled/network_filled.svg';
import * as StorageIcon from '@console/internal/imgs/hypercloud/lnb/filled/storage_filled.svg';
import * as ManagementIcon from '@console/internal/imgs/hypercloud/lnb/filled/management_filled.svg';
import * as HostIcon from '@console/internal/imgs/hypercloud/lnb/filled/host_filled.svg';
import * as AuthenticationIcon from '@console/internal/imgs/hypercloud/lnb/filled/authentication_authorization_filled.svg';
import * as AddIcon from '@console/internal/imgs/hypercloud/lnb/filled/add_filled.svg';
import * as TopologyIcon from '@console/internal/imgs/hypercloud/lnb/filled/topology_filled.svg';
import * as ServiceCatalogIcon from '@console/internal/imgs/hypercloud/lnb/filled/service_catalog_filled.svg';
import * as ServiceMeshIcon from '@console/internal/imgs/hypercloud/lnb/filled/service_mesh_filled.svg';
import * as CiCdIcon from '@console/internal/imgs/hypercloud/lnb/filled/ci_cd_filled.svg';
import * as AiDevOpsIcon from '@console/internal/imgs/hypercloud/lnb/filled/ai_devops_filled.svg';
import * as ImageIcon from '@console/internal/imgs/hypercloud/lnb/filled/image_filled.svg';
import * as ClusterIcon from '@console/internal/imgs/hypercloud/lnb/filled/cluster_filled.svg';
import * as TerraformClaimIcon from '@console/internal/imgs/hypercloud/lnb/filled/terraform_claim_filled.svg';
import * as FederationIcon from '@console/internal/imgs/hypercloud/lnb/filled/ferderation_filled.svg';
import * as AnsibleIcon from '@console/internal/imgs/hypercloud/lnb/filled/ansible_filled_lnb.svg';
import * as ServiceBindingIcon from '@console/internal/imgs/hypercloud/lnb/filled/service_binding_filled.svg';
import * as DefaultIcon from '@console/internal/imgs/hypercloud/lnb/filled/add_menu_filled.svg';

const MenuIconContainer = (props: MenuIconContainerProps) => {
  const { icon, title } = props;
  return (
    <div style={{ display: 'inline-block', width: 160, color: 'black', fontWeight: 'bold', fontSize: '14px' }}>
      {icon && <img className="font-icon hc-menu-preview-icon" src={icon} />}
      <span>{title}</span>
    </div>
  );
};

export const MenuIconTitle = (props: MenuIconTitleProps) => {
  const { type, title } = props;
  const prettyType = type
    .toLowerCase()
    .replace(' ', '_')
    .replace('/', '_');

  switch (prettyType) {
    case 'home':
      return <MenuIconContainer title={title} icon={HomeIcon} />;
    case 'workload':
      return <MenuIconContainer title={title} icon={WorkloadIcon} />;
    case 'helm':
      return <MenuIconContainer title={title} icon={HelmIcon} />;
    case 'networking':
      return <MenuIconContainer title={title} icon={NetworkIcon} />;
    case 'storage':
      return <MenuIconContainer title={title} icon={StorageIcon} />;
    case 'administration':
      return <MenuIconContainer title={title} icon={ManagementIcon} />;
    case 'hosts':
      return <MenuIconContainer title={title} icon={HostIcon} />;
    case 'authentications':
      return <MenuIconContainer title={title} icon={AuthenticationIcon} />;
    case 'add':
      return <MenuIconContainer title={title} icon={AddIcon} />;
    case 'topology':
      return <MenuIconContainer title={title} icon={TopologyIcon} />;
    case 'service_catalogs':
      return <MenuIconContainer title={title} icon={ServiceCatalogIcon} />;
    case 'service_mesh':
      return <MenuIconContainer title={title} icon={ServiceMeshIcon} />;
    case 'ci_cd':
      return <MenuIconContainer title={title} icon={CiCdIcon} />;
    case 'ai_devops':
      return <MenuIconContainer title={title} icon={AiDevOpsIcon} />;
    case 'image':
      return <MenuIconContainer title={title} icon={ImageIcon} />;
    case 'cluster':
      return <MenuIconContainer title={title} icon={ClusterIcon} />;
    case 'terraform_claim':
      return <MenuIconContainer title={title} icon={TerraformClaimIcon} />;
    case 'federation':
      return <MenuIconContainer title={title} icon={FederationIcon} />;
    case 'ansible':
      return <MenuIconContainer title={title} icon={AnsibleIcon} />;
    case 'service_binding':
      return <MenuIconContainer title={title} icon={ServiceBindingIcon} />;
    default:
      return <MenuIconContainer title={title} icon={DefaultIcon} />;
  }
};

type MenuIconContainerProps = {
  icon: any;
  title: string;
};

type MenuIconTitleProps = {
  type: string;
  title: string;
};
