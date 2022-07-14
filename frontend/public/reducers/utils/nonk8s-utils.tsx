const nonK8sResourceList = ['HelmRepository', 'HelmChart', 'HelmRelease', 'HelmChartInRepository'];

export const isNonK8SResource = (id: string) => {
  const kind = id.split('~~')[0];
  return nonK8sResourceList.indexOf(kind) > -1;
};
