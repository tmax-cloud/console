import * as _ from 'lodash';
import * as React from 'react';
import { NodeKind } from '@console/internal/module/k8s';
import { SectionHeading, units } from '@console/internal/components/utils';
import { useTranslation } from 'react-i18next';

type NodeDetailsImagesProps = {
  node: NodeKind;
};

const NodeDetailsImages: React.FC<NodeDetailsImagesProps> = ({ node }) => {
  const images = _.filter(node.status.images, 'names');
  const { t } = useTranslation();
  return (
    <div className="co-m-pane__body">
      <SectionHeading text={t('COMMON:MSG_DETAILS_TABDETAILS_IMAGES_1')} />
      <div className="co-table-container">
        <table className="table table--layout-fixed">
          <colgroup>
            <col className="col-sm-10 col-xs-9" />
            <col className="col-sm-2 col-xs-3" />
          </colgroup>
          <thead>
            <tr>
              <th>{t('COMMON:MSG_DETAILS_TABDETAILS_IMAGES_2')}</th>
              <th>{t('COMMON:MSG_DETAILS_TABDETAILS_IMAGES_3')}</th>
            </tr>
          </thead>
          <tbody>
            {_.map(images, (image, i) => (
              <tr key={i}>
                <td className="co-break-all co-select-to-copy">{image.names.find((name: string) => !name.includes('@') && !name.includes('<none>')) || image.names[0]}</td>
                <td>{units.humanize(image.sizeBytes, 'binaryBytes', true).string || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NodeDetailsImages;
