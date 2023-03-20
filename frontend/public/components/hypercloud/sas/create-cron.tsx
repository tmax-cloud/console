import * as React from 'react';
import { Form, FormGroup, TextInput, FormSelect, FormSelectOption, ActionGroup, Button } from '@patternfly/react-core';
// import { WebSocketContext } from '../../app';
import { withRouter } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export const CreateCron = props => {
  // const webSocket = React.useContext(WebSocketContext);
  const { cron } = props.match.params;
  const [name, setName] = React.useState('');

  const [description, setDescription] = React.useState('');
  const [cronType, setCronType] = React.useState('Delay');
  const [startDate, setStartDate] = React.useState(new Date());
  const [runs, setRuns] = React.useState('');
  const cronTypeOptions = [
    { value: 'Delay', label: 'Delay', disabled: false },
    { value: 'Reservation', label: 'Reservation', disabled: false },
    { value: 'Delay with fixed', label: 'Delay with fixed', disabled: false },
    { value: 'Delay with rate', label: 'Delay with rate', disabled: false },
  ];
  const [delayTime, setDelayTime] = React.useState('');
  const [timeUnit, setTimeUnit] = React.useState('');
  const timeUnitOptions = [
    { value: 'second', label: '초', disabled: false },
    { value: 'minute', label: '분', disabled: false },
    { value: 'hour', label: '시', disabled: false },
  ];
  const [delayCycleTime, setDelayCycleTime] = React.useState('');
  const [timeCycleUnit, setTimeCycleUnit] = React.useState('');
  const handleRunChange = (value: string) => {
    setRuns(value);
  };
  const handleTimeUnitChange = (value: string, _event: React.FormEvent<HTMLSelectElement>) => {
    setTimeUnit(value);
  };
  const handleCycleTimeUnitChange = (value: string, _event: React.FormEvent<HTMLSelectElement>) => {
    setTimeCycleUnit(value);
  };

  const handleCronChange = (value: string, _event: React.FormEvent<HTMLSelectElement>) => {
    setCronType(value);
  };

  const handleNameChange = (name: string) => {
    setName(name);
  };
  const handleDelayCycleChange = (phone: string) => {
    setDelayCycleTime(phone);
  };
  const handleDelayChange = (phone: string) => {
    setDelayTime(phone);
  };
  const handleDescriptionChange = (phone: string) => {
    setDescription(phone);
  };

  const submit = () => {
    console.log(name, delayTime, description, cronType);
  };
  const cancel = () => {};
  return (
    <div>
      <div className={'cron-title'}>
        <h1>크론 생성 (서비스 : {cron})</h1>
      </div>
      <div className={'co-m-pane__body'}>
        <Form>
          <FormGroup label="크론 이름" isRequired fieldId="simple-form-name-01">
            <TextInput isRequired type="text" id="simple-form-name-01" name="simple-form-name-01" aria-describedby="simple-form-name-01-helper" value={name} onChange={handleNameChange} />
          </FormGroup>
          <FormGroup label="크론 타입" fieldId="simple-form-version-03">
            <FormSelect value={cronType} onChange={handleCronChange} id="horizontal-form-title" name="horizontal-form-title" aria-label="Your title">
              {cronTypeOptions.map((option, index) => (
                <FormSelectOption isDisabled={option.disabled} key={index} value={option.value} label={option.label} />
              ))}
            </FormSelect>
          </FormGroup>
          {cronType === 'Delay' && (
            <>
              <FormGroup label="지연할 시간" fieldId="simple-form-satr-01">
                <div className={'cron-form-gr'}>
                  <TextInput className={'cron-form-in'} isRequired type="text" id="simple-form-description-01" name="simple-form-description-01" value={delayCycleTime} onChange={handleDelayCycleChange} />
                  <FormSelect className={'cron-form-in'} value={timeUnit} onChange={handleTimeUnitChange} id="horizontal-form-title" name="horizontal-form-title" aria-label="Your title">
                    {timeUnitOptions.map((option, index) => (
                      <FormSelectOption isDisabled={option.disabled} key={index} value={option.value} label={option.label} />
                    ))}
                  </FormSelect>
                </div>
              </FormGroup>
            </>
          )}
          {cronType === 'Reservation' && (
            <>
              <FormGroup label="예약 시간" fieldId="simple-form-description-01">
                <div className={'cron-form-gr'}>
                  <DatePicker dateFormat="yyyy.mm.dd HH:mm:ss" selected={startDate} onChange={(date: Date | null) => setStartDate(date)} />
                </div>
              </FormGroup>
            </>
          )}
          {(cronType === 'Delay with fixed' || cronType === 'Delay with rate') && (
            <>
              <FormGroup label="지연할 시간" fieldId="simple-form-description-01">
                <div className={'cron-form-gr'}>
                  <TextInput className={'cron-form-in'} isRequired type="text" id="simple-form-description-01" name="simple-form-description-01" value={delayTime} onChange={handleDelayChange} />
                  <FormSelect className={'cron-form-in'} value={timeUnit} onChange={handleTimeUnitChange} id="horizontal-form-title" name="horizontal-form-title" aria-label="Your title">
                    {timeUnitOptions.map((option, index) => (
                      <FormSelectOption isDisabled={option.disabled} key={index} value={option.value} label={option.label} />
                    ))}
                  </FormSelect>
                </div>
              </FormGroup>
              <FormGroup label="실행 주기" fieldId="simple-form-satr-01">
                <div className={'cron-form-gr'}>
                  <TextInput className={'cron-form-in'} isRequired type="text" id="simple-form-description-01" name="simple-form-description-01" value={delayCycleTime} onChange={handleDelayCycleChange} />
                  <FormSelect className={'cron-form-in'} value={timeCycleUnit} onChange={handleCycleTimeUnitChange} id="horizontal-form-title" name="horizontal-form-title" aria-label="Your title">
                    {timeUnitOptions.map((option, index) => (
                      <FormSelectOption isDisabled={option.disabled} key={index} value={option.value} label={option.label} />
                    ))}
                  </FormSelect>
                </div>
              </FormGroup>
              <FormGroup label="실행 수" fieldId="simple-form-satr-012">
                <div>
                  <TextInput className={'cron-form-in'} isRequired type="text" id="simple-form-description-01" name="simple-form-description-01" value={runs} onChange={handleRunChange} />
                </div>
                <div>입력하지 않을 경우 계속 실행됩니다.</div>
              </FormGroup>
            </>
          )}
          <FormGroup label="설명" fieldId="simple-form-version-01">
            <TextInput isRequired type="text" id="simple-form-version-01" name="simple-form-delayTime-01" value={description} onChange={handleDescriptionChange} />
          </FormGroup>
          <ActionGroup>
            <Button variant="primary" onClick={submit}>
              생성
            </Button>
            <Button variant="link" onClick={cancel}>
              취소
            </Button>
          </ActionGroup>
        </Form>
      </div>
    </div>
  );
};
export default withRouter(CreateCron);
