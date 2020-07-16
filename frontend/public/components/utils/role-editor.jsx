import * as React from 'react';
import * as _ from 'lodash-es';
import * as classNames from 'classnames';
import { RoleEditorPair } from './index';
import SingleSelect from '../utils/select';
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
    updateParentData({ rolePairs: allowSorting ? rolePairs.concat([['', '', rolePairs.length]]) : rolePairs.concat([['', '', { All: 1, Create: 1, Delete: 1, Get: 1, List: 1, Patch: 1, Update: 1, Watch: 1 }]]) }, nameValueId);
  }

  _remove(i) {
    const { updateParentData, nameValueId } = this.props;
    const rolePairs = _.cloneDeep(this.props.rolePairs);
    if (rolePairs.length > 1) {
      rolePairs.splice(i, 1);
      updateParentData({ rolePairs: rolePairs.length ? rolePairs : [['', '', { All: 1, Create: 1, Delete: 1, Get: 1, List: 1, Patch: 1, Update: 1, Watch: 1 }]] }, nameValueId);
    } else {
      return;
    }
  }

  _change(e, i, type) {
    const { updateParentData, nameValueId } = this.props;
    const rolePairs = _.cloneDeep(this.props.rolePairs);
    //check인경우
    let keyList = Object.keys(rolePairs[i][type]);

    if (e.target && e.target.type === 'checkbox') {
      if (e.target.id === 'All') {
        rolePairs[i][type][e.target.id] = rolePairs[i][type][e.target.id] ? 0 : 1;
        rolePairs[i][type] = rolePairs[i][type][e.target.id] ? { All: 1, Create: 1, Delete: 1, Get: 1, List: 1, Patch: 1, Update: 1, Watch: 1 } : { All: 0, Create: 0, Delete: 0, Get: 0, List: 0, Patch: 0, Update: 0, Watch: 0 };
      } else {
        //하나라도 체크안된게 있으면 all을 0으로 다체크되면 1로
        rolePairs[i][type][e.target.id] = rolePairs[i][type][e.target.id] ? 0 : 1;
        let checkedCount = 0;
        keyList.forEach(key => {
          if (key !== 'All') {
            rolePairs[i][type][key] === 0 ? (rolePairs[i][type]['All'] = 0) : checkedCount++;
          }
        });
        if (rolePairs[i][type]['All'] === 0 && checkedCount === 7) {
          rolePairs[i][type]['All'] = 1;
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
      return <RolePairElement onChange={this._change} t={t} index={i} keyString={keyString} valueString={valueString} allowSorting={allowSorting} readOnly={readOnly} pair={pair} key={key} onRemove={this._remove} rowSourceId={nameValueId} ResourceList={ResourceList} APIGroupList={APIGroupList} />;
    });
    return (
      <React.Fragment>
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
      </React.Fragment>
    );
  }
}
RoleEditor.defaultProps = {
  keyString: 'APIGroups',
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
      ResourceList: this.props.ResourceList,
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
    if (apiGroup !== 'All' && apiGroup !== 'Core') {
      coFetchJSON(`${document.location.origin}/api/kubernetes/apis/${apiGroup}`).then(
        data => {
          let ResourceList = data.resources.map(resource => resource.name);
          ResourceList.unshift('All');
          this.setState({
            ResourceList: ResourceList,
          });
        },
        err => {
          this.setState({ error: err.message, inProgress: false, serviceNameList: [] });
        },
      );
    } else {
      let ResourceList = apiGroup === 'All' ? ['All'] : ['All', 'pods', 'configmaps', 'secrets', 'replicationcontrollers', 'services', 'persistentvolumeclaims', 'persistentvolumes', 'namespaces', 'limitranges', 'resourcequotas', 'nodes', 'serviceaccounts'];
      this.setState({
        ResourceList: ResourceList,
      });
    }
  }
  render() {
    const { keyString, valueString, allowSorting, readOnly, pair, t, APIGroupList } = this.props;
    const { ResourceList } = this.state;
    const deleteButton = (
      <React.Fragment>
        <i className="fa fa-minus-circle pairs-list__side-btn pairs-list__delete-icon" aria-hidden="true" onClick={this._onRemove}></i>
        <span className="sr-only">Delete</span>
      </React.Fragment>
    );

    let checkboxList = Object.keys(pair[2]).map(verb => {
      let ischecked = pair[2][verb];
      return (
        <div style={{ float: 'left', width: '100px' }} value={pair[RoleEditorPair.Role]}>
          <input type="checkbox" id={verb} checked={ischecked} onChange={this._onChangeRole} />
          <label style={{ margin: '0 10px' }}>{verb}</label>
        </div>
      );
    });
    let APIOptions = APIGroupList !== [] ? APIGroupList.map(option => ({ value: option, label: option })) : [];
    let ResourceList = pair[0] === '' ? this.props.ResourceList : !ResourceList.length ? this.props.ResourceList : ResourceList;
    let ResourceOptions = ResourceList.map(option => ({ value: option, label: option }));

    // ResourceOptions에 pair[RoleEditorPair.Resource]가 없는 경우
    if (!ResourceOptions.some(resource => resource.value === pair[RoleEditorPair.Resource])) {
      if (ResourceOptions.length) {
        pair[RoleEditorPair.Resource] = ResourceOptions[0].value;
      }
    }
    return (
      <div>
        <div className={classNames('pairs-list__row col-xs-9')} style={{ margin: '0px 0px 10px -15px', backgroundColor: '#F5F5F5' }} ref={node => (this.node = node)}>
          <div className="row pairs-list__row">
            <div className="col-md-2 col-xs-2 pairs-list__port-field">{t(`CONTENT:${keyString.toUpperCase()}`)}</div>
            <div className="col-md-3 col-xs-3 pairs-list__port-field">{APIOptions && <SingleSelect options={APIOptions} name="APIGroup" value={pair[RoleEditorPair.Group]} onChange={this._onChangeGroup} />}</div>
            <div className="col-md-2 col-xs-2 pairs-list__port-field">{t(`CONTENT:${valueString.toUpperCase()}`)}</div>
            <div className="col-md-3 col-xs-3 pairs-list__port-field">{ResourceOptions && <SingleSelect options={ResourceOptions} name="Resource" value={pair[RoleEditorPair.Resource]} onChange={this._onChangeResource} />}</div>
          </div>
          <div className="row col-md-12 col-xs-12">
            <div className="pairs-list__name-field">{checkboxList}</div>
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
