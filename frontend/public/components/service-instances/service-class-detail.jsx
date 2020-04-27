import React from 'react';
import * as defaultImg from '../../imgs/img_catalog_default.svg';
import ReactMarkdown from 'react-markdown';
export const ServiceClassDetail = ({ detail }) => {
  const { name, imageUrl, description, providerDisplayName, markdownDescription, urlDescription } = detail;
  const onClickExpandIcon = (e) => {
    window.open(urlDescription);
  };
  return (
    <div style={{ height: '528px', width: '970px' }}>
      <div className="card-pf-items text-left" style={{ display: 'flex', marginTop: '10px', height: '120px' }}>
        <div className="card-logo" style={{ width: '70px', height: '70px', lineHeight: '70px', marginTop: '15px' }}>
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
          <p style={{ fontSize: '13px', color: '#6A6A6A', textAlign: 'initial' }}>{description}</p>
        </div>
      </div>
      <div style={{ position: 'relative', height: '90%' }}>
        {/* <ReactMarkdown source={markdownDescription} /> */}
        {/* iframe 영역위에 닫기버튼 (혹은 워터마크 등) 을 position: absolute; z-index:9999 등으로 작업 할 때에 ie 나 firefox 에서는 위 버튼이 보이지 않습니다. 그럴땐 iframe의 src 값에 wmode=transparent 를 추가하고 iframe 의 attribute 에 wmode="Opaque" 를 추가합니다. 소스는 다음과 같습니다. */}
        <span className={'pficon pficon-arrow'} style={{ position: 'absolute', right: '25px', top: '10px', fontSize: '20px' }} aria-hidden="true" onClick={onClickExpandIcon} ></span>
        <iframe style={{ width: '100%', height: '430px' }} src={urlDescription} target="_blank">{urlDescription}>
        <p>현재 사용 중인 브라우저는 iframe 요소를 지원하지 않습니다!</p>
        </iframe >
      </div>
    </div>
  );
};
