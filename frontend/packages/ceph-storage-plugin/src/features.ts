import * as _ from 'lodash';
import { Dispatch } from 'react-redux';
import { k8sGet } from '@console/internal/module/k8s';
import { setFlag } from '@console/internal/actions/features';
import { FeatureDetector } from '@console/plugin-sdk';
import { OCSServiceModel } from './models';
import { OCS_INDEPENDENT_CR_NAME, CEPH_STORAGE_NAMESPACE, OCS_CONVERGED_CR_NAME } from './constants';

export const OCS_INDEPENDENT_FLAG = 'OCS_INDEPENDENT';
export const OCS_CONVERGED_FLAG = 'OCS_CONVERGED';
// Used to activate NooBaa dashboard
export const OCS_FLAG = 'OCS';
// Todo(bipuladh): Remove this completely in 4.6
export const CEPH_FLAG = 'CEPH';

/* Key and Value should be same value received in CSV  */
export const OCS_SUPPORT_FLAGS = {
  SNAPSHOT: 'SNAPSHOT',
  EXTERNAL: 'EXTERNAL',
};

const handleError = (res: any, flags: string[], dispatch: Dispatch, cb: FeatureDetector) => {
  const status = res?.response?.status;
  if (_.includes([403, 502], status)) {
    flags.forEach(feature => {
      dispatch(setFlag(feature, undefined));
    });
  }
  if (!_.includes([401, 403, 500], status)) {
    setTimeout(() => cb(dispatch), 15000);
  }
};

export const detectOCS: FeatureDetector = async dispatch => {
  try {
    await k8sGet(OCSServiceModel, OCS_CONVERGED_CR_NAME, CEPH_STORAGE_NAMESPACE);
    dispatch(setFlag(OCS_FLAG, true));
    dispatch(setFlag(OCS_CONVERGED_FLAG, true));
    dispatch(setFlag(OCS_INDEPENDENT_FLAG, false));
  } catch (e) {
    e?.response?.status !== 404 ? handleError(e, [OCS_CONVERGED_FLAG], dispatch, detectOCS) : dispatch(setFlag(OCS_CONVERGED_FLAG, false));
    try {
      await k8sGet(OCSServiceModel, OCS_INDEPENDENT_CR_NAME, CEPH_STORAGE_NAMESPACE);
      dispatch(setFlag(OCS_FLAG, true));
      dispatch(setFlag(OCS_INDEPENDENT_FLAG, true));
      dispatch(setFlag(OCS_CONVERGED_FLAG, false));
    } catch (err) {
      err?.response?.status !== 404 ? handleError(err, [OCS_INDEPENDENT_FLAG], dispatch, detectOCS) : dispatch(setFlag(OCS_INDEPENDENT_FLAG, false));
    }
  }
};
