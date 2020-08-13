import * as React from 'react';
import * as _ from 'lodash-es';
import { MdEdit } from 'react-icons/md';
import { FaMinus } from 'react-icons/fa';
import * as classNames from 'classnames';
import { ResourceModalEditorPair, ResourceModalPair } from './index';

export class ResourceModalEditor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      currentResources: {
        name: '',
        type: '',
        path: '',
        optional: false,
      },
      names: props.names,
    };

    this._append = this._append.bind(this);
    this._change = this._change.bind(this);
    this._remove = this._remove.bind(this);
    this._updateParentData = this._updateParentData.bind(this);
  }

  _updateParentData = data => {
    const { visibleData, realData, resources, names, nameValueId, allowSorting, t, valueString } = this.props;
    let index = data.isNew ? this.props.names.length : data.index; // 수정이면 index다르게 줘야함
    const names = [...this.state.names];
    names[index][0] = data.name;
    const currentResources = [...this.state.currentResources];
    ['Name', 'Type', 'Path', 'Optional'].forEach(cur => {
      currentResources[index][ResourceModalPair[cur]] = data[cur.toLowerCase()];
    });

    this.setState(prevState => ({
      ...prevState,
      names,
    }));
    this.setState(prevState => ({
      ...prevState,
      currentResources,
    }));

    visibleData({ names }, nameValueId);
    realData(this.state.currentResources);
  };

  _append(event) {
    const { resources, names, nameValueId, allowSorting, t, valueString } = this.props;

    names = typeof names === 'string' ? [['']] : names.concat([['']]);
    resources = typeof resources === 'string' ? [['', '', '', false]] : resources.concat([['', '', '', false]]);
    this.setState(prevState => ({
      ...prevState,
      names,
      currentResources: resources,
    }));

    import('./../modals/resource-modal').then(m => {
      m.ResourceModal({
        title: t(`CONTENT:${valueString.toUpperCase()}`),
        isNew: true,
        updateParentData: this._updateParentData,
      });
    });
  }

  _change(e, i) {
    const { resources, names, nameValueId, allowSorting, t, valueString } = this.props;

    import('./../modals/resource-modal').then(m => {
      m.ResourceModal({
        title: t(`CONTENT:${valueString.toUpperCase()}`),
        resource: resources[i],
        isNew: false,
        updateParentData: this._updateParentData,
        index: i,
      });
    });
  }

  _remove(i) {
    const { visibleData, realData, nameValueId } = this.props;
    const names = _.cloneDeep(this.props.names);
    const resources = _.cloneDeep(this.props.resources);
    names.splice(i, 1);
    resources.splice(i, 1);
    visibleData({ names });
    realData(resources);
  }

  render() {
    const { desc, title, valueString, addString, names, allowSorting, readOnly, nameValueId, t } = this.props;
    const portItems =
      names &&
      names.map((pair, i) => {
        const key = _.get(pair, [ResourceModalEditorPair.Index], i);
        return <ResourceModalElement onChange={this._change} index={i} t={t} valueString={valueString} allowSorting={allowSorting} readOnly={readOnly} pair={pair} key={key} onRemove={this._remove} rowSourceId={nameValueId} />;
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
ResourceModalEditor.defaultProps = {
  valueString: 'Value',
  addString: 'AddMore',
  allowSorting: false,
  readOnly: true,
  nameValueId: 0,
};

class ResourceModalElement extends React.Component {
  constructor(props) {
    super(props);
    this._onRemove = this._onRemove.bind(this);
    this._onEdit = this._onEdit.bind(this);
  }
  _onRemove() {
    const { index, onRemove } = this.props;
    onRemove(index);
  }
  _onEdit(e) {
    const { index, onChange } = this.props;
    onChange(e, index);
  }
  render() {
    const { keyString, valueString, allowSorting, readOnly, pair, t } = this.props;
    const deleteButton = (
      <React.Fragment>
        <FaMinus style={{ marginRight: '0.63rem', marginBottom: '0.18rem', border: '1px' }} onClick={this._onRemove} />
        {/* <i className="fa fa-minus-circle fa-lx pairs-list__side-btn pairs-list__delete-icon" aria-hidden="true" onClick={this._onRemove}></i> */}
        <span className="sr-only">Delete</span>
      </React.Fragment>
    );
    const editButton = (
      <React.Fragment>
        <MdEdit style={{ marginRight: '0.63rem', marginBottom: '0.18rem' }} onClick={this._onEdit} />
        {/* <i className="fa fa-pencil-square fa-2x pairs-list__side-btn" aria-hidden="true" onClick={this._onEdit}></i> */}
        <span className="sr-only">Edit</span>
      </React.Fragment>
    );

    return (
      <div className={classNames('row')} ref={node => (this.node = node)}>
        <div className="col-md-4 col-xs-4 pairs-list__protocol-field">
          <input type="text" className="form-control" placeholder={t(`CONTENT:${valueString.toUpperCase()}`)} value={pair[ResourceModalEditorPair.Value] || ''} onChange={this._onChangeValue} readOnly />
        </div>
        {/* {readOnly ? null : ( */}
        {
          <div className="col-md-1 col-xs-2">
            <span className={classNames(allowSorting ? 'pairs-list__span-btns' : null)}>{allowSorting ? <React.Fragment>{editButton}</React.Fragment> : editButton}</span>
            <span className={classNames(allowSorting ? 'pairs-list__span-btns' : null)}>{allowSorting ? <React.Fragment>{deleteButton}</React.Fragment> : deleteButton}</span>
          </div>
        }
      </div>
    );
  }
}
