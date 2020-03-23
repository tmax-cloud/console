/* eslint-disable no-undef */
import * as React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { formatNamespacedRouteForResource } from '../ui/ui-actions';
import { CardList } from './card';



// Requestform returns SubForm which is a Higher Order Component for all the types of secret forms.
class ServiceInstanceFormComponent extends React.Component {
  constructor(props) {
    super(props);
    // this.state = {
    //   serviceInstanceTypeAbstraction: this.props.serviceInstanceTypeAbstraction,
    // };
    this.save = this.save.bind(this);
  }
  save(e) {
  }
  render() {
    const title = 'Create';
    return <div className="co-m-pane__body">
      <Helmet>
        <title>{title}</title>
      </Helmet>
      <form className="co-m-pane__body-group co-create-secret-form" onSubmit={this.save}>
        <h1 className="co-m-pane__heading">{title}</h1>
        <CardList data={[{isNew: true, isRecommended: true}, {isNew: false, isRecommended:false},{isNew: true, isRecommended: true},{isNew: true, isRecommended: false},{},{},{},{},{},{}]}/>
        <p className="co-m-pane__explanation">폼 형식을 통한 템플릿 인스턴스 생성</p>
        <button type="submit" className="btn btn-primary" id="save-changes">Create</button>
        <Link to={formatNamespacedRouteForResource('serviceinstances')} className="btn btn-default" id="cancel">Cancel</Link>
      </form>
    </div>;
  }
};

export const CreateServiceInstance = () => {
  return <ServiceInstanceFormComponent/>;
};

/* eslint-enable no-undef */