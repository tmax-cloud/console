import React, { Component } from 'react';

import * as newImg from '../imgs/ic_new.svg';
import * as recommendImg from '../imgs/ic_recommend.svg';
import * as defaultImg from '../imgs/img_catalog_default.svg';
import { serviceClassModal } from './modals';

class ServiceClassCard extends Component {
  constructor(props) {
    super(props);
    this.onClickCard = this.onClickCard.bind(this);
  }
  onClickCard(serviceClass) {
    this.props.onChangeClass(serviceClass);
  }
  render() {
    const { selectedClass } = this.props;
    const { uid, name, imageUrl, description, providerDisplayName, recommend, isNew } = this.props.serviceClass;
    const isActive = selectedClass && selectedClass.uid === uid;
    return (
      <div className="col-xs-12 col-sm-6 col-md-4 col-lg-2" onClick={() => this.onClickCard(this.props.serviceClass)} style={{ paddingLeft: '10px', paddingRight: '10px' }}>
        <div
          className="card-pf card-pf-view card-pf-view-select card-pf-view-single-select"
          style={{
            height: '184px',
            margin: '0 0 20px',
            padding: '0 20px 20px 20px',
            border: '1px solid #C5C5C8',
            borderRadius: '2px',
            background: `${isActive ? '#CAD7E5 100%' : 'inherit'}`,
          }}
        >
          <div className="card-bookmark" style={{ marginLeft: '-10px' }}>
            <img
              src={recommendImg}
              style={{
                display: recommend ? 'inline-block' : 'none',
                marginRight: '10px',
              }}
            />
            <img
              src={newImg}
              style={{
                visibility: isNew ? 'visible' : 'hidden',
              }}
            />
            <button
              style={{ marginTop: '10px', width: '27px', height: '27px', border: '1px solid #677E9A', background: 'white' }}
              type="button"
              className="pull-right"
              onClick={e => {
                e.preventDefault();
                console.log('click');
                serviceClassModal({ detail: this.props.serviceClass });
              }}
            >
              <i className="fa fa-info" />
            </button>
          </div>
          <div className="card-pf-body" style={{ margin: '0', padding: '0' }}>
            <div className="card-pf-items text-left" style={{ display: 'flex', marginTop: '10px' }}>
              <div className="card-logo" style={{ width: '70px', height: '70px', lineHeight: '70px' }}>
                <img
                  style={{ verticalAlign: 'middle' }}
                  width="100%"
                  height="auto"
                  src={imageUrl || defaultImg}
                  onError={e => {
                    e.target.onerror = null;
                    e.target.src = defaultImg;
                  }}
                />
              </div>
              <div className="card-pf-item" style={{ paddingLeft: '20px' }}>
                <h2 className="card-pf-title text-left" style={{ fontSize: '13px', color: '#222222', fontWeight: 'bold' }}>
                  {name}
                </h2>
                <span className="card-pf-item-text text-left" style={{ color: '#222222', fontSize: '13px' }}>
                  {providerDisplayName}
                </span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-center" style={{ margin: '10px 0 0 0', fontSize: '13px', color: '#6A6A6A', textAlign: 'initial' }}>
                {description}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const Card = () => {
  return (
    <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
      <div className="card-pf card-pf-view card-pf-view-select card-pf-view-single-select">
        <div className="card-pf-body">
          <div className="card-pf-top-element">
            <span className="fa fa-birthday-cake card-pf-icon-circle"></span>
          </div>
          <h2 className="card-pf-title text-center">Cake Service</h2>
          <div className="card-pf-items text-center">
            <div className="card-pf-item">
              <span className="pficon pficon-screen"></span>
              <span className="card-pf-item-text">8</span>
            </div>
            <div className="card-pf-item">
              <span className="fa fa-check"></span>
            </div>
          </div>
          <p className="card-pf-info text-center">
            <strong>Created On</strong> 2015-03-01 02:00 AM <br /> Never Expires
          </p>
        </div>
      </div>
    </div>
  );
};

export const CardList0 = ({ data }) => {
  return (
    <div className="cards-pf">
      <div className="container-fluid container-cards-pf">
        <div className="row row-cards-pf">
          {data.map((item, index) => (
            <Card key={index} isRecommended={true} isNew={true} />
          ))}
        </div>
      </div>
    </div>
  );
};

export class CardList extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    // const { classList, selectedClassId } = this.state;
    const { classList, selectedClass, onChangeClass } = this.props;
    return (
      <div className="cards-pf" style={{ background: 'inherit' }}>
        <div className="container-fluid container-cards-pf" style={{ padding: '0px' }}>
          <div className="row row-cards-pf" style={{ padding: 0 }}>
            {classList.map(item => (
              <ServiceClassCard serviceClass={item} key={item.uid} selectedClass={selectedClass} onChangeClass={onChangeClass} />
            ))}
          </div>
        </div>
      </div>
    );
  }
}
