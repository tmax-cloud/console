import * as _ from 'lodash-es';
import * as React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { k8sCreate, k8sUpdate } from '../../module/k8s';
import { ButtonBar, history, kindObj, SelectorInput } from '../utils';
import { useTranslation } from 'react-i18next';
import { ResourcePlural } from '../utils/lang/resource-plural';
import { formatNamespacedRouteForResource } from '../../ui/ui-actions';
import { NsDropdown } from '../RBAC';
import { SelectKeyValueEditor } from '../utils/select-key-value-editor';

const Section = ({ label, children, isRequired, paddingTop }) => {
  return <div className={`row form-group ${isRequired ? 'required' : ''}`}>
    <div className="col-xs-2 control-label" style={{paddingTop: paddingTop}}>
      <strong>{label}</strong>
    </div>
    <div className="col-xs-10">{children}</div>
  </div>;
};

class LimitRangeFormComponent extends React.Component {
  constructor(props) {
    super(props);
    const existingLimitRange = _.pick(props.obj, ['metadata', 'type']);
    const limitRange = _.defaultsDeep({}, props.fixed, existingLimitRange, {
      apiVersion: 'v1',
      kind: 'LimitRange',
      metadata: {
        name: '',
        namespace: '',
      },
      spec: {
        limits: [
          {
            type: 'Container'
          }
        ],
      },
    });

    this.state = {
      limitRangeTypeAbstraction: this.props.limitRangeTypeAbstraction,
      limitRange: limitRange,
      inProgress: false,
      type: 'form',
      quota: [['', '']]
    };
    this.onNameChanged = this.onNameChanged.bind(this);
    this.onNamespaceChanged = this.onNamespaceChanged.bind(this);
    this.onLabelChanged = this.onLabelChanged.bind(this);
    this._updateQuota = this._updateQuota.bind(this);
    this.save = this.save.bind(this);
  }

  onNameChanged(event) {
    let limitRange = { ...this.state.limitRange };
    limitRange.metadata.name = String(event.target.value);
    this.setState({ limitRange: limitRange });
  }
  onNamespaceChanged(namespace) {
    let limitRange = { ...this.state.limitRange };
    limitRange.metadata.namespace = String(namespace);
    this.setState({ limitRange: limitRange });
  }
  onLabelChanged(event) {
    let limitRange = { ...this.state.limitRange };
    limitRange.metadata.labels = {};
    if (event.length !== 0) {
      event.forEach(item => {
        if (item.split('=')[1] === undefined) {
          document.getElementById('labelErrMsg').style.display = 'block';
          event.pop(item);
          return;
        }
        document.getElementById('labelErrMsg').style.display = 'none';
        limitRange.metadata.labels[item.split('=')[0]] = item.split('=')[1];
      });
    }
    this.setState({ limitRange: limitRange });
  }
  _updateQuota(quota) {
    this.setState({
      quota: quota.keyValuePairs
    });
  }
  save(e) {
    e.preventDefault();
    const { kind, metadata } = this.state.limitRange;
    this.setState({ inProgress: true });
    const newLimitRange = _.assign({}, this.state.limitRange);

    let quota = {};
    this.state.quota.forEach(arr => {
      if (arr[0] === 'etc') {
        quota[arr[1]] = arr[2];
      } else {
        const minOrMax = arr[0].split('.')[0];
        const key = arr[0].split('.')[2];
        quota[minOrMax] = {};
        quota[minOrMax][key] = arr[2];
      }
    });

    if ( quota !== {}) {
      Object.assign(newLimitRange.spec.limits[0], quota);
    }

    const ko = kindObj(kind);
    (this.props.isCreate
      ? k8sCreate(ko, newLimitRange)
      : k8sUpdate(ko, newLimitRange, metadata.namespace, newLimitRange.metadata.name)
    ).then(() => {
      this.setState({ inProgress: false });
      history.push(`/k8s/ns/${metadata.namespace}/limitranges/${metadata.name}`);
    }, err => this.setState({ error: err.message, inProgress: false }));
  }


  render() {
    const { t } = this.props;

    return <div className="rbac-edit-binding co-m-pane__body">
      <Helmet>
        <title>{t('ADDITIONAL:CREATEBUTTON', { something: ResourcePlural(this.state.limitRange.kind, t) })}</title>
      </Helmet >
      <form className="co-m-pane__body-group form-group" onSubmit={this.save}>
        <h1 className="co-m-pane__heading">{t('ADDITIONAL:CREATEBUTTON', { something: ResourcePlural(this.state.limitRange.kind, t) })}</h1>
        <p className="co-m-pane__explanation">{t('STRING:LIMITRANGE-CREATE-0')}</p>
        <fieldset disabled={!this.props.isCreate}>
          <Section label={t('CONTENT:NAME')} isRequired={true}>
            <input className="form-control"
              type="text"
              onChange={this.onNameChanged}
              value={this.state.limitRange.metadata.name}
              id="limit-range-name"
              required />
          </Section>
          <Section label={t('CONTENT:NAMESPACE')} isRequired={true}>
            <NsDropdown id="limit-range-namespace" t={t} onChange={this.onNamespaceChanged} />
          </Section>
          <Section label={t('CONTENT:LABELS')} isRequired={false}>
            <SelectorInput desc={t('STRING:RESOURCEQUOTA-CREATE-1')} isFormControl={true} labelClassName="co-text-namespace" tags={[]} onChange={this.onLabelChanged} />
            <div id="labelErrMsg" style={{ display: 'none', color: 'red' }}>
              <p>{t('VALIDATION:LABEL_FORM')}</p>
            </div>
          </Section>
          <Section label={t('CONTENT:PODRESOURCELIMITSRANGE')} isRequired={false} paddingTop={'5px'}>
            <SelectKeyValueEditor desc={t('STRING:RESOURCEQUOTA-CREATE-2')} t={t} options={LimitRangeFormComponent.limitRangeOptsion} keyValuePairs={this.state.quota} keyString="resourcetype" valueString="value" updateParentData={this._updateQuota} />
          </Section>
          <ButtonBar errorMessage={this.state.error} inProgress={this.state.inProgress} >
            <button type="submit" className="btn btn-primary" id="save-changes">{t('CONTENT:CREATE')}</button>
            <Link to={formatNamespacedRouteForResource('limitranges')} className="btn btn-default" id="cancel">{t('CONTENT:CANCEL')}</Link>
          </ButtonBar>
        </fieldset>
      </form>
    </div >;
  }
}

LimitRangeFormComponent.limitRangeOptsion = [
  {
    value: 'max.limits.cpu',
    label: 'Max CPU Limits',
  },
  {
    value: 'min.limits.cpu',
    label: 'Min CPU Limits',
  },
  {
    value: 'max.limits.memory',
    label: 'Max Memory Limits',
  },
  {
    value: 'min.limits.memory',
    label: 'Min Memory Limits',
  },
  {
    value: 'etc',
    label: '기타',
  },
];


export const CreateLimitRange = ({ match: { params } }) => {
  const { t } = useTranslation();
  return <LimitRangeFormComponent
    t={t}
    fixed={{ metadata: { namespace: params.ns } }}
    limitRangeTypeAbstraction={params.type}
    titleVerb="Create"
    isCreate={true}
  />;
};
