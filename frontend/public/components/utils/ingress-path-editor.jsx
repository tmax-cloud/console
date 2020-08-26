import * as React from 'react';
import * as _ from 'lodash-es';
import { FaMinus } from 'react-icons/fa';
import { Button } from './button';
import * as classNames from 'classnames';
import { kindObj, IngressEditorPair } from './index';
import { k8sGet } from '../../module/k8s';
export class IngressEditor extends React.Component {
  constructor(props) {
    super(props);
    this._append = this._append.bind(this);
    this._change = this._change.bind(this);
    this._remove = this._remove.bind(this);
  }
  _append(event) {
    const { updateParentData, pathPairs, nameValueId, allowSorting, initialServiceName, initialServicePort } = this.props;
    let lastIndex = this.props.pathPairs.length - 1;
    updateParentData({ pathPairs: allowSorting ? pathPairs.concat([['', '', 'TCP', pathPairs.length]]) : pathPairs.concat([['', initialServiceName, initialServicePort]]) }, nameValueId);
  }

  _remove(i) {
    const { updateParentData, nameValueId } = this.props;
    const pathPairs = _.cloneDeep(this.props.pathPairs);
    pathPairs.splice(i, 1);
    updateParentData({ pathPairs: pathPairs.length ? pathPairs : [['', initialServiceName, initialServicePort]] }, nameValueId);
  }

  _change(e, i, type) {
    const { updateParentData, nameValueId, serviceList } = this.props;
    // const pathPairs = this.props.pathPairs.map((pair, idx) => {
    //   if (i === idx) {
    //     pair[type] = type === 2 ? Number(e.target.value) : e.target.value;
    //   }
    //   return [...pair];
    // });
    const pathPairs = _.cloneDeep(this.props.pathPairs);
    switch (type) {
      case 0:
        pathPairs[i][type] = e.target.value;
        break;
      case 1:
        pathPairs[i][type] = e.target.value;
        pathPairs[i][2] = serviceList.find(service => service.name === e.target.value).portList[0].value;
        break;
      case 2:
        pathPairs[i][type] = Number(e.target.value);
        break;

      default:
        break;
    }
    updateParentData({ pathPairs }, nameValueId);
  }
  render() {
    const { pathNameString, servicePortString, serviceNameString, addString, pathPairs, allowSorting, readOnly, nameValueId, t, serviceList, servicePortList } = this.props;
    const pathItems = pathPairs.map((pair, i) => {
      let portList = servicePortList;
      if (serviceList.length > 0 && pair[1]) {
        portList = serviceList.find(service => service.name === pair[1]).portList;
      }
      const key = _.get(pair, [IngressEditorPair.Index], i);
      return <IngressPairElement onChange={this._change} index={i} t={t} serviceList={serviceList} servicePortList={portList} pathNameString={pathNameString} serviceNameString={serviceNameString} allowSorting={allowSorting} readOnly={readOnly} pair={pair} key={i} onRemove={this._remove} rowSourceId={nameValueId} />;
    });
    return (
      <div style={{ marginLeft: '20px', marginTop: '40px' }}>
        <div className="row">
          <div className="col-md-2 col-xs-2 control-label">{t(`CONTENT:${pathNameString.toUpperCase()}`)}</div>
          <div className="col-md-3 col-xs-3 control-label">{t(`CONTENT:${serviceNameString.toUpperCase()}`)}</div>
          <div className="col-md-2 col-xs-2 control-label">{t(`CONTENT:${servicePortString.toUpperCase()}`)}</div>
        </div>
        {pathItems}
        <div>
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
      </div>
    );
  }
}
IngressEditor.defaultProps = {
  pathNameString: 'Path',
  serviceNameString: 'ServiceName',
  servicePortString: 'ServicePort',
  addString: 'AddMore',
  allowSorting: false,
  readOnly: false,
  nameValueId: 0,
};

class IngressPairElement extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      serviceList: this.props.serviceList,
      servicePortList: this.props.servicePortList,
    };
    this._onRemove = this._onRemove.bind(this);
    this._onChangeName = this._onChangeName.bind(this);
    this._onChangeServiceName = this._onChangeServiceName.bind(this);
    this._onChangeServicePort = this._onChangeServicePort.bind(this);
    this._getServicePortList = this._getServicePortList.bind(this);
  }
  _onRemove(e) {
    const { index, onRemove } = this.props;
    event.preventDefault();
    onRemove(index);
  }
  _onChangeName(e) {
    const { index, onChange } = this.props;
    onChange(e, index, IngressEditorPair.PathName);
  }
  _onChangeServiceName(e) {
    const { index, onChange } = this.props;
    onChange(e, index, IngressEditorPair.ServiceName);
  }
  _onChangeServicePort(e) {
    const { index, onChange } = this.props;
    onChange(e, index, IngressEditorPair.ServicePort);
  }
  _getServicePortList(serviceName) {
    const ko = kindObj('Service');
    const ns = location.pathname.split('/')[3];
    k8sGet(ko, serviceName, ns).then(
      data => {
        let portList = data.spec.ports;
        this.setState({
          servicePortList: portList,
        });
      },
      err => {
        this.setState({ error: err.message, inProgress: false, serviceNameList: [] });
      },
    );
  }
  render() {
    const { pathNameString, allowSorting, readOnly, pair, t, serviceList, pathPairs, servicePortList } = this.props;
    const deleteButton = (
      <React.Fragment>
        <Button children={<FaMinus />} onClick={this._onRemove}></Button>
        <span className="sr-only">Delete</span>
      </React.Fragment>
    );
    const serviceListOptions = serviceList.map((service, i) => {
      return (
        <option key={i} value={service.name}>
          {service.name}
        </option>
      );
    });
    let portList = servicePortList
      ? servicePortList.map((port, i) => {
          return (
            <option key={i} value={port.value}>
              {port.name}
            </option>
          );
        })
      : [];

    return (
      <div className={classNames('row', 'pairs-list__row')} ref={node => (this.node = node)}>
        <div className="col-md-2 col-xs-2 pairs-list__name-field">
          <input type="text" className="form-control" placeholder={t(`CONTENT:${pathNameString.toUpperCase()}`)} value={pair[IngressEditorPair.PathName]} onChange={this._onChangeName} />
        </div>
        <div className="col-md-3 col-xs-3 pairs-list__protocol-field">
          <select className="form-control" value={pair[IngressEditorPair.ServiceName]} onChange={this._onChangeServiceName}>
            {serviceListOptions}
          </select>
        </div>
        <div className="col-md-2 col-xs-2 pairs-list__port-field">
          <select className="form-control" value={pair[IngressEditorPair.ServicePort]} onChange={this._onChangeServicePort}>
            {portList}
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
