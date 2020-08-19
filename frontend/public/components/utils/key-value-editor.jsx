import * as React from 'react';
import * as _ from 'lodash-es';
import { FaMinus } from 'react-icons/fa';
import { Button } from './button';
import * as classNames from 'classnames';
import { KeyValueEditorPair } from './index';
import { is } from 'immutable';

export class KeyValueEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isDuplicated: false,
    };
    this._append = this._append.bind(this);
    this._change = this._change.bind(this);
    this._blur = this._blur.bind(this);
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
    const { isDuplicated } = this.state;
    const keyValuePairs = _.cloneDeep(this.props.keyValuePairs);
    keyValuePairs.splice(i, 1);
    if (this.state.isDuplicated) {
      let array = keyValuePairs.map(pair => pair[0]);
      if (new Set(array).size !== array.length) {
        this.setState({ isDuplicated: true });
        updateParentData({ keyValuePairs: keyValuePairs.length ? keyValuePairs : [['', '']], isDuplicated: true }, nameValueId);
      } else {
        this.setState({ isDuplicated: false });
        updateParentData({ keyValuePairs: keyValuePairs.length ? keyValuePairs : [['', '']], isDuplicated: false }, nameValueId);
      }
    } else {
      updateParentData({ keyValuePairs: keyValuePairs.length ? keyValuePairs : [['', '']], isDuplicated: false }, nameValueId);
    }
  }

  _change(e, i, type) {
    const { updateParentData, nameValueId } = this.props;
    const keyValuePairs = _.cloneDeep(this.props.keyValuePairs);
    keyValuePairs[i][type] = e.target.value;
    updateParentData({ keyValuePairs }, nameValueId);
  }
  _blur(e, i, type) {
    const { updateParentData, nameValueId } = this.props;
    const { isDuplicated } = this.state;
    const keyValuePairs = _.cloneDeep(this.props.keyValuePairs);
    //키값이 중복되는 경우
    let array = keyValuePairs.map(pair => pair[0]);
    if (new Set(array).size !== array.length) {
      this.setState({ isDuplicated: true });
      updateParentData({ keyValuePairs, isDuplicated: true }, nameValueId);
    } else {
      this.setState({ isDuplicated: false });
      updateParentData({ keyValuePairs, isDuplicated: false }, nameValueId);
    }
  }

  render() {
    const { keyString, valueString, addString, keyValuePairs, allowSorting, readOnly, isModal, nameValueId, t } = this.props;
    const { isDuplicated } = this.state;
    const portItems = keyValuePairs.map((pair, i) => {
      const key = _.get(pair, [KeyValueEditorPair.Index], i);
      return <KeyValuePairElement onChange={this._change} onBlur={this._blur} t={t} index={i} keyString={keyString} valueString={valueString} isModal={isModal} allowSorting={allowSorting} readOnly={readOnly} pair={pair} key={key} onRemove={this._remove} rowSourceId={nameValueId} />;
    });
    return (
      <React.Fragment>
        <div className="row">
          <div className={classNames(isModal ? 'col-md-5 col-xs-5 pairs-list__name-field' : 'col-md-2 col-xs-2 pairs-list__name-field')}>{t(`CONTENT:${keyString.toUpperCase()}`)}</div>
          <div className={classNames(isModal ? 'col-md-5 col-xs-5 pairs-list__name-field' : 'col-md-2 col-xs-2 pairs-list__name-field')}>{t(`CONTENT:${valueString.toUpperCase()}`)}</div>
        </div>
        {portItems}
        <div className="row">
          {isDuplicated ? (
            <div className="col-md-12 col-xs-12 cos-error-title" style={{ marginTop: '-15px' }}>
              {t(`VALIDATION:DUPLICATE-KEY`)}
            </div>
          ) : null}
        </div>
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
        </div>
      </React.Fragment>
    );
  }
}
KeyValueEditor.defaultProps = {
  keyString: 'Key',
  valueString: 'Value',
  addString: 'Add More',
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
    this._onBlurKey = this._onBlurKey.bind(this);
  }
  _onRemove(e) {
    const { index, onRemove } = this.props;
    event.preventDefault();
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
  _onBlurKey(e) {
    const { index, onBlur } = this.props;
    onBlur(e, index, KeyValueEditorPair.Key);
  }
  render() {
    const { keyString, valueString, allowSorting, readOnly, pair, t, isModal = false } = this.props;
    const deleteButton = (
      <React.Fragment>
        <Button children={<FaMinus />} onClick={this._onRemove}></Button>
        <span className="sr-only">Delete</span>
      </React.Fragment>
    );

    return (
      <div className={classNames('row', 'pairs-list__row')} ref={node => (this.node = node)}>
        <div className={classNames(isModal ? 'col-md-5 col-xs-5 pairs-list__name-field' : 'col-md-2 col-xs-2 pairs-list__name-field')}>
          <input type="text" className="form-control" placeholder={t(`CONTENT:${keyString.toUpperCase()}`)} value={pair[KeyValueEditorPair.Key]} onChange={this._onChangeKey} onBlur={this._onBlurKey} />
        </div>
        <div className={classNames(isModal ? 'col-md-5 col-xs-5 pairs-list__name-field' : 'col-md-2 col-xs-2 pairs-list__name-field')}>
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
