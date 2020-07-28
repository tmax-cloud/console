import * as React from 'react';
import * as _ from 'lodash-es';
import * as classNames from 'classnames';
import { SelectKeyValueEditorPair } from './index';
import SingleSelect from './select';

export class SelectKeyValueEditor extends React.Component {
  constructor(props) {
    super(props);
    this._append = this._append.bind(this);
    this._change = this._change.bind(this);
    this._remove = this._remove.bind(this);
  }
  _append() {
    const { updateParentData, keyValuePairs, nameValueId } = this.props;
    updateParentData({ keyValuePairs: keyValuePairs.concat([['', '']]) }, nameValueId);
  }

  _remove(i) {
    const { updateParentData, nameValueId } = this.props;
    const keyValuePairs = _.cloneDeep(this.props.keyValuePairs);
    keyValuePairs.splice(i, 1);
    updateParentData({ keyValuePairs: keyValuePairs.length ? keyValuePairs : [['', '']] }, nameValueId);
  }

  _change(e, i, type, isSelect = false) {
    const { updateParentData, nameValueId } = this.props;
    const keyValuePairs = _.cloneDeep(this.props.keyValuePairs);
    keyValuePairs[i][type] = isSelect ? e.value : e.target.value;
    updateParentData({ keyValuePairs }, nameValueId);
  }
  render() {
    const { keyString, valueString, addString, keyValuePairs, allowSorting, readOnly, nameValueId, t, options } = this.props;
    const keyValueItems = keyValuePairs.map((pair, i) => {
      const key = _.get(pair, [SelectKeyValueEditorPair.Index], i);
      return <SelectKeyValuePairElement options={options} onChange={this._change} t={t} index={i} keyString={keyString} valueString={valueString} allowSorting={allowSorting} readOnly={readOnly} pair={pair} key={key} onRemove={this._remove} rowSourceId={nameValueId} />;
    });
    return (
      <React.Fragment>
        {keyValueItems}
        <div className="row">
          <div className="col-md-12 col-xs-12">
            {readOnly ? null : (
              <React.Fragment>
                <span className="btn-link pairs-list__btn" onClick={this._append}>
                  <i aria-hidden="true" className="fa fa-plus-circle pairs-list__add-icon" />
                  {t(`CONTENT:${addString.replace(/ /gi, '').toUpperCase()}`)}
                </span>
              </React.Fragment>
            )}
          </div>
          <div className="col-md-12 col-xs-12">
            {this.props.desc ? <span>{this.props.desc}</span> : ''}
          </div>
        </div>
      </React.Fragment>
    );
  }
}
SelectKeyValueEditor.defaultProps = {
  keyString: 'Key',
  valueString: 'Value',
  addString: 'Add More',
  allowSorting: false,
  readOnly: false,
  nameValueId: 0,
};

class SelectKeyValuePairElement extends React.Component {
  constructor(props) {
    super(props);
    this._onRemove = this._onRemove.bind(this);
    this._onChangeSelect = this._onChangeSelect.bind(this);
    this._onChangeKey = this._onChangeKey.bind(this);
    this._onChangeValue = this._onChangeValue.bind(this);
  }
  _onRemove() {
    const { index, onRemove } = this.props;
    onRemove(index);
  }
  _onChangeSelect(e) {
    const { index, onChange } = this.props;
    onChange(e, index, SelectKeyValueEditorPair.Select, true);
  }

  _onChangeKey(e) {
    const { index, onChange } = this.props;
    onChange(e, index, SelectKeyValueEditorPair.Key);
  }

  _onChangeValue(e) {
    const { index, onChange } = this.props;
    onChange(e, index, SelectKeyValueEditorPair.Value);
  }
  render() {
    const { keyString, valueString, allowSorting, readOnly, pair, t, options } = this.props;
    const deleteButton = (
      <React.Fragment>
        <i className="fa fa-minus-circle pairs-list__side-btn pairs-list__delete-icon" aria-hidden="true" onClick={this._onRemove}></i>
        <span className="sr-only">Delete</span>
      </React.Fragment>
    );

    return (
      <div className={classNames('row', 'pairs-list__row')} ref={node => (this.node = node)}>
        <div className="col-md-2 col-xs-2 pairs-list__name-field">
          <SingleSelect options={options} value={pair[SelectKeyValueEditorPair.Select]} name={''} placeholder={t(`CONTENT:${keyString.toUpperCase()}`)} onChange={this._onChangeSelect} />
        </div>
        { pair[SelectKeyValueEditorPair.Select] === 'etc' ? <div className="col-md-2 col-xs-2 pairs-list__protocol-field">
          <input type="text" className="form-control" placeholder={t(`CONTENT:${keyString.toUpperCase()}`)} value={pair[SelectKeyValueEditorPair.Key] || ''} onChange={this._onChangeKey} />
        </div> : ''}
        <div className="col-md-2 col-xs-2 pairs-list__protocol-field">
          <input type="text" className="form-control" placeholder={t(`CONTENT:${valueString.toUpperCase()}`)} value={pair[SelectKeyValueEditorPair.Value] || ''} onChange={this._onChangeValue} />
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
