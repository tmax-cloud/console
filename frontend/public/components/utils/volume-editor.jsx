import * as React from 'react';
import * as _ from 'lodash-es';
import * as classNames from 'classnames';
import { VolumeEditorPair } from './index';

export class VolumeEditor extends React.Component {
  constructor(props) {
    super(props);
    this._append = this._append.bind(this);
    this._change = this._change.bind(this);
    this._remove = this._remove.bind(this);
  }
  _append(event) {
    const { updateParentData, volumePairs, nameValueId, allowSorting, options } = this.props;
    let listLength = this.props.volumePairs.length;
    if (listLength < options.length) {
      updateParentData({ volumePairs: allowSorting ? volumePairs.concat([['', '', '', '', volumePairs.length]]) : volumePairs.concat([['', '', '', '']]) }, nameValueId);
    } else {
      return
    }
  }

  _remove(i) {
    const { updateParentData, nameValueId } = this.props;
    const volumePairs = _.cloneDeep(this.props.volumePairs);
    volumePairs.splice(i, 1);
    updateParentData({ volumePairs: volumePairs.length ? volumePairs : [['', '']] }, nameValueId);
  }

  _change(e, i, type) {
    const { updateParentData, nameValueId } = this.props;
    const volumePairs = _.cloneDeep(this.props.volumePairs);
    volumePairs[i][type] = e.target.value;
    updateParentData({ volumePairs }, nameValueId);
  }
  render() {
    const { nameString, mountPathString, pvcString, readOnlyString, addString, volumePairs, allowSorting, readOnly, nameValueId, options, t } = this.props;
    const portItems = volumePairs.map((pair, i) => {
      const key = _.get(pair, [VolumeEditorPair.Index], i);
      return <VolumePairElement onChange={this._change} index={i} t={t} nameString={nameString} mountPathString={mountPathString} pvcString={pvcString} readOnlyString={readOnlyString} allowSorting={allowSorting} pair={pair} key={key} onRemove={this._remove} rowSourceId={nameValueId} options={options} />;
    });
    return (
      <React.Fragment>
        <div className="row">
          <div className="col-md-2 col-xs-2 text-secondary">{t(`CONTENT:${nameString.toUpperCase()}`)}</div>
          <div className="col-md-2 col-xs-2 text-secondary">{t(`CONTENT:${mountPathString.toUpperCase()}`)}</div>
          <div className="col-md-2 col-xs-2 text-secondary">{t(`CONTENT:${pvcString.toUpperCase()}`)}</div>
          <div className="col-md-2 col-xs-2 text-secondary">{t(`CONTENT:${readOnlyString.toUpperCase()}`)}</div>
        </div>
        {portItems}
        <div className="row">
          <div className="col-md-12 col-xs-12">
            <React.Fragment>
              <span className="btn-link pairs-list__btn" onClick={this._append}>
                <i aria-hidden="true" className="fa fa-plus-circle pairs-list__add-icon" />
                {addString}
              </span>
            </React.Fragment>
          </div>
        </div>
      </React.Fragment>
    );
  }
}
VolumeEditor.defaultProps = {
  nameString: 'VolumeName',
  mountPathString: 'MountPath',
  pvcString: 'PVC',
  readOnlyString: 'ReadOnly',
  addString: 'AddMore',
  allowSorting: false,
  nameValueId: 0
};

class VolumePairElement extends React.Component {
  constructor(props) {
    super(props);
    this._onRemove = this._onRemove.bind(this);
    this._onChangeName = this._onChangeName.bind(this);
    this._onChangeMountPath = this._onChangeMountPath.bind(this);
    this._onChangePVC = this._onChangePVC.bind(this);
    this._onChangeReadOnly = this._onChangeReadOnly.bind(this);
  }
  _onRemove() {
    const { index, onRemove } = this.props;
    onRemove(index);
  }
  _onChangeName(e) {
    const { index, onChange } = this.props;
    onChange(e, index, VolumeEditorPair.Name);
  }
  _onChangeMountPath(e) {
    const { index, onChange } = this.props;
    onChange(e, index, VolumeEditorPair.MountPath);
  }
  _onChangePVC(e) {
    const { index, onChange } = this.props;
    onChange(e, index, VolumeEditorPair.PVC);
  }
  _onChangeReadOnly(e) {
    const { index, onChange } = this.props;
    onChange(e, index, VolumeEditorPair.ReadOnly);
  }

  render() {
    const { nameString, mountPathString, allowSorting, pair, options, t } = this.props;
    const deleteButton = (
      <React.Fragment>
        <i className="fa fa-minus-circle pairs-list__side-btn pairs-list__delete-icon" aria-hidden="true" onClick={this._onRemove}></i>
        <span className="sr-only">Delete</span>
      </React.Fragment>
    );

    return (
      <div className={classNames('row', 'pairs-list__row')} ref={node => (this.node = node)}>
        <div className="col-md-2 col-xs-2 pairs-list__name-field">
          <input type="text" className="form-control" placeholder={t(`CONTENT:${nameString.toUpperCase()}`)} value={pair[VolumeEditorPair.Name]} onChange={this._onChangeName} />
        </div>
        <div className="col-md-2 col-xs-2 pairs-list__protocol-field">
          <input type="text" className="form-control" placeholder={t(`CONTENT:${mountPathString.toUpperCase()}`)} value={pair[VolumeEditorPair.MountPath]} onChange={this._onChangeMountPath} />
        </div>
        <div className="col-md-2 col-xs-2 pairs-list__port-field">
          <select value={pair[VolumeEditorPair.PVC]} onChange={this._onChangePVC} className="form-control">
            {options}
          </select>
        </div>
        <div className="col-md-2 col-xs-2 pairs-list__targetPort-field">
          <select value={pair[VolumeEditorPair.ReadOnly]} onChange={this._onChangeReadOnly} className="form-control">
            <option value='false'>False</option>
            <option value='true'>True</option>
          </select>
        </div>
        <div className="col-md-1 col-xs-2">
          <span className={classNames(allowSorting ? 'pairs-list__span-btns' : null)}>{allowSorting ? <React.Fragment>{deleteButton}</React.Fragment> : deleteButton}</span>
        </div>
      </div>
    );
  }
}
