import * as React from 'react';
import { capitalize } from 'lodash';
import { FieldArray, useField } from 'formik';
import FormSection from '../../../import/section/FormSection';
import PipelineResourceDropdownField from './PipelineResourceDropdownField';
import { PipelineModalFormResource } from './types';
import { useTranslation } from 'react-i18next';

type ResourceSectionType = {
  formikIndex: number;
  resource: PipelineModalFormResource;
};
type ResourceSection = {
  cluster?: ResourceSectionType[];
  git?: ResourceSectionType[];
  image?: ResourceSectionType[];
  storage?: ResourceSectionType[];
};

const reduceToSections = (
  acc: ResourceSection,
  resource: PipelineModalFormResource,
  formikIndex: number,
) => {
  const resourceType = resource.data.type;

  if (!resourceType) {
    return acc;
  }

  return {
    ...acc,
    [resourceType]: [...(acc[resourceType] || []), { formikIndex, resource }],
  };
};

const PipelineResourceSection: React.FC = () => {
  const [{ value: resources }] = useField<PipelineModalFormResource[]>('resources');

  const sections: ResourceSection = resources.reduce(reduceToSections, {} as ResourceSection);
  const types = Object.keys(sections);
  const { t } = useTranslation();

  return (
    <>
      {types.map((type) => (
        <FieldArray
          name={type}
          key={type}
          render={() => {
            const section = sections[type];

            return (
              <FormSection title={(type === 'git') ? t('SINGLE:MSG_CI/CD_STARTPIPELINEPOPUP_GITRESOURCES_1'): (type === 'image') ? t('SINGLE:MSG_CI/CD_STARTPIPELINEPOPUP_IMAGERESOURCES_1') : `${capitalize(type)} Resources`} fullWidth>
                {section.map((sectionData: ResourceSectionType) => {
                  const { formikIndex, resource } = sectionData;

                  return (
                    <PipelineResourceDropdownField
                      key={resource.name}
                      name={`resources.${formikIndex}`}
                      filterType={type}
                      label={t('SINGLE:MSG_CI/CD_MAILFORM_REQUEST_4')}
                    />
                  );
                })}
              </FormSection>
            );
          }}
        />
      ))}
    </>
  );
};

export default PipelineResourceSection;
