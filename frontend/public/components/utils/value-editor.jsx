import * as React from 'react';
import * as _ from 'lodash-es';
import * as classNames from 'classnames';
import { ValueEditorPair } from './index';

export class ValueEditor extends React.Component {
  constructor(props) {
    super(props);
    this._append = this._append.bind(this);
    this._change = this._change.bind(this);
    this._remove = this._remove.bind(this);
  }
  _append(event) {
    const { updateParentData, values, nameValueId, allowSorting } = this.props;
    let lastIndex = this.props.values.length - 1;
    let lastData = this.props.values[lastIndex];
    updateParentData({ values: allowSorting ? portPairs.concat([['', values.length]]) : values.concat([['']]) }, nameValueId);
  }

  _remove(i) {
    const { updateParentData, nameValueId } = this.props;
    const values = _.cloneDeep(this.props.values);
    values.splice(i, 1);
    updateParentData({ values: values.length ? values : [['', '']] }, nameValueId);
  }

  _change(e, i, type) {
    const { updateParentData, nameValueId } = this.props;
    const values = _.cloneDeep(this.props.values);
    values[i][type] = e.target.value;
    updateParentData({ values }, nameValueId);
  }
  render() {
    const { valueString, addString, values, allowSorting, readOnly, nameValueId } = this.props;
    const portItems = values.map((pair, i) => {
      const key = _.get(pair, [ValueEditorPair.Index], i);
      return <ValuePairElement onChange={this._change} index={i} valueString={valueString} allowSorting={allowSorting} readOnly={readOnly} pair={pair} key={key} onRemove={this._remove} rowSourceId={nameValueId} />;
    });
    return (
      <React.Fragment>
        <div className="row">
          <div className="col-md-2 col-xs-2 text-secondary">{valueString.toUpperCase()}</div>
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
ValueEditor.defaultProps = {
  valueString: 'Value',
  addString: 'Add More',
  allowSorting: false,
  readOnly: false,
  nameValueId: 0
};

class ValuePairElement extends React.Component {
  constructor(props) {
    super(props);
    this._onRemove = this._onRemove.bind(this);
    this._onChangeValue = this._onChangeValue.bind(this);
  }
  _onRemove() {
    const { index, onRemove } = this.props;
    onRemove(index);
  }
  _onChangeValue(e) {
    const { index, onChange } = this.props;
    onChange(e, index, ValueEditorPair.Value);
  }
  render() {
    const { keyString, valueString, allowSorting, readOnly, pair } = this.props;
    const deleteButton = (
      <React.Fragment>
        <i className="fa fa-minus-circle pairs-list__side-btn pairs-list__delete-icon" aria-hidden="true" onClick={this._onRemove}></i>
        <span className="sr-only">Delete</span>
      </React.Fragment>
    );

    return (
      <div className={classNames('row', 'pairs-list__row')} ref={node => (this.node = node)}>
        <div className="col-md-8 col-xs-8 pairs-list__protocol-field">
          <input type="text" className="form-control" placeholder={valueString.toLowerCase()} value={pair[ValueEditorPair.Value] || ''} onChange={this._onChangeValue} />
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
