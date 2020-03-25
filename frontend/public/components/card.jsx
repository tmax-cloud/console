import React, { Component } from 'react';

import * as newImg from '../imgs/ic_new.svg';
import * as recommendImg from '../imgs/ic_recommend.svg';
import * as defaultImg from '../imgs/img_catalog_default.svg';

class ServiceClassCard extends Component {
  constructor(props) {
    super(props);
  }
  // TODO: active props로 빼기
  // handleActive = e => {
  //   if (e.target.closest('.card-pf').classList.contains('active')) {
  //     e.target.classList.remove('active');
  //   } else {
  //     const cardList = document.querySelectorAll('.card-pf-view-single-select');
  //     Array.prototype.forEach.call(cardList, (card) => {
  //       card.classList.remove('active');
  //     });
  //     e.target.closest('.card-pf').classList.add('active');
  //   }
  // };
  render() {
    const { onClickCard } = this.props;
    const { uid, name, imageUrl, description, providerDisplayName, isRecommended, isNew, isActive } = this.props.serviceClass;
    return (
      <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3" onClick={() => onClickCard(uid)} style={{ paddingLeft: '10px', paddingRight: '10px' }}>
        <div className={`card-pf card-pf-view card-pf-view-select card-pf-view-single-select ${isActive && 'active'}`} style={{ height: '184px', margin: '0 0 20px', padding: '0 20px 20px 20px', border: `${!isActive ? '1px solid #C5C5C8' : '1px solid #39a5dc'}`, borderRadius: '2px' }}>
          <div className="card-bookmark" style={{ marginLeft: '-10px' }}>
            <img
              src={recommendImg}
              style={{
                display: isRecommended ? 'inline-block' : 'none',
                marginRight: '10px',
              }}
            />
            <img
              src={newImg}
              style={{
                visibility: isNew ? 'visible' : 'hidden',
              }}
            />
          </div>
          <div className="card-pf-body" style={{ margin: '0', padding: '0' }}>
            <div className="card-pf-items text-center" style={{ display: 'flex', marginTop: '10px' }}>
              <div className="card-logo" style={{ width: '70px', height: '70px', lineHeight: '70px' }}>
                <img style={{ verticalAlign: 'middle' }} width="100%" height="auto" src={imageUrl || defaultImg} />
              </div>
              <div className="card-pf-item" style={{ paddingLeft: '20px' }}>
                <h2 className="card-pf-title text-center" style={{ fontSize: '13px', color: '#222222', fontWeight: 'bold' }}>
                  {name}
                </h2>
                <span className="card-pf-item-text" style={{ color: '#222222', fontSize: '13px' }}>
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
    this.state = {
      classList: [],
      cachedClassList: null,
    };
    //  { isNew: true, isRecommended: true }, { isNew: false, isRecommended: false }, { isNew: true, isRecommended: true }, { isNew: true, isRecommended: false }, {}, {}, {}, {}, {}, { isRecommended: true }
  }
  static getDerivedStateFromProps(nextProps, prevState) {
    // console.log('getDerivedStateFromProps', nextProps.classList, prevState.classList,  prevState.cachedClassList);
    // console.log('nextProps', nextProps.classList === prevState.cachedClassList);
    // console.log('prevState', nextProps.classList === prevState.cachedClassList);

    if (prevState.classList !== prevState.cachedClassList) {
      return {
        cachedClassList: prevState.classList,
        classList: prevState.classList,
      };
    } else if (nextProps.classList !== prevState.cachedClassList) {
      return {
        cachedClassList: nextProps.classList,
        classList: nextProps.classList,
      };
    }
    return null;
  }
  onClickCard = uid => {
    this.setState({
      classList: this.state.classList.map(item => (uid === item.uid ? { ...item, isActive: true } : { ...item, isActive: false })),
    });
  };
  // active state 관리
  render() {
    const { classList } = this.state;
    return (
      <div className="cards-pf" style={{ background: 'inherit' }}>
        <div className="container-fluid container-cards-pf" style={{ padding: '0px' }}>
          <div className="row row-cards-pf" style={{ padding: 0 }}>
            {classList.map(item => (
              <ServiceClassCard serviceClass={item} key={item.uid} onClickCard={this.onClickCard} />
            ))}
          </div>
        </div>
      </div>
    );
  }
}
