import * as React from 'react';
import * as _ from 'lodash-es';
import * as classNames from 'classnames';
import { IngressEditorPair } from './index';

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
        updateParentData({ pathPairs: pathPairs.length ? pathPairs : [['', '']] }, nameValueId);
    }

    _change(e, i, type) {
        const { updateParentData, nameValueId } = this.props;
        const pathPairs = _.cloneDeep(this.props.pathPairs);
        pathPairs[i][type] = e.target.value;
        updateParentData({ pathPairs }, nameValueId);
    }
    render() {
        const { pathNameString, servicePortString, serviceNameString, addString, pathPairs, allowSorting, readOnly, nameValueId, t } = this.props;
        const portItems = pathPairs.map((pair, i) => {
            const key = _.get(pair, [IngressEditorPair.Index], i);
            return <IngressPairElement onChange={this._change} index={i} t={t} pathNameString={pathNameString} servicePortString={servicePortString} serviceNameString={serviceNameString} allowSorting={allowSorting} readOnly={readOnly} pair={pair} key={key} onRemove={this._remove} rowSourceId={nameValueId} />;
        });
        return (
            <React.Fragment>
                <div className="row">
                    <div className="col-md-2 col-xs-2 control-label">{t(`CONTENT:${pathNameString.toUpperCase()}`)}</div>
                    <div className="col-md-2 col-xs-2 control-label">{t(`CONTENT:${serviceNameString.toUpperCase()}`)}</div>
                    <div className="col-md-2 col-xs-2 control-label">{t(`CONTENT:${servicePortString.toUpperCase()}`)}</div>
                </div>
                {portItems}
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
        this._onRemove = this._onRemove.bind(this);
        this._onChangeName = this._onChangeName.bind(this);
        this._onChangeProtocol = this._onChangeProtocol.bind(this);
        this._onChangePort = this._onChangePort.bind(this);
    }
    _onRemove() {
        const { index, onRemove } = this.props;
        onRemove(index);
    }
    _onChangeName(e) {
        const { index, onChange } = this.props;
        onChange(e, index, IngressEditorPair.Name);
    }
    _onChangeProtocol(e) {
        const { index, onChange } = this.props;
        onChange(e, index, IngressEditorPair.Protocol);
    }
    _onChangePort(e) {
        const { index, onChange } = this.props;
        onChange(e, index, IngressEditorPair.Port);
    }
    render() {
        const { pathNameString, allowSorting, readOnly, pair, t, serviceNameOptions, servicePortOptions } = this.props;
        const deleteButton = (
            <React.Fragment>
                <i className="fa fa-minus-circle pairs-list__side-btn pairs-list__delete-icon" aria-hidden="true" onClick={this._onRemove}></i>
                <span className="sr-only">Delete</span>
            </React.Fragment>
        );

        return (
            <div className={classNames('row', 'pairs-list__row')} ref={node => (this.node = node)} style={{ backgroundColor: '#D0A9F5' }}>
                <div className="col-md-2 col-xs-2 pairs-list__name-field">
                    <input type="text" className="form-control" placeholder={t(`CONTENT:${pathNameString.toUpperCase()}`)} value={pair[IngressEditorPair.Name]} onChange={this._onChangeName} />
                </div>
                <div className="col-md-2 col-xs-2 pairs-list__protocol-field">
                    <select className="form-control">
                        {serviceNameOptions}
                    </select>
                </div>
                <div className="col-md-2 col-xs-2 pairs-list__port-field">
                    <select className="form-control">
                        {servicePortOptions}
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
