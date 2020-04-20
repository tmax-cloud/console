import React from 'react';
import * as defaultImg from '../../imgs/img_catalog_default.svg';

export const ServiceClassDetail = ({ detail }) => {
  const { name, imageUrl, description, providerDisplayName, markdownDescription, urlDescription } = detail;
  return (
    <div>
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
          <h2 className="card-pf-title" style={{ fontSize: '13px', color: '#222222', fontWeight: 'bold' }}>
            {name}
          </h2>
          <span className="card-pf-item-text" style={{ color: '#222222', fontSize: '13px' }}>
            {providerDisplayName}
          </span>
          <p style={{ margin: '10px 0 0 0', fontSize: '13px', color: '#6A6A6A', textAlign: 'initial' }}>{description}</p>
        </div>
      </div>
      <hr />
      <div>
        <p style={{ margin: '10px 0 0 0', fontSize: '13px', color: '#6A6A6A', textAlign: 'initial' }}>{markdownDescription}</p>
        <a style={{ margin: '10px 0 0 0', fontSize: '13px', color: '#6A6A6A', textAlign: 'initial' }} href={urlDescription} target="_blank">{urlDescription}</a>
      </div>
    </div>
  );
};
