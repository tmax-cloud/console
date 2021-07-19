import * as React from 'react';
import { RadioGroup } from '@console/internal/components/radio';
import './styles.scss';
import { useTranslation } from 'react-i18next';

export enum EditorType {
  Form = 'form',
  YAML = 'yaml',
}

export const EditorToggle: React.FC<EditorToggleProps> = ({ value, onChange }) => {
  const { t } = useTranslation();
  return (
    <div className="co-synced-editor__editor-toggle">
      <RadioGroup
        label={t('COMMON:MSG_COMMON_CREATEFORM_RADIOBUTTON_1')}
        currentValue={value}
        inline
        items={[
          {
            value: EditorType.Form,
            title: 'Form View',
          },
          {
            value: EditorType.YAML,
            title: 'YAML View',
          },
        ]}
        onChange={({ currentTarget }) => onChange(currentTarget.value as EditorType)}
      />
    </div>
  );
};

type EditorToggleProps = {
  value: EditorType;
  onChange?: (newValue: EditorType) => void;
};
