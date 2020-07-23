import * as _ from 'lodash-es';
import React, { Component } from 'react';
import * as classNames from 'classnames';
import * as PropTypes from 'prop-types';
import { StatusEditorPair } from './index';
import { Dropdown } from './';

const statuses = { approval: 'Approved', reject: 'Rejected' };

const Section = ({ label, children, id }) => (
  <div className="row" style={{ marginTop: '10px' }}>
    <div className="col-xs-2">
      <div>{label}</div>
    </div>
    <div className="col-xs-2" id={id}>
      {children}
    </div>
  </div>
);

export class ApprovalSelector extends Component {
  constructor(props) {
    super(props);

    StatusEditorPair.Status = 'Approved';
    this.onStatusChange = this.onStatusChange.bind(this);
    this.onReasonChange = this.onReasonChange.bind(this);
    this.state = {
      status: 'Approved',
      kind: 'approval',
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
    return (
      <div style={{ width: '350px' }}>
        <Dropdown title="Approved" className="btn-group" items={this.props.statuses || statuses} onChange={this.onStatusChange} />
        {/* {this.state.status === 'Reject' && (
          <Section label="Reason" id="reason">
            <p>
              <textarea cols="70" rows="3" onChange={this.onReasonChange} style={{ resize: 'none' }}></textarea>
            </p>
          </Section>
        )} */}
      </div>
    );
  }
}
