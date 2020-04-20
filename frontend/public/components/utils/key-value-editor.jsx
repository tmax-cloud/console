import * as React from 'react';
import * as _ from 'lodash-es';
import * as classNames from 'classnames';
import { KeyValueEditorPair } from './index';

export class KeyValueEditor extends React.Component {
  constructor(props) {
    super(props);
    this._append = this._append.bind(this);
    this._change = this._change.bind(this);
    this._remove = this._remove.bind(this);
  }
  _append(event) {
    const { updateParentData, keyValuePairs, nameValueId, allowSorting } = this.props;
    let lastIndex = this.props.keyValuePairs.length - 1;
    let lastData = this.props.keyValuePairs[lastIndex];
    updateParentData({ keyValuePairs: allowSorting ? portPairs.concat([['', '', keyValuePairs.length]]) : keyValuePairs.concat([['', '']]) }, nameValueId);
  }

  _remove(i) {
    const { updateParentData, nameValueId } = this.props;
    const keyValuePairs = _.cloneDeep(this.props.keyValuePairs);
    keyValuePairs.splice(i, 1);
    updateParentData({ keyValuePairs: keyValuePairs.length ? keyValuePairs : [['', '']] }, nameValueId);
  }

  _change(e, i, type) {
    const { updateParentData, nameValueId } = this.props;
    const keyValuePairs = _.cloneDeep(this.props.keyValuePairs);
    keyValuePairs[i][type] = e.target.value;
    updateParentData({ keyValuePairs }, nameValueId);
  }
  render() {
    const { keyString, valueString, addString, keyValuePairs, allowSorting, readOnly, nameValueId, t } = this.props;
    const portItems = keyValuePairs.map((pair, i) => {
      const key = _.get(pair, [KeyValueEditorPair.Index], i);
      return <KeyValuePairElement onChange={this._change} t={t} index={i} keyString={keyString} valueString={valueString} allowSorting={allowSorting} readOnly={readOnly} pair={pair} key={key} onRemove={this._remove} rowSourceId={nameValueId} />;
    });
    return (
      <React.Fragment>
        <div className="row">
          <div className="col-md-2 col-xs-2 text-secondary">{t(`CONTENT:${keyString.toUpperCase()}`)}</div>
          <div className="col-md-2 col-xs-2 text-secondary">{t(`CONTENT:${valueString.toUpperCase()}`)}</div>
        </div>
        {portItems}
        <div className="row">
          <div className="col-md-12 col-xs-12">
            {readOnly ? null : (
              <React.Fragment>
                <span className="btn-link pairs-list__btn" onClick={this._append}>
                  <i aria-hidden="true" className="fa fa-plus-circle pairs-list__add-icon" />
                  {t('CONTENT:ADDMORE')}
                </span>
              </React.Fragment>
            )}
          </div>
        </div>
      </React.Fragment>
    );
  }
}
KeyValueEditor.defaultProps = {
  keyString: 'Key',
  valueString: 'Value',
  addString: 'AddMore',
  allowSorting: false,
  readOnly: false,
  nameValueId: 0,
};

class KeyValuePairElement extends React.Component {
  constructor(props) {
    super(props);
    this._onRemove = this._onRemove.bind(this);
    this._onChangeKey = this._onChangeKey.bind(this);
    this._onChangeValue = this._onChangeValue.bind(this);
  }
  _onRemove() {
    const { index, onRemove } = this.props;
    onRemove(index);
  }
  _onChangeKey(e) {
    const { index, onChange } = this.props;
    onChange(e, index, KeyValueEditorPair.Key);
  }
  _onChangeValue(e) {
    const { index, onChange } = this.props;
    onChange(e, index, KeyValueEditorPair.Value);
  }
  render() {
    const { keyString, valueString, allowSorting, readOnly, pair, t } = this.props;
    const deleteButton = (
      <React.Fragment>
        <i className="fa fa-minus-circle pairs-list__side-btn pairs-list__delete-icon" aria-hidden="true" onClick={this._onRemove}></i>
        <span className="sr-only">Delete</span>
      </React.Fragment>
    );

    return (
      <div className={classNames('row', 'pairs-list__row')} ref={node => (this.node = node)}>
        <div className="col-md-2 col-xs-2 pairs-list__name-field">
          <input type="text" className="form-control" placeholder={t(`CONTENT:${keyString.toUpperCase()}`)} value={pair[KeyValueEditorPair.Key]} onChange={this._onChangeKey} />
        </div>
        <div className="col-md-2 col-xs-2 pairs-list__protocol-field">
          <input type="text" className="form-control" placeholder={t(`CONTENT:${valueString.toUpperCase()}`)} value={pair[KeyValueEditorPair.Value] || ''} onChange={this._onChangeValue} />
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
