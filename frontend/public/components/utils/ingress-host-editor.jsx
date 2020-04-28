import * as React from 'react';
import * as _ from 'lodash-es';
import * as classNames from 'classnames';
import { IngressHostEditorPair } from './index';
import { IngressEditor } from '../utils/ingress-path-editor';
export class IngressHostEditor extends React.Component {
    constructor(props) {
        super(props);
        this._append = this._append.bind(this);
        this._change = this._change.bind(this);
        this._remove = this._remove.bind(this);
    }
    _append(event) {
        const { updateParentData, values, nameValueId, allowSorting } = this.props;
        let lastIndex = this.props.values.length - 1;
        let lastData = this.props.values[lastIndex];
        updateParentData({ values: allowSorting ? portPairs.concat([['', values.length]]) : values.concat([['']]) }, nameValueId);
    }

    _remove(i) {
        const { updateParentData, nameValueId } = this.props;
        const values = _.cloneDeep(this.props.values);
        values.splice(i, 1);
        updateParentData({ values: values.length ? values : [['', '']] }, nameValueId);
    }

    _change(e, i, type) {
        const { updateParentData, nameValueId } = this.props;
        const values = _.cloneDeep(this.props.values);
        values[i][type] = e.target.value;
        updateParentData({ values }, nameValueId);
    }
    render() {
        const { valueString, addString, values, allowSorting, readOnly, nameValueId, t } = this.props;
        const portItems = values.map((pair, i) => {
            const key = _.get(pair, [IngressHostEditorPair.Index], i);
            return <ValuePairElement onChange={this._change} index={i} t={t} valueString={valueString} allowSorting={allowSorting} readOnly={readOnly} pair={pair} key={key} onRemove={this._remove} rowSourceId={nameValueId} />;
        });
        return (
            <React.Fragment>
                <div className="row">
                    <div className="col-md-2 col-xs-2 control-label"> {t(`CONTENT:HOSTNAME`)}</div>
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
IngressHostEditor.defaultProps = {
    valueString: 'Value',
    addString: 'AddMore',
    allowSorting: false,
    readOnly: false,
    nameValueId: 0
};

class ValuePairElement extends React.Component {
    constructor(props) {
        super(props);
        this._onRemove = this._onRemove.bind(this);
        this._onChangeValue = this._onChangeValue.bind(this);
    }
    _onRemove() {
        const { index, onRemove } = this.props;
        onRemove(index);
    }
    _onChangeValue(e) {
        const { index, onChange } = this.props;
        onChange(e, index, IngressHostEditorPair.Value);
    }
    render() {
        const { keyString, valueString, allowSorting, readOnly, pair, t } = this.props;
        const deleteButton = (
            <React.Fragment>
                <i className="fa fa-minus-circle pairs-list__side-btn pairs-list__delete-icon" aria-hidden="true" onClick={this._onRemove}></i>
                <span className="sr-only">Delete</span>
            </React.Fragment>
        );
        const serviceNameList = [['']];
        const servicePortList = [['']];
        const paths = [['', '', '']];
        return (
            <div>
                <div className={classNames('row', 'pairs-list__row', 'col-md-10', 'col-xs-10')} style={{ backgroundColor: '#CEECF5', borderWidth: '2px' }} ref={node => (this.node = node)}>
                    <div className="col-md-12 col-xs-12 pairs-list__protocol-field">
                        <input type="text" style={{ marginLeft: '-15px' }} className="form-control" placeholder={t(`CONTENT:HOSTNAME`)} onChange={this._onChangeValue} />
                    </div>
                    <div>
                        <IngressEditor serviceNameOptions={serviceNameList} servicePortOptions={servicePortList} t={t} pathPairs={paths} updateParentData={this._updatePaths} />
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
