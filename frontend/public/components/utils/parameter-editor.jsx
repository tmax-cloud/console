import * as React from 'react';
import * as _ from 'lodash-es';
import { Button } from './button';
import { MdEdit } from 'react-icons/md';
import { FaMinus } from 'react-icons/fa';
import * as classNames from 'classnames';
import { ParameterModalEditorPair, ParameterModalPair } from './index';

export class ParameterModalEditor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      currentParameters: {
        name: '',
        type: '',
        description: '',
        default: '',
      },
      names: props.names,
    };

    this._append = this._append.bind(this);
    this._change = this._change.bind(this);
    this._remove = this._remove.bind(this);
    this._updateParentData = this._updateParentData.bind(this);
  }

  _updateParentData = data => {
    const { visibleData, realData, names, nameValueId, allowSorting, t, valueString } = this.props;
    let index = data.isNew ? this.props.names.length : data.index; // 수정이면 index다르게 줘야함
    const names = [...this.state.names];
    names[index][0] = data.name;
    const currentParameters = [...this.state.currentParameters];
    ['Name', 'Description', 'Type', 'Default'].forEach(cur => {
      currentParameters[index][ParameterModalPair[cur]] = data[cur.toLowerCase()];
      console.log([ParameterModalPair[cur]]);
    });

    this.setState(prevState => ({
      ...prevState,
      names,
    }));
    this.setState(prevState => ({
      ...prevState,
      currentParameters,
    }));

    visibleData({ names }, nameValueId);
    realData(this.state.currentParameters);
  };

  _append(event) {
    const { parameters, names, nameValueId, allowSorting, t, valueString } = this.props;

    names = typeof names === 'string' ? [['']] : names.concat([['']]);
    parameters = typeof parameters === 'string' ? [['', '', '', '']] : parameters.concat([['', '', '', '']]);
    this.setState(prevState => ({
      ...prevState,
      names,
      currentParameters: parameters,
    }));

    import('./../modals/parameter-modal').then(m => {
      m.ParameterModal({
        title: t(`CONTENT:${valueString.toUpperCase()}`),
        isNew: true,
        updateParentData: this._updateParentData,
      });
    });
  }

  _change(e, i) {
    const { parameters, names, nameValueId, allowSorting, t, valueString } = this.props;

    import('./../modals/parameter-modal').then(m => {
      m.ParameterModal({
        title: t(`CONTENT:${valueString.toUpperCase()}`),
        parameter: parameters[i],
        isNew: false,
        updateParentData: this._updateParentData,
        index: i,
      });
    });
  }

  _remove(i) {
    const { visibleData, realData, nameValueId } = this.props;
    const names = _.cloneDeep(this.props.names);
    const parameters = _.cloneDeep(this.props.parameters);
    names.splice(i, 1);
    parameters.splice(i, 1);
    visibleData({ names });
    realData(parameters);
  }

  render() {
    const { desc, title, valueString, addString, names, allowSorting, readOnly, nameValueId, t } = this.props;
    const portItems =
      names &&
      names.map((pair, i) => {
        const key = _.get(pair, [ParameterModalEditorPair.Index], i);
        return <ParameterModalElement onChange={this._change} index={i} t={t} valueString={valueString} allowSorting={allowSorting} readOnly={readOnly} pair={pair} key={key} onRemove={this._remove} rowSourceId={nameValueId} />;
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
ParameterModalEditor.defaultProps = {
  valueString: 'Value',
  addString: 'AddMore',
  allowSorting: false,
  readOnly: true,
  nameValueId: 0,
};

class ParameterModalElement extends React.Component {
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
        <span className="sr-only">Delete</span>
      </React.Fragment>
    );
    const editButton = (
      <React.Fragment>
        <Button children={<MdEdit />} onClick={this._onEdit}></Button>
        <span className="sr-only">Edit</span>
      </React.Fragment>
    );

    return (
      <div className={classNames('row')} ref={node => (this.node = node)}>
        <div className="col-md-4 col-xs-4 pairs-list__protocol-field">
          <input type="text" className="form-control" placeholder={t(`CONTENT:${valueString.toUpperCase()}`)} value={pair[ParameterModalEditorPair.Value] || ''} onChange={this._onChangeValue} disabled />
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
