import * as React from 'react';
import { EmptyBox } from '../status-box';

export const CodeContainer = (props: CodeContainerProps) => {
  const { label, value } = props;
  return value ? (
    <dl>
      <dd>
        <div className="co-copy-to-clipboard">
          <pre className="co-pre-wrap co-copy-to-clipboard__text">{typeof value === 'object' ? JSON.stringify(value, null, 4) : value}</pre>
        </div>
      </dd>
    </dl>
  ) : (
    <EmptyBox label={label} />
  );
};

export type CodeContainerProps = {
  label: string;
  value: string;
};
