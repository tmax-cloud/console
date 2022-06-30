const nonK8sResourceList = ['HelmChart', 'HelmRelease'];

export const isNonK8SResource = (id: string) => {
  return nonK8sResourceList.indexOf(id) > -1;
};
