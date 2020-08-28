import * as _ from 'lodash-es';
import * as React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { k8sCreate } from '../../module/k8s';
import { ButtonBar, history, kindObj, SelectorInput } from '../utils';
import { useTranslation } from 'react-i18next';
import { formatNamespacedRouteForResource } from '../../ui/ui-actions';

const Section = ({ label, children, isRequired, paddingTop }) => {
  return (
    <div className={`row form-group ${isRequired ? 'required' : ''}`}>
      <div className="col-xs-2 control-label" style={{ paddingTop: paddingTop }}>
        <strong>{label}</strong>
      </div>
      <div className="col-xs-10">{children}</div>
    </div>
  );
};

class NamespaceFormComponent extends React.Component {
  constructor(props) {
    super(props);
    const existingNamespace = _.pick(props.obj, ['metadata', 'type']);
    const namespace = _.defaultsDeep({}, props.fixed, existingNamespace, {
      metadata: {
        name: '',
      },
    });

    this.state = {
      namespaceTypeAbstraction: this.props.namespaceTypeAbstraction,
      namespace: namespace,
      inProgress: false,
      type: 'form',
      inputError: {
        name: null,
      },
    };
    this.onNameChanged = this.onNameChanged.bind(this);
    this.onLabelChanged = this.onLabelChanged.bind(this);
    this.save = this.save.bind(this);
  }

  onNameChanged(event) {
    let namespace = { ...this.state.namespace };
    namespace.metadata.name = String(event.target.value);
    this.setState({ namespace: namespace });
  }
  onLabelChanged(event) {
    let namespace = { ...this.state.namespace };
    namespace.metadata.labels = {};
    if (event.length !== 0) {
      event.forEach(item => {
        if (item.split('=')[1] === undefined) {
          document.getElementById('labelErrMsg').style.display = 'block';
          event.pop(item);
          return;
        }
        document.getElementById('labelErrMsg').style.display = 'none';
        namespace.metadata.labels[item.split('=')[0]] = item.split('=')[1];
      });
    }
    this.setState({ namespace: namespace });
  }
  isRequiredFilled = (k8sResource, item, element) => {
    console.log('isRequiredFilled', k8sResource, item, element);
    const { t } = this.props;
    if (k8sResource.metadata[item] === '') {
      switch (item) {
        case 'name':
          this.setState({ inputError: { name: t(`VALIDATION:EMPTY-${element}`, { something: t(`CONTENT:NAME`) }) } });
          return false;
      }
    } else {
      this.setState({
        inputError: {
          [item]: null,
        },
      });
      return true;
    }
  };
  onFocusName = () => {
    this.setState({
      inputError: {
        name: null,
      },
    });
  };

  save(e) {
    e.preventDefault();
    const { metadata } = this.state.namespace;
    this.setState({ inProgress: true });
    const newNamespace = _.assign({}, this.state.namespace);

    if (!this.isRequiredFilled(newNamespace, 'name', 'INPUT')) {
      this.setState({ inProgress: false });
      return;
    }

    const ko = kindObj('Namespace');
    (this.props.isCreate ? k8sCreate(ko, newNamespace) : '').then(
      () => {
        this.setState({ inProgress: false });
        history.push(`/k8s/cluster/namespaces/${metadata.name}`);
      },
      err => this.setState({ error: err.message, inProgress: false }),
    );
  }

  render() {
    const { t } = this.props;

    return (
      <div className="rbac-edit-binding co-m-pane__body">
        <Helmet>
          <title>{t('ADDITIONAL:CREATEBUTTON', { something: t(`RESOURCE:NAMESPACE`) })}</title>
        </Helmet>
        <form className="co-m-pane__body-group form-group" onSubmit={this.save}>
          <h1 className="co-m-pane__heading">{t('ADDITIONAL:CREATEBUTTON', { something: t(`RESOURCE:NAMESPACE`) })}</h1>
          <p className="co-m-pane__explanation">{t('STRING:NAMESPACE-CREATE-0')}</p>
          <fieldset disabled={!this.props.isCreate}>
            <Section label={t('CONTENT:NAME')} isRequired={true}>
              <input className="form-control" type="text" onChange={this.onNameChanged} value={this.state.namespace.metadata.name} id="namespace-name" />
              {this.state.inputError.name && <p className="cos-error-title">{this.state.inputError.name}</p>}
            </Section>
            <Section label={t('CONTENT:LABELS')} isRequired={false}>
              <SelectorInput desc={t('STRING:RESOURCEQUOTA-CREATE-1')} isFormControl={true} labelClassName="co-text-namespace" tags={[]} onChange={this.onLabelChanged} />
              <div id="labelErrMsg" style={{ display: 'none', color: 'red' }}>
                <p>{t('VALIDATION:LABEL_FORM')}</p>
              </div>
            </Section>
            <ButtonBar errorMessage={this.state.error} inProgress={this.state.inProgress}>
              <button type="submit" className="btn btn-primary" id="save-changes">
                {t('CONTENT:CREATE')}
              </button>
              <Link to={formatNamespacedRouteForResource('namespaces')} className="btn btn-default" id="cancel">
                {t('CONTENT:CANCEL')}
              </Link>
            </ButtonBar>
          </fieldset>
        </form>
      </div>
    );
  }
}

export const CreateNamespace = ({ match: { params } }) => {
  const { t } = useTranslation();
  return <NamespaceFormComponent t={t} fixed={{ metadata: { namespace: params.ns } }} namespaceTypeAbstraction={params.type} titleVerb="Create" isCreate={true} />;
};
