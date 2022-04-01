import * as _ from 'lodash-es';

export const volumeValidCallback = additionalConditions => {
  if (additionalConditions[0] === 'emptyDir') {
    return true;
  }
  return additionalConditions.filter((c, i) => i !== 0).some(cur => (typeof cur === 'string' ? cur.trim().length > 0 : false));
};

export const stepValidCallback = (additionalConditions: string[]) => {
  const [type, image, registryRegistry, registryImage, registryTag, mountArr] = additionalConditions;
  console.log('mountArr: ', mountArr);

  if (mountArr.length > 0 && mountArr.length !== _.uniqBy(mountArr, 'mountName.value').length) {
    return false;
  }
  if (type === 'internal') {
    if (registryRegistry && registryImage && registryTag) {
      return true;
    }
    return false;
  } else {
    if (image) {
      return true;
    }
    return false;
  }
};
