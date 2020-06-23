import * as React from 'react';
import * as _ from 'lodash-es';
import * as classNames from 'classnames';
import { RoleEditorPair } from './index';
import SingleSelect from '../utils/select'
import { coFetch, coFetchJSON } from '../../co-fetch';
export class RoleEditor extends React.Component {
    constructor(props) {
        super(props);
        this._append = this._append.bind(this);
        this._change = this._change.bind(this);
        this._remove = this._remove.bind(this);
    }
    _append(event) {
        const { updateParentData, rolePairs, nameValueId, allowSorting } = this.props;
        updateParentData({ rolePairs: allowSorting ? rolePairs.concat([['', '', rolePairs.length]]) : rolePairs.concat([['', '', { 'All': 1, 'Create': 1, 'Delete': 1, 'Get': 1, 'List': 1, 'Patch': 1, 'Update': 1, 'Watch': 1 }]]) }, nameValueId);
    }

    _remove(i) {
        const { updateParentData, nameValueId } = this.props;
        const rolePairs = _.cloneDeep(this.props.rolePairs);
        rolePairs.splice(i, 1);
        updateParentData({ rolePairs: rolePairs.length ? rolePairs : [['', '', []]] }, nameValueId);
    }

    _change(e, i, type) {
        const { updateParentData, nameValueId } = this.props;
        const rolePairs = _.cloneDeep(this.props.rolePairs);
        //check인경우 
        let keyList = Object.keys(rolePairs[i][type])
        if (e.target.type === 'checkbox') {
            if (e.target.id === 'All') {
                rolePairs[i][type][e.target.id] = rolePairs[i][type][e.target.id] ? 0 : 1;
                if (rolePairs[i][type][e.target.id]) {
                    //[0,1,0,1,1,0,0,1] => [1,1,1,1,1,1,1,1]
                    keyList.forEach(key => {
                        rolePairs[i][type][key] = 1;
                    })
                } else {
                    keyList.forEach(key => {
                        rolePairs[i][type][key] = 0;
                    })
                }
            } else {
                //하나라도 체크안된게 있으면 all을 0으로 다체크되면 1로 
                rolePairs[i][type][e.target.id] = rolePairs[i][type][e.target.id] ? 0 : 1;
                let isAll = 0;
                keyList.forEach(key => {
                    if (key !== 'All') {
                        rolePairs[i][type][key] === 0 ? rolePairs[i][type]['All'] = 0 : isAll++
                    }
                })
                if (rolePairs[i][type]['All'] === 0 && isAll === 7) {
                    rolePairs[i][type]['All'] = 1
                }
            }
        } else {
            rolePairs[i][type] = e.target ? e.target.value : e.value;
        }
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
        this.state = {
            resourceList: []
        };
        this._onRemove = this._onRemove.bind(this);
        this._onChangeGroup = this._onChangeGroup.bind(this);
        this._onChangeResource = this._onChangeResource.bind(this);
        this._onChangeRole = this._onChangeRole.bind(this);
        this._getResourceList = this._getResourceList.bind(this);
    }
    _onRemove() {
        const { index, onRemove } = this.props;
        onRemove(index);
    }
    _onChangeGroup(e) {
        const { index, onChange } = this.props;
        onChange(e, index, RoleEditorPair.Group);
        this._getResourceList(e.value);
    }
    _onChangeResource(e) {
        const { index, onChange } = this.props;
        onChange(e, index, RoleEditorPair.Resource);
    }
    _onChangeRole(e) {
        const { index, onChange } = this.props;
        onChange(e, index, RoleEditorPair.Role);
    }
    _getResourceList(apiGroup) {
        coFetchJSON(`${document.location.origin}/api/kubernetes/apis/${apiGroup}`).then(
            data => {
                const resourceList = data.resources.map(resource => resource.name)
                this.setState({
                    resourceList: resourceList
                });
            },
            err => {
                this.setState({ error: err.message, inProgress: false, serviceNameList: [] });
            },
        );
    }
    render() {
        const { keyString, valueString, allowSorting, readOnly, pair, t, APIGroupList } = this.props;
        const deleteButton = (
            <React.Fragment>
                <i className="fa fa-minus-circle pairs-list__side-btn pairs-list__delete-icon" aria-hidden="true" onClick={this._onRemove}></i>
                <span className="sr-only">Delete</span>
            </React.Fragment>
        );
        let checkboxList = Object.keys(pair[2]).map(verb => {
            let ischecked = pair[2][verb]
            return <div style={{ float: 'left', width: '100px' }}>
                <input type="checkbox" id={verb} checked={ischecked} onChange={this._onChangeRole} />
                <label style={{ margin: '0 10px' }}>{verb}</label>
            </div>
        })
        const APIOptions = APIGroupList.map(option => ({ value: option, label: option }));
        const ResourceOptions = this.state.resourceList.map(option => ({ value: option, label: option }));
        return (
            <div>
                <div className={classNames('pairs-list__row col-xs-8')} style={{ margin: '0px 0px 10px -15px', backgroundColor: '#F5F5F5' }} ref={node => (this.node = node)}>
                    <div className="row pairs-list__row">
                        <div className="col-md-4 col-xs-4 pairs-list__port-field">
                            {APIOptions && <SingleSelect
                                options={APIOptions} name="APIGroup" value={pair[RoleEditorPair.Group]} onChange={this._onChangeGroup}
                            />}
                        </div>
                        <div className="col-md-4 col-xs-4 pairs-list__port-field">
                            {ResourceOptions && <SingleSelect
                                options={ResourceOptions} name="Resource" value={pair[RoleEditorPair.Resource]}
                            />}
                        </div>
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
