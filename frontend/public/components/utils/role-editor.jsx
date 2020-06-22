import * as React from 'react';
import * as _ from 'lodash-es';
import * as classNames from 'classnames';
import { RoleEditorPair } from './index';
import SingleSelect from '../utils/select'
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
        rolePairs[i][type] = e.target ? e.target.value : e.value;
        updateParentData({ rolePairs }, nameValueId);
    }
    render() {
        const { desc, keyString, valueString, addString, rolePairs, allowSorting, readOnly, nameValueId, t, APIGroupList, ResourceList } = this.props;
        const roleItems = rolePairs.map((pair, i) => {
            const key = _.get(pair, [RoleEditorPair.Index], i);
            return <RolePairElement onChange={this._change} t={t} index={i} keyString={keyString} valueString={valueString} allowSorting={allowSorting} readOnly={readOnly} pair={pair} key={key} onRemove={this._remove} rowSourceId={nameValueId} APIGroupList={APIGroupList} ResourceList={ResourceList} />;
        });
        return (
            <React.Fragment>
                <div className="row col-xs-8" style={{ marginLeft: '-15px' }}>
                    <div className="row">
                        <div className="col-md-4 col-xs-4 text-secondary">{t(`CONTENT:${keyString.toUpperCase()}`)}</div>
                        <div className="col-md-4 col-xs-4 text-secondary">{t(`CONTENT:${valueString.toUpperCase()}`)}</div>
                    </div>
                </div>
                {roleItems}
                <span className="row col-xs-10">{desc}</span>
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
            </React.Fragment >
        );
    }
}
RoleEditor.defaultProps = {
    keyString: 'API Group',
    valueString: 'Resource',
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
        this._onChangeGroup = this._onChangeGroup.bind(this);
    }
    _onRemove() {
        const { index, onRemove } = this.props;
        onRemove(index);
    }
    _onChangeKey(e) {
        const { index, onChange } = this.props;
        onChange(e, index, RoleEditorPair.Key);
    }
    _onChangeGroup(e) {
        const { index, onChange } = this.props;
        onChange(e, index, RoleEditorPair.Group);
    }
    render() {
        const { keyString, valueString, allowSorting, readOnly, pair, t, APIGroupList, ResourceList } = this.props;
        const deleteButton = (
            <React.Fragment>
                <i className="fa fa-minus-circle pairs-list__side-btn pairs-list__delete-icon" aria-hidden="true" onClick={this._onRemove}></i>
                <span className="sr-only">Delete</span>
            </React.Fragment>
        );
        const verbItems = ['All', 'Create', 'Delete', 'Get', 'List', 'Patch', 'Update', 'Watch'];

        let checkboxList = verbItems.map(verb =>
            <div style={{ float: 'left', width: '100px' }}>
                <input type="checkbox" />
                <label style={{ margin: '0 10px' }}>{verb}</label>
            </div>)


        const APIOptions = APIGroupList.map(option => {
            return (
                {
                    value: option,
                    label: option
                }
            );
        });
        const ResourceOptions = ResourceList.map(option => {
            return (
                {
                    value: option,
                    label: option
                }
            );
        });
        return (
            <div>
                <div className={classNames('pairs-list__row col-xs-8')} style={{ marginLeft: '-15px' }} ref={node => (this.node = node)}>
                    <div className="row pairs-list__row">
                        <div className="col-md-4 col-xs-4 pairs-list__port-field">
                            {APIOptions && <SingleSelect
                                options={APIOptions} name="APIGroup" value={pair[RoleEditorPair.PVC]} onChange={this._onChangeGroup}
                            />}
                        </div>
                        <div className="col-md-4 col-xs-4 pairs-list__port-field">
                            {ResourceOptions && <SingleSelect
                                options={ResourceOptions} name="Resource" value={pair[RoleEditorPair.PVC]}
                            />}  </div>
                    </div>
                    <div className="row col-md-12 col-xs-12">
                        <div className="pairs-list__name-field">
                            {checkboxList}
                        </div>
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
