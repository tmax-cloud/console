import * as React from 'react';
import { getRunStatusColor } from '../../../../utils/pipeline-augment';
import HorizontalStackedBars, {
  StackedValue
} from '../../../charts/HorizontalStackedBars';
import { StepStatus } from './pipeline-step-utils';

interface TaskStatusProps {
  steps: StepStatus[];
}

const TaskComponentTaskStatus: React.FC<TaskStatusProps> = ({ steps }) => {
  if (steps.length === 0) return null;

  const visualValues: StackedValue[] = steps.map(({ name, runStatus }) => {
    let barColor;
    switch (runStatus) {
      case 'Succeeded':
        barColor = '#4D8AFF';
        break;
      case 'Running':
        barColor = '#4BBBCF';
        break;
      // case '':
      //   iconColor = '4BBBCF';
      //   break;
      // 실행중
      default:
        barColor = '#FD5461';
        break;
    }
    return {
      // color: getRunStatusColor(runStatus).pftoken.value,
      color: barColor,
      name,
      size: 1
    };
  });

  return <HorizontalStackedBars values={visualValues} barGap={2} height={2} />;
};

export default TaskComponentTaskStatus;
