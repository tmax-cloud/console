import * as React from 'react';
import * as _ from 'lodash-es';
import { connect } from 'react-redux';
import { Breadcrumb, BreadcrumbItem, Button, Popover } from '@patternfly/react-core';
import { getAcitveSchema } from '@console/internal/reducers/ui';
import { K8sKind, K8sResourceKind, K8sResourceKindReference, modelFor, referenceFor } from '../../module/k8s';
import { LinkifyExternal } from './link';
import { SwaggerDefinition } from '../../module/k8s';
import { RootState } from '@console/internal/redux';
import { useTranslation } from 'react-i18next';
const PropertyPath: React.FC<{ kind: string; path: string | string[] }> = ({ kind, path }) => {
  const pathArray: string[] = _.toPath(path);
  return (
    <Breadcrumb className="pf-c-breadcrumb--no-padding-top">
      <BreadcrumbItem>{kind}</BreadcrumbItem>
      {pathArray.map((property, i) => {
        const isLast = i === pathArray.length - 1;
        return (
          <BreadcrumbItem key={i} isActive={isLast}>
            {property}
          </BreadcrumbItem>
        );
      })}
    </Breadcrumb>
  );
};

const DetailsItem_: React.FC<DetailsItemProps> = props => {
  // const { label, obj, path, defaultValue = '-', hideEmpty, children, activeSchema } = props;
  const { label, obj, path, defaultValue = '-', hideEmpty, children } = props;
  if (hideEmpty && _.isEmpty(_.get(obj, path))) {
    return null;
  }
  const { t } = useTranslation();
  const reference: K8sResourceKindReference = referenceFor(obj);
  const model: K8sKind = modelFor(reference);
  // let currentPath = typeof path === 'string' && path.split('.');
  // const schemaPath = currentPath.map(cur => `properties.${cur}`).join('.');
  // const description: string = getPropertyDescription(model, path); //기존 swagger.json 참조하는 버전
  // const description: string = _.get(activeSchema, schemaPath)?.description; // structural schema 적용한 버전
  const description: null = null;
  const value: React.ReactNode = children || _.get(obj, path, defaultValue);
  return (
    <>
      <dt>
        {description ? (
          <Popover
            headerContent={<div>{label}</div>}
            bodyContent={
              <LinkifyExternal>
                <div className="co-pre-line">{t(`COMMON:${description}`)}</div>
              </LinkifyExternal>
            }
            footerContent={<PropertyPath kind={model.kind} path={path} />}
            maxWidth="30rem"
          >
            <Button variant="plain" className="co-m-pane__details-popover-button">
              {label}
            </Button>
          </Popover>
        ) : (
          label
        )}
      </dt>
      <dd>{value}</dd>
    </>
  );
};

const mapStateToProps = (state: RootState, props: DetailsItemProps) => ({
  activeSchema: getAcitveSchema(state),
});

export const DetailsItem = connect(mapStateToProps, null)(DetailsItem_);

export type DetailsItemProps = {
  obj: K8sResourceKind;
  label: string;
  path?: string | string[];
  defaultValue?: React.ReactNode;
  hideEmpty?: boolean;
  children?: React.ReactNode;
  activeSchema?: SwaggerDefinition;
};
