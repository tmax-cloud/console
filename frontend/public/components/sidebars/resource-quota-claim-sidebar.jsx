import * as _ from 'lodash-es';
import * as React from 'react';

import { ResourceQuotaClaimModel } from '../../models';
import { referenceForModel } from '../../module/k8s';
import { SampleYaml } from './resource-sidebar';
import { useTranslation } from 'react-i18next';

export const ResourceQuotaClaimSidebar = ({ loadSampleYaml, downloadSampleYaml }) => {
    const { t } = useTranslation();
    const samples = [
        {
            header: t('STRING:RESOURCEQUOTACLAIM-SIDEBAR_0'),
            details: t('STRING:RESOURCEQUOTACLAIM-SIDEBAR_1'),
            templateName: 'resourcequotaclaim-sample',
            kind: referenceForModel(ResourceQuotaClaimModel),
        }
    ];

    return (
        <ol className="co-resource-sidebar-list">
            {_.map(samples, sample => (
                <SampleYaml key={sample.templateName} sample={sample} loadSampleYaml={loadSampleYaml} downloadSampleYaml={downloadSampleYaml} />
            ))}
        </ol>
    );
};
