import * as _ from 'lodash-es';
import React, { Component } from 'react';
import * as classNames from 'classnames';
import * as PropTypes from 'prop-types';
import { StatusEditorPair } from './index';
import { Dropdown } from './';


const statuses = { success: 'Success', reject: 'Reject' };

export class StatusSelector extends Component {
  constructor(props) {
    super(props);

    StatusEditorPair.Status = 'Success';

    this.state = {
      status: 'success',
      kind: 'success'
    };
  }

  _change(e, i) {
    // this.setState({ status: e });
    StatusEditorPair.Status = i.target.text;
  }

  render() {
    return <div>
      <Dropdown title="Success" className="btn-group" items={statuses} onChange={this._change} />

    </div>;

  }
}
