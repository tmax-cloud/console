import React, { Component } from 'react';

class ServiceClassCard extends Component {
  constructor(props) {
    super(props);
  }
  handleActive = e => {
    if (e.target.closest('.card-pf').classList.contains('active')) {
      e.target.classList.remove('active');
    } else {
      document.querySelectorAll('.card-pf-view-single-select').forEach(card => {
        card.classList.remove('active');
      });
      e.target.closest('.card-pf').classList.add('active');
    }
  };
  render() {
    const { isRecommended, isNew } = this.props;
    return (
      <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
        <div
          className="card-pf card-pf-view card-pf-view-select card-pf-view-single-select"
          onClick={this.handleActive}
        >
          <div className="card-bookmark">
            <i
              className="fa fa-bookmark"
              aria-hidden="true"
              style={{
                visibility: isRecommended ? 'visible' : 'hidden',
                fontSize: '3rem',
                color: '#fec000',
                margin: '0 5px 0 0',
              }}
            ></i>
            <i
              className="fa fa-bookmark"
              aria-hidden="true"
              style={{
                fontSize: '3rem',
                visibility: isNew ? 'visible' : 'hidden',
                color: 'red',
              }}
            ></i>
          </div>
          <div className="card-pf-body">
            <div
              className="card-pf-items text-center"
              style={{ display: 'flex' }}
            >
              <img
                width="70px"
                height="70px"
                src="data:image/png;base64,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"
              />
              <div className="card-pf-item">
                <h2 className="card-pf-title text-center">Node js</h2>
                <span
                  className="card-pf-item-text"
                  style={{ color: '#787878', fontSize: '12px' }}
                >
                  NODEJS
                </span>
              </div>
            </div>
            <div className="card-pf-items text-center">
              <p className="card-pf-info text-center">
                요약 설명요약 설명요약 설명요약 설명요약 설명요약 설명요약
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
    // </div>
  );
};

const CardList = ({ data }) => {
  return (
    <div className="cards-pf">
      <div className="container-fluid container-cards-pf">
        <div className="row row-cards-pf">
          {data.map(item => (
            <ServiceClassCard
              isRecommended={true}
              isNew={true}
            ></ServiceClassCard>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CardList;
