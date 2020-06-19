import * as React from 'react';
import * as _ from 'lodash-es';
import * as classNames from 'classnames';
import { RoleEditorPair } from './index';
import Checkbox from './Checkbox';
export class RoleEditor extends React.Component {
    constructor(props) {
        super(props);
        this._append = this._append.bind(this);
        this._change = this._change.bind(this);
        this._remove = this._remove.bind(this);
    }
    _append(event) {
        const { updateParentData, rolePairs, nameValueId, allowSorting } = this.props;
        let lastIndex = this.props.rolePairs.length - 1;
        let lastData = this.props.rolePairs[lastIndex];
        updateParentData({ rolePairs: allowSorting ? portPairs.concat([['', '', rolePairs.length]]) : rolePairs.concat([['', '']]) }, nameValueId);
    }

    _remove(i) {
        const { updateParentData, nameValueId } = this.props;
        const rolePairs = _.cloneDeep(this.props.rolePairs);
        rolePairs.splice(i, 1);
        updateParentData({ rolePairs: rolePairs.length ? rolePairs : [['', '']] }, nameValueId);
    }

    _change(e, i, type) {
        const { updateParentData, nameValueId } = this.props;
        const rolePairs = _.cloneDeep(this.props.rolePairs);
        rolePairs[i][type] = e.target.value;
        updateParentData({ rolePairs }, nameValueId);
    }
    render() {
        const { keyString, valueString, addString, rolePairs, allowSorting, readOnly, nameValueId, t } = this.props;
        const roleItems = rolePairs.map((pair, i) => {
            const key = _.get(pair, [RoleEditorPair.Index], i);
            return <RolePairElement onChange={this._change} t={t} index={i} keyString={keyString} valueString={valueString} allowSorting={allowSorting} readOnly={readOnly} pair={pair} key={key} onRemove={this._remove} rowSourceId={nameValueId} />;
        });
        return (
            <React.Fragment>
                <div className="row">
                    <div className="col-md-2 col-xs-2 text-secondary">{t(`CONTENT:${keyString.toUpperCase()}`)}</div>
                    <div className="col-md-2 col-xs-2 text-secondary">{t(`CONTENT:${valueString.toUpperCase()}`)}</div>
                </div>
                {roleItems}
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
RoleEditor.defaultProps = {
    keyString: 'Key',
    valueString: 'Value',
    addString: 'Add More',
    allowSorting: false,
    readOnly: false,
    nameValueId: 0,
};

class RolePairElement extends React.Component {
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
        onChange(e, index, RoleEditorPair.Key);
    }
    _onChangeValue(e) {
        const { index, onChange } = this.props;
        onChange(e, index, RoleEditorPair.Value);
    }
    render() {
        const { keyString, valueString, allowSorting, readOnly, pair, t } = this.props;
        const deleteButton = (
            <React.Fragment>
                <i className="fa fa-minus-circle pairs-list__side-btn pairs-list__delete-icon" aria-hidden="true" onClick={this._onRemove}></i>
                <span className="sr-only">Delete</span>
            </React.Fragment>
        );
        const verbItems = ['All', 'Create', 'Delete', 'Get', 'List', 'Patch', 'Update', 'Watch'];

        let checkboxList = verbItems.map(verb =>
            <div style={{ float: 'left' }}>
                <input type="checkbox" />
                <label style={{ margin: '0 10px' }}>{verb}</label>
            </div>)

        return (

            <div className={classNames('pairs-list__row')} ref={node => (this.node = node)}>
                <div className="row">
                    <div className="col-md-2 col-xs-2 pairs-list__name-field">
                        <input type="text" className="form-control" placeholder={t(`CONTENT:${keyString.toUpperCase()}`)} value={pair[RoleEditorPair.Key]} onChange={this._onChangeKey} />
                    </div>
                    <div className="col-md-2 col-xs-2 pairs-list__protocol-field">
                        <input type="text" className="form-control" placeholder={t(`CONTENT:${valueString.toUpperCase()}`)} value={pair[RoleEditorPair.Value] || ''} onChange={this._onChangeValue} />
                    </div>
                </div>
                <div className="row col-md-6 col-xs-6">
                    <div className="pairs-list__name-field">
                        {checkboxList}
                    </div>
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
