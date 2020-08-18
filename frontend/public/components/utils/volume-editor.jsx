import * as React from 'react';
import * as _ from 'lodash-es';
import { Button } from './button';
import { MdEdit } from 'react-icons/md';
import { FaMinus } from 'react-icons/fa';
import * as classNames from 'classnames';
import SingleSelect from '../utils/select';
import { VolumeEditorPair, VolumeModalEditorPair, VolumeModalPair } from './index';

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
      updateParentData({ volumePairs: allowSorting ? volumePairs.concat([['', '', '', false, volumePairs.length]]) : volumePairs.concat([['', '', '', false]]) }, nameValueId);
    } else {
      return;
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
    volumePairs[i][type] = e.target ? e.target.value : e.value;
    updateParentData({ volumePairs }, nameValueId);
  }
  render() {
    const { nameString, mountPathString, pvcString, readOnlyString, addString, volumePairs, allowSorting, readOnly, nameValueId, options, t } = this.props;
    const volumeItems = volumePairs.map((pair, i) => {
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
        {volumeItems}
        <div className="row">
          <div className="col-md-12 col-xs-12">
            <React.Fragment>
              <span className="btn-link pairs-list__btn" onClick={this._append}>
                <i aria-hidden="true" className="fa fa-plus-circle pairs-list__add-icon" />
                {t(`CONTENT:${addString.toUpperCase()}`)}
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
  nameValueId: 0,
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
  _onRemove(e) {
    const { index, onRemove } = this.props;
    event.preventDefault();
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
        <Button children={<FaMinus />} onClick={this._onRemove}></Button>
        <span className="sr-only">Delete</span>
      </React.Fragment>
    );

    const selectOptions = options.map(option => {
      return {
        value: option.props ? option.props.value : option.value,
        label: option.props ? option.props.children : option.children ? option.children : option.label, // 기존 폼에서는 children으로 사용, singleSelect는 label로 사용
      };
    });

    return (
      <div className={classNames('row', 'pairs-list__row')} ref={node => (this.node = node)}>
        <div className="col-md-2 col-xs-2 pairs-list__name-field">
          <input type="text" className="form-control" placeholder={t(`CONTENT:${nameString.toUpperCase()}`)} value={pair[VolumeEditorPair.Name]} onChange={this._onChangeName} />
        </div>
        <div className="col-md-2 col-xs-2 pairs-list__protocol-field">
          <input type="text" className="form-control" placeholder={t(`CONTENT:${mountPathString.toUpperCase()}`)} value={pair[VolumeEditorPair.MountPath]} onChange={this._onChangeMountPath} />
        </div>
        <div className="col-md-2 col-xs-2 pairs-list__port-field">
          {/* <select value={pair[VolumeEditorPair.PVC]} onChange={this._onChangePVC} className="form-control">
            {options}
          </select> react-select 라이브러리 사용하여 select 변경 */}
          {options && <SingleSelect options={selectOptions} name="PVC" /* placeholder={t('ADDITIONAL:SELECT', { something: 'PVC' })} */ value={pair[VolumeEditorPair.PVC]} onChange={this._onChangePVC} />}
        </div>
        <div className="col-md-2 col-xs-2 pairs-list__targetPort-field">
          <select value={pair[VolumeEditorPair.ReadOnly]} onChange={this._onChangeReadOnly} className="form-control">
            <option value="false">{t('CONTENT:NOTALLOW')}</option>
            <option value="true">{t('CONTENT:ALLOW')}</option>
          </select>
        </div>
        <div className="col-md-1 col-xs-2">
          <span className={classNames(allowSorting ? 'pairs-list__span-btns' : null)}>{allowSorting ? <React.Fragment>{deleteButton}</React.Fragment> : deleteButton}</span>
        </div>
      </div>
    );
  }
}

export class VolumeModalEditor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      currentVolumes: {
        name: '',
        type: 'EmptyDir',
        configmap: '',
        secret: '',
      },
      names: props.names,
    };

    this._append = this._append.bind(this);
    this._change = this._change.bind(this);
    this._remove = this._remove.bind(this);
    this._updateParentData = this._updateParentData.bind(this);
  }

  _updateParentData = data => {
    const { visibleData, realData, volumes, names, nameValueId, allowSorting, t, valueString } = this.props;
    let index = data.isNew ? this.props.names.length : data.index; // 수정이면 index다르게 줘야함
    const names = [...this.state.names];
    names[index][0] = data.name;
    const currentVolumes = [...this.state.currentVolumes];
    ['Name', 'Type', 'ConfigMap', 'Secret'].forEach(cur => {
      currentVolumes[index][VolumeModalPair[cur]] = data[cur.toLowerCase()];
    });

    this.setState(prevState => ({
      ...prevState,
      names,
    }));
    this.setState(prevState => ({
      ...prevState,
      currentVolumes,
    }));

    visibleData({ names }, nameValueId);
    realData(this.state.currentVolumes);
  };

  _append(event) {
    const { volumes, names, nameValueId, allowSorting, t, valueString } = this.props;

    names = typeof names === 'string' ? [['']] : names.concat([['']]);
    volumes = typeof volumes === 'string' ? [['', '', '', '']] : volumes.concat([['', '', '', '']]);
    this.setState(prevState => ({
      ...prevState,
      names,
      currentVolumes: volumes,
    }));

    import('./../modals/volume-modal').then(m => {
      m.VolumeModal({
        title: t(`CONTENT:${valueString.toUpperCase()}`),
        isNew: true,
        updateParentData: this._updateParentData,
      });
    });
  }

  _change(e, i) {
    const { volumes, names, nameValueId, allowSorting, t, valueString } = this.props;

    import('./../modals/volume-modal').then(m => {
      m.VolumeModal({
        title: t(`CONTENT:${valueString.toUpperCase()}`),
        volume: volumes[i],
        isNew: false,
        updateParentData: this._updateParentData,
        index: i,
      });
    });
  }

  _remove(i) {
    const { visibleData, realData, nameValueId } = this.props;
    const names = _.cloneDeep(this.props.names);
    const volumes = _.cloneDeep(this.props.volumes);
    names.splice(i, 1);
    volumes.splice(i, 1);
    visibleData({ names });
    realData(volumes);
  }

  render() {
    const { desc, title, valueString, addString, names, allowSorting, readOnly, nameValueId, t } = this.props;
    const portItems =
      names &&
      names.map((pair, i) => {
        const key = _.get(pair, [VolumeModalEditorPair.Index], i);
        return <VolumeModalElement onChange={this._change} index={i} t={t} valueString={valueString} allowSorting={allowSorting} readOnly={readOnly} pair={pair} key={key} onRemove={this._remove} rowSourceId={nameValueId} />;
      });
    return (
      <React.Fragment>
        <div className="row">{title !== 'false' && <div className="col-md-2 col-xs-2 text-secondary">{t(`CONTENT:${valueString.toUpperCase()}`)}</div>}</div>
        {portItems}
        <span>{desc}</span>
        <div className="row">
          <div className="col-md-12 col-xs-12">
            {/* {readOnly ? null : ( */}
            {
              <React.Fragment>
                <span className="btn-link pairs-list__btn" onClick={this._append}>
                  <i aria-hidden="true" className="fa fa-plus-circle pairs-list__add-icon" />
                  {t(`CONTENT:${addString.toUpperCase()}`)}
                </span>
              </React.Fragment>
            }
          </div>
        </div>
      </React.Fragment>
    );
  }
}
VolumeModalEditor.defaultProps = {
  valueString: 'Value',
  addString: 'AddMore',
  allowSorting: false,
  readOnly: true,
  nameValueId: 0,
};

