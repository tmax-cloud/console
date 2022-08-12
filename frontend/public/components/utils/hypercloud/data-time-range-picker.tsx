// import * as React from 'react';
// //import { Flex, FlexItem, InputGroup, DatePicker, isValidDate, TimePicker, yyyyMMddFormat, updateDateTime } from '@patternfly/react-core';
// import { Flex, FlexItem, InputGroup, isValidDate, TimePicker, yyyyMMddFormat, updateDateTime } from '@patternfly/react-core';
// import DatePicker from 'react-datepicker';
// import 'react-datepicker/dist/react-datepicker.css';

// export const DateTimeRangePicker = () => {
//   const [from, setFrom] = React.useState();
//   const [to, setTo] = React.useState();

//   const toValidator = date => {
//     return isValidDate(from) && yyyyMMddFormat(date) >= yyyyMMddFormat(from) ? '' : 'To date must after from date';
//   };
  
//   const onFromDateChange = (inputDate, newFromDate) => {
//     if (isValidDate(from) && isValidDate(newFromDate) && inputDate === yyyyMMddFormat(newFromDate)) {
//       newFromDate.setHours(from.getHours());
//       newFromDate.setMinutes(from.getMinutes());
//     }
//     if (isValidDate(newFromDate) && inputDate === yyyyMMddFormat(newFromDate)) {
//       setFrom(new Date(newFromDate));
//     }
//   };
  
//   const onFromTimeChange = (time, hour, minute) => {
//     if (isValidDate(from)) {
//       const updatedFromDate = new Date(from);
//       updatedFromDate.setHours(hour);
//       updatedFromDate.setMinutes(minute);
//       setFrom(updatedFromDate);
//     }
//   };

//   const onToDateChange = (inputDate, newToDate) => {
//     if (isValidDate(to) && isValidDate(newToDate) && inputDate === yyyyMMddFormat(newToDate)) {
//       newToDate.setHours(to.getHours());
//       newToDate.setMinutes(to.getMinutes());
//     }
//     if (isValidDate(newToDate) && inputDate === yyyyMMddFormat(newToDate)){
//       setTo(newToDate);
//     }
//   };
  
//   const onToTimeChange = (time, hour, minute) => {
//     if (isValidDate(to)) {
//       const updatedToDate = new Date(to);
//       updatedToDate.setHours(hour);
//       updatedToDate.setMinutes(minute);
//       setTo(updatedToDate);
//     }
//   };

//   return (
//     <Flex direction={{default: 'column', lg: 'row'}}>
//       <FlexItem>
//         <InputGroup>
//           <DatePicker
//             onChange={onFromDateChange}
//             aria-label="Start date"
//             placeholder="YYYY-MM-DD"
//           />
//           <TimePicker 
//             aria-label="Start time"
//             style={{width: '150px'}} 
//             onChange={onFromTimeChange} 
//           />
//         </InputGroup>
//       </FlexItem>
//       <FlexItem>
//         to
//       </FlexItem>
//       <FlexItem>
//         <InputGroup>
//           <DatePicker
//             value={isValidDate(to) ? yyyyMMddFormat(to) : to}
//             onChange={onToDateChange}
//             isDisabled={!isValidDate(from)}
//             rangeStart={from}
//             validators={[toValidator]}
//             aria-label="End date"
//             placeholder="YYYY-MM-DD"
//           />
//           <TimePicker style={{width: '150px'}} onChange={onToTimeChange} isDisabled={!isValidDate(from)}/>
//         </InputGroup>
//       </FlexItem>
//     </Flex>
//   );
// }