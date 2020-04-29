import * as React from 'react';
import * as _ from 'lodash-es';
import * as classNames from 'classnames';
import { IngressEditorPair } from './index';
import { k8sGet } from '../../module/k8s';
import { kindObj } from '../utils';
export class IngressEditor extends React.Component {
    constructor(props) {
        super(props);
        this._append = this._append.bind(this);
        this._change = this._change.bind(this);
        this._remove = this._remove.bind(this);
    }
    _append(event) {
        const { updateParentData, pathPairs, nameValueId, allowSorting } = this.props;
        let lastIndex = this.props.pathPairs.length - 1;
        updateParentData({ pathPairs: allowSorting ? pathPairs.concat([['', '', 'TCP', pathPairs.length]]) : pathPairs.concat([['', '', '']]) }, nameValueId);
    }

    _remove(i) {
        const { updateParentData, nameValueId } = this.props;
        const pathPairs = _.cloneDeep(this.props.pathPairs);
        pathPairs.splice(i, 1);
        updateParentData({ pathPairs: pathPairs.length ? pathPairs : [['', '', '']] }, nameValueId);
    }

    _change(e, i, type) {
        const { updateParentData, nameValueId } = this.props;
        const pathPairs = _.cloneDeep(this.props.pathPairs);
        pathPairs[i][type] = e.target.value;
        updateParentData({ pathPairs }, nameValueId);
    }
    render() {
        const { pathNameString, servicePortString, serviceNameString, addString, pathPairs, allowSorting, readOnly, nameValueId, t, serviceList } = this.props;
        const pathItems = pathPairs.map((pair, i) => {
            const key = _.get(pair, [IngressEditorPair.Index], i);
            return <IngressPairElement onChange={this._change} index={i} t={t} serviceList={serviceList} pathNameString={pathNameString} servicePortString={servicePortString} serviceNameString={serviceNameString} allowSorting={allowSorting} readOnly={readOnly} pair={pair} key={key} onRemove={this._remove} rowSourceId={nameValueId} />;
        });
        return (
            <React.Fragment>
                <div className="row">
                    <div className="col-md-2 col-xs-2 control-label">{t(`CONTENT:${pathNameString.toUpperCase()}`)}</div>
                    <div className="col-md-3 col-xs-3 control-label">{t(`CONTENT:${serviceNameString.toUpperCase()}`)}</div>
                    <div className="col-md-2 col-xs-2 control-label">{t(`CONTENT:${servicePortString.toUpperCase()}`)}</div>
                </div>
                {pathItems}
                <div className="row">
                    <div className="col-md-12 col-xs-12">
                        {readOnly ? null : (
                            <React.Fragment>
                                <span className="btn-link pairs-list__btn" onClick={this._append}>
                                    <i aria-hidden="true" className="fa fa-plus-circle pairs-list__add-icon" />
                                    {t(`CONTENT:${addString.toUpperCase()}`)}
                                </span>
                            </React.Fragment>
                        )}
                    </div>
                </div>
            </React.Fragment>
        );
    }
}
IngressEditor.defaultProps = {
    pathNameString: 'PathName',
    serviceNameString: 'ServiceName',
    servicePortString: 'ServicePort',
    addString: 'AddMore',
    allowSorting: false,
    readOnly: false,
    nameValueId: 0
};

class IngressPairElement extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            servicePortList: [],
            serviceList: this.props.serviceList
        };
        this._onRemove = this._onRemove.bind(this);
        this._onChangeName = this._onChangeName.bind(this);
        this._onChangeServiceName = this._onChangeServiceName.bind(this);
        this._onChangeServicePort = this._onChangeServicePort.bind(this);
        this._getServicePortList = this._getServicePortList.bind(this);
    }
    _onRemove() {
        const { index, onRemove } = this.props;
        onRemove(index);
    }
    _onChangeName(e) {
        const { index, onChange } = this.props;
        onChange(e, index, IngressEditorPair.PathName);
    }
    _onChangeServiceName(e) {
        const { index, onChange, serviceList } = this.props;
        onChange(e, index, IngressEditorPair.ServiceName);
        // service port get
        this._getServicePortList(e.target.value);
    }
    _onChangeServicePort(e) {
        const { index, onChange } = this.props;
        onChange(e, index, IngressEditorPair.ServicePort);
    }
    _getServicePortList(serviceName) {
        const ko = kindObj('Service');
        const ns = location.pathname.split('/')[3];
        k8sGet(ko, serviceName, ns)
            .then((data) => {
                console.log(data)
                let portList = data.spec.ports;
                this.setState({
                    servicePortList: portList
                })
            }, err => {
                this.setState({ error: err.message, inProgress: false, serviceNameList: [] });
            });
    }
    render() {
        const { pathNameString, allowSorting, readOnly, pair, t, servicePortOptions, serviceList, pathPairs } = this.props;
        const { servicePortList } = this.state;
        const deleteButton = (
            <React.Fragment>
                <i className="fa fa-minus-circle pairs-list__side-btn pairs-list__delete-icon" aria-hidden="true" onClick={this._onRemove}></i>
                <span className="sr-only">Delete</span>
            </React.Fragment>
        );
        let servicePortList = servicePortList.map(port => {
            return <option value={port.port}>{port.name}</option>;
        });
        return (
            <div className={classNames('row', 'pairs-list__row')} ref={node => (this.node = node)} style={{ backgroundColor: '#D0A9F5', border: '1px solid' }}>
                <div className="col-md-2 col-xs-2 pairs-list__name-field">
                    <input type="text" className="form-control" placeholder={t(`CONTENT:${pathNameString.toUpperCase()}`)} value={pair[IngressEditorPair.Name]} onChange={this._onChangeName} />
                </div>
                <div className="col-md-3 col-xs-3 pairs-list__protocol-field">
                    <select className="form-control" value={pair[IngressEditorPair.ServiceName]} onChange={this._onChangeServiceName} >
                        {serviceList}
                    </select>
                </div>
                <div className="col-md-2 col-xs-2 pairs-list__port-field">
                    <select className="form-control" value={pair[IngressEditorPair.ServicePort]} onChange={this._onChangeServicePort} >
                        {servicePortList}
                    </select>
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