class VolumeModalElement extends React.Component {
  constructor(props) {
    super(props);
    this._onRemove = this._onRemove.bind(this);
    this._onEdit = this._onEdit.bind(this);
  }
  _onRemove(e) {
    const { index, onRemove } = this.props;
    event.preventDefault();
    onRemove(index);
  }
  _onEdit(e) {
    const { index, onChange } = this.props;
    event.preventDefault();
    onChange(e, index);
  }
  render() {
    const { keyString, valueString, allowSorting, readOnly, pair, t } = this.props;
    const deleteButton = (
      <React.Fragment>
        <Button children={<FaMinus />} onClick={this._onRemove}></Button>
        {/* <Button children={<FaMinus />} onClick={this._onRemove}></Button> */}
        <span className="sr-only">Delete</span>
      </React.Fragment>
    );
    const editButton = (
      <React.Fragment>
        <Button children={<MdEdit />} onClick={this._onEdit}></Button>
        {/* <i className="fa fa-pencil-square pairs-list__side-btn" aria-hidden="true" onClick={this._onEdit}></i> */}
        <span className="sr-only">Edit</span>
      </React.Fragment>
    );

    return (
      <div className={classNames('row')} ref={node => (this.node = node)}>
        <div className="col-md-4 col-xs-4 pairs-list__protocol-field">
          <input type="text" className="form-control" placeholder={t(`CONTENT:${valueString.toUpperCase()}`)} value={pair[VolumeModalEditorPair.Value] || ''} onChange={this._onChangeValue} disabled />
        </div>
        {/* {readOnly ? null : ( */}
        {
          <div className="col-md-1 col-xs-2 wrap-content">
            <span className={classNames(allowSorting ? 'pairs-list__span-btns' : null)}>{allowSorting ? <React.Fragment>{editButton}</React.Fragment> : editButton}</span>
            <span className={classNames(allowSorting ? 'pairs-list__span-btns' : null)}>{allowSorting ? <React.Fragment>{deleteButton}</React.Fragment> : deleteButton}</span>
          </div>
        }
      </div>
    );
  }
}
