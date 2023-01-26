import * as _ from 'lodash-es';
import classNames from 'classnames';
import * as React from 'react';
import i18next from 'i18next';
import { useTranslation } from 'react-i18next';
import { FieldLevelHelp } from '../../utils';

const Node = ({ className, children, description, valid, validationErrorDesc }) => {
  const { t } = useTranslation();
  return (
    <div className={className}>
      <div>{children}</div>
      <div className="row" />
      {!valid && <p className="error-string">{i18next.exists(validationErrorDesc) ? t(validationErrorDesc) : validationErrorDesc}</p>}
      <p className={classNames('help-block', { 'help-block-short-margin-top': !valid })}>{description}</p>
    </div>
  );
};

const Node_taskparam = ({ className, children, description, valid, validationErrorDesc }) => {
  const { t } = useTranslation();
  return (
    <div className={className}>
      <p className={classNames('help-block', { 'help-block-short-margin-top': !valid })}>{description}</p>
      <div>{children}</div>
      <div className="row" />
      {!valid && <p className="error-string">{i18next.exists(validationErrorDesc) ? t(validationErrorDesc) : validationErrorDesc}</p>}
    </div>
  );
};

const CombineNodes = (id, description, children, valid, validationErrorDesc) => {
  // children node 개수에 따라 가로 분할 class 적용
  let isArray = Array.isArray(children);
  let className = isArray ? `col-md-${Math.floor(12 / children.length)}` : 'col-md-12';
  if (id.indexOf("ClusterTask") !=-1){
  return isArray ? children.map((cur, idx) => <Node_taskparam className={className} key={`${id}-${idx}`} children={cur} description={description} valid={valid} validationErrorDesc={validationErrorDesc} />) : <Node_taskparam className={className} children={children} description={description} valid={valid} validationErrorDesc={validationErrorDesc} />;
  } else{
    console.log({id});
  return isArray ? children.map((cur, idx) => <Node className={className} key={`${id}-${idx}`} children={cur} description={description} valid={valid} validationErrorDesc={validationErrorDesc} />) : <Node className={className} children={children} description={description} valid={valid} validationErrorDesc={validationErrorDesc} />;
}
};

export const Section: React.FC<SectionProps> = ({ id, label, description, children, isRequired = false, valid = true, validationErrorDesc = '', help = false, helpText, helpTitle }) => {
  let result = CombineNodes(id, description, children, valid, validationErrorDesc);
  return (
    <div className="form-group">
      {label && (
        <label className={'control-label ' + (isRequired ? 'co-required' : '')} htmlFor={id}>
          {label}
        </label>
      )}
      {help && (
        <div style={{ display: 'inline-block', marginLeft: 5 }}>
          <FieldLevelHelp>
            <h2>{helpTitle}</h2>
            <p>{helpText}</p>
          </FieldLevelHelp>
        </div>
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
  validationErrorDesc?: string;
  help?: boolean;
  helpTitle?: string;
  helpText?: string;
};
