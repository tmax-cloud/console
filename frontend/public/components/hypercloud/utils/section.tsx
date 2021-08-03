import * as _ from 'lodash-es';
import * as React from 'react';

const Node = ({ className, children, description, valid }) => (
  <div className={className}>
    <div>{children}</div>
    <div className="row" />
    {!valid && <p className="error-string">에러문구 샘플 에러문구 샘플</p>}
    <p className="help-block">{description}</p>
  </div>
);

const CombineNodes = (id, description, children, valid) => {
  // children node 개수에 따라 가로 분할 class 적용
  let isArray = Array.isArray(children);
  let className = isArray ? `col-md-${Math.floor(12 / children.length)}` : 'col-md-12';
  return isArray ? children.map((cur, idx) => <Node className={className} key={`${id}-${idx}`} children={cur} description={description} valid={valid} />) : <Node className={className} children={children} description={description} valid={valid} />;
};

export const Section: React.FC<SectionProps> = ({ id, label, description, children, isRequired = false, valid = true }) => {
  let result = CombineNodes(id, description, children, valid);
  return (
    <div className="form-group">
      {label && (
        <label className={'control-label ' + (isRequired ? 'co-required' : '')} htmlFor={id}>
          {label}
        </label>
      )}
      <div className="row" key={id}>
        {result}
      </div>
    </div>
  );
};

type SectionProps = {
  id: string;
  children: Array<React.ReactNode> | React.ReactNode;
  label?: string;
  description?: string;
  isRequired?: boolean;
  valid?: boolean;
};
