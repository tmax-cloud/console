import * as _ from 'lodash-es';
import * as React from 'react';

import { ColHead, DetailsPage, List, ListHeader, ListPage } from './factory';
import { Cog, navFactory, ResourceCog, SectionHeading, ResourceLink, ResourceSummary, ScrollToTopOnMount, kindObj } from './utils';
import { fromNow } from './utils/datetime';
import { useTranslation } from 'react-i18next';
import { ResourcePlural } from './utils/lang/resource-plural';

const menuActions = [...Cog.factory.common];

const VirtualServiceHeader = props => {
  const { t } = useTranslation();
  return (
    <ListHeader>
      <ColHead {...props} className="col-xs-2 col-sm-2" sortField="metadata.name">
        {t('CONTENT:NAME')}
      </ColHead>
      <ColHead {...props} className="col-xs-2 col-sm-2" sortField="metadata.namespace">
        {t('CONTENT:NAMESPACE')}
      </ColHead>
      <ColHead {...props} className="col-xs-2 col-sm-2" sortField="spec.hosts">
        {t('CONTENT:HOST')}
      </ColHead>
      <ColHead {...props} className="col-xs-2 col-sm-2" sortField="spec.gateways">
        {t('CONTENT:GATEWAY')}
      </ColHead>
      <ColHead {...props} className="col-sm-2 hidden-xs" sortField="metadata.creationTimestamp">
        {t('CONTENT:CREATED')}
      </ColHead>
    </ListHeader>
  );
};

const VirtualServiceRow = () =>
  // eslint-disable-next-line no-shadow
  function VirtualServiceRow({ obj }) {
    let gateways = obj.spec.gateways ? obj.spec.gateways.map(gateway => gateway + ' ') : '';
    let hosts = obj.spec.hosts ? obj.spec.hosts.map(host => host + ' ') : '';
    return (
      <div className="row co-resource-list__item">
        <div className="col-xs-2 col-sm-2 co-resource-link-wrapper">
          <ResourceCog actions={menuActions} kind="VirtualService" resource={obj} />
          <ResourceLink kind="VirtualService" name={obj.metadata.name} namespace={obj.metadata.namespace} title={obj.metadata.name} />
        </div>
        <div className="col-xs-2 col-sm-2 co-break-word">{obj.metadata.namespace}</div>
        <div className="col-xs-2 col-sm-2 co-break-word">{hosts}</div>
        <div className="col-xs-2 col-sm-2 co-break-word">{gateways}</div>
        <div className="col-xs-2 col-sm-2 hidden-xs">{fromNow(obj.metadata.creationTimestamp)}</div>
      </div>
    );
  };

const Details = ({ obj: condition }) => {
  const { t } = useTranslation();
  return (
    <React.Fragment>
      <ScrollToTopOnMount />
      <div className="co-m-pane__body">
        <SectionHeading text={t('ADDITIONAL:OVERVIEWTITLE', { something: ResourcePlural('VirtualService', t) })} />
        <div className="row">
          <div className="col-sm-6">
            <ResourceSummary resource={condition} />
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export const VirtualServiceList = props => {
  const { kinds } = props;
  const Row = VirtualServiceRow(kinds[0]);
  Row.displayName = 'VirtualServiceRow';
  return <List {...props} Header={VirtualServiceHeader} Row={Row} />;
};
VirtualServiceList.displayName = VirtualServiceList;

export const VirtualServicePage = props => {
  const { t } = useTranslation();
  return <ListPage {...props} ListComponent={VirtualServiceList} createButtonText={t('ADDITIONAL:CREATEBUTTON', { something: ResourcePlural(props.kind, t) })} canCreate={true} kind="VirtualService" />;
};
VirtualServicePage.displayName = 'VirtualServicePage';

export const VirtualServiceDetailsPage = props => {
  const { t } = useTranslation();
  return <DetailsPage {...props} kind="VirtualService" menuActions={menuActions} pages={[navFactory.details(Details, t('CONTENT:OVERVIEW')), navFactory.editYaml()]} />;
};

VirtualServiceDetailsPage.displayName = 'VirtualServiceDetailsPage';
