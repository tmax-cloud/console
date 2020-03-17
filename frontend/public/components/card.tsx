import * as React from 'react';

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
            <Card></Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CardList;
