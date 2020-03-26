import * as React from 'react';
import * as _ from 'lodash-es';
import * as classNames from 'classnames';
import { PortEditorPair } from './index';

export class PortEditor extends React.Component {
  constructor(props) {
    super(props);
    this._append = this._append.bind(this);
    this._change = this._change.bind(this);
    this._remove = this._remove.bind(this);
  }
  _append(event) {
    const { updateParentData, portPairs, nameValueId, allowSorting } = this.props;
    let lastIndex = this.props.portPairs.length - 1;
    let lastData = this.props.portPairs[lastIndex];
    if (lastData[0] !== '' && lastData[1] !== '') {
      lastData[2] === '' ? lastData[2] = 'TCP' : lastData[2];
      lastData[3] === '' ? lastData[3] = lastData[1] : lastData[3];
      updateParentData({ portPairs: allowSorting ? portPairs.concat([['', '', 'TCP', '', portPairs.length]]) : portPairs.concat([['', '', '', '']]) }, nameValueId);
    } else {
      return
    }
  }

  _remove(i) {
    const { updateParentData, nameValueId } = this.props;
    const portPairs = _.cloneDeep(this.props.portPairs);
    portPairs.splice(i, 1);
    updateParentData({ portPairs: portPairs.length ? portPairs : [['', '']] }, nameValueId);
  }

  _change(e, i, type) {
    const { updateParentData, nameValueId } = this.props;
    const portPairs = _.cloneDeep(this.props.portPairs);
    portPairs[i][type] = e.target.value;
    updateParentData({ portPairs }, nameValueId);
  }
  render() {
    const { nameString, protocolString, portString, targetPortString, addString, portPairs, allowSorting, readOnly, nameValueId } = this.props;
    const portItems = portPairs.map((pair, i) => {
      const key = _.get(pair, [PortEditorPair.Index], i);
      return <PortPairElement onChange={this._change} index={i} nameString={nameString} protocolString={protocolString} portString={portString} targetPortString={targetPortString} allowSorting={allowSorting} readOnly={readOnly} pair={pair} key={key} onRemove={this._remove} rowSourceId={nameValueId} />;
    });
    return (
      <React.Fragment>
        <div className="row">
          <div className="col-md-2 col-xs-2 text-secondary">{nameString.toUpperCase()}</div>
          <div className="col-md-2 col-xs-2 text-secondary">{portString.toUpperCase()}</div>
          <div className="col-md-2 col-xs-2 text-secondary">{protocolString.toUpperCase()}</div>
          <div className="col-md-2 col-xs-2 text-secondary">{targetPortString.toUpperCase()}</div>
        </div>
        {portItems}
        <div className="row">
          <div className="col-md-12 col-xs-12">
            {readOnly ? null : (
              <React.Fragment>
                <span className="btn-link pairs-list__btn" onClick={this._append}>
                  <i aria-hidden="true" className="fa fa-plus-circle pairs-list__add-icon" />
                  {addString}
                </span>
              </React.Fragment>
            )}
          </div>
        </div>
      </React.Fragment>
    );
  }
}
PortEditor.defaultProps = {
  nameString: 'Name',
  protocolString: 'Protocol',
  portString: 'Port',
  targetPortString: 'TargetPort',
  addString: 'Add More',
  allowSorting: false,
  readOnly: false,
  nameValueId: 0
};

class PortPairElement extends React.Component {
  constructor(props) {
    super(props);
    this._onRemove = this._onRemove.bind(this);
    this._onChangeName = this._onChangeName.bind(this);
    this._onChangeProtocol = this._onChangeProtocol.bind(this);
    this._onChangePort = this._onChangePort.bind(this);
    this._onChangeTargetPort = this._onChangeTargetPort.bind(this);
  }
  _onRemove() {
    const { index, onRemove } = this.props;
    onRemove(index);
  }
  _onChangeName(e) {
    const { index, onChange } = this.props;
    onChange(e, index, PortEditorPair.Name);
  }
  _onChangeProtocol(e) {
    const { index, onChange } = this.props;
    onChange(e, index, PortEditorPair.Protocol);
  }
  _onChangePort(e) {
    const { index, onChange } = this.props;
    onChange(e, index, PortEditorPair.Port);
  }
  _onChangeTargetPort(e) {
    const { index, onChange } = this.props;
    onChange(e, index, PortEditorPair.TargetPort);
  }

  render() {
    const { nameString, portString, targetPortString, allowSorting, readOnly, pair } = this.props;
    const deleteButton = (
      <React.Fragment>
        <i className="fa fa-minus-circle pairs-list__side-btn pairs-list__delete-icon" aria-hidden="true" onClick={this._onRemove}></i>
        <span className="sr-only">Delete</span>
      </React.Fragment>
    );

    return (
      <div className={classNames('row', 'pairs-list__row')} ref={node => (this.node = node)}>
        <div className="col-md-2 col-xs-2 pairs-list__name-field">
          <input type="text" className="form-control" required placeholder={nameString.toLowerCase()} value={pair[PortEditorPair.Name]} onChange={this._onChangeName} disabled={readOnly} />
        </div>
        <div className="col-md-2 col-xs-2 pairs-list__protocol-field">
          <input type="text" className="form-control" required placeholder={portString.toLowerCase()} value={pair[PortEditorPair.Port] || ''} onChange={this._onChangePort} disabled={readOnly} />
        </div>
        <div className="col-md-2 col-xs-2 pairs-list__port-field">
          <select value={pair[PortEditorPair.Protocol]} onChange={this._onChangeProtocol} disabled={readOnly} className="form-control" id="protocol">
            <option value='TCP'>TCP</option>
            <option value='UDP'>UDP</option>
            <option value='SCDP'>SCDP</option>
          </select>
        </div>
        <div className="col-md-2 col-xs-2 pairs-list__targetPort-field">
          <input type="text" className="form-control" placeholder={targetPortString.toLowerCase()} value={pair[PortEditorPair.TargetPort] || ''} onChange={this._onChangeTargetPort} disabled={readOnly} />
        </div>

        {readOnly ? null : (
          <div className="col-md-1 col-xs-2">
            <span className={classNames(allowSorting ? 'pairs-list__span-btns' : null)}>{allowSorting ? <React.Fragment>{deleteButton}</React.Fragment> : deleteButton}</span>
          </div>
        )}
      </div>
    );
  }
}
