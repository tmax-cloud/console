import * as _ from 'lodash-es';
import React, { Component } from 'react';
import * as classNames from 'classnames';
import * as PropTypes from 'prop-types';
import { StatusEditorPair } from './index';
import { Dropdown } from './';


const statuses = { success: 'Success', reject: 'Reject' };

const Section = ({ label, children, id }) => <div className="row">
  <div className="col-xs-2">
    <div>{label}</div>
  </div>
  <div className="col-xs-2" id={id}>
    {children}
  </div>
</div>;

export class StatusSelector extends Component {
  constructor(props) {
    super(props);

    StatusEditorPair.Status = 'Success';
    this.onStatusChange = this.onStatusChange.bind(this);
    this.onReasonChange = this.onReasonChange.bind(this);
    this.state = {
      status: 'Success',
      kind: 'success'
    };
  }

  onStatusChange(e, i) {
    // this.setState({ status: e });
    StatusEditorPair.Status = i.target.text;
    this.setState({ status: i.target.text });
  }

  onReasonChange(e) {
    e.preventDefault();
    StatusEditorPair.Reason = e.target.value;
  }

  render() {
    return <div>
      <Dropdown title="Success" className="btn-group" items={statuses} onChange={this.onStatusChange} />
      {this.state.status === 'Reject' && <Section label="Reason" id="reason">
        <p><textarea cols="30" rows="5" onChange={this.onReasonChange}></textarea></p>
      </Section>}
    </div>;

  }
}
