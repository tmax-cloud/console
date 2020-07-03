import * as _ from 'lodash-es';
import * as React from 'react';

export const FirstSection = ({ label, children, isRequired }) => (
  <div className={'row form-group ' + (isRequired ? 'required' : '')}>
    <label className="col-xs-2 control-label" htmlFor="secret-type">
      {label}
    </label>
    <div className="col-xs-10">{children}</div>
  </div>
);

export const SecondSection = ({ label, children, id, valueWidth }) => (
  <div className="row form-group">
    <div className="col-xs-2"></div>
    <div className="col-xs-10" id={id}>
      <label htmlFor="secret-type">{label}</label>
      <div style={{ width: valueWidth }}>{children}</div>
    </div>
  </div>
);
