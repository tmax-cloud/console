import * as React from 'react';
import * as classNames from 'classnames';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { Button, Radio } from '@patternfly/react-core';
import { CustomMenusMap } from '@console/internal/hypercloud/menu/menu-types';
import { Section } from '@console/internal/components/hypercloud/utils/section';
import { getIngressUrl } from '@console/internal/components/hypercloud/utils/ingress-utils';
import { ButtonBar, LoadingBox } from '@console/internal/components/utils';
import { history } from '@console/internal/components/utils/router';
import { coFetchJSON } from '@console/internal/co-fetch';

const getHost = async () => {
  const mapUrl = (CustomMenusMap as any).Helm.url;
  return mapUrl !== '' ? mapUrl : await getIngressUrl('helm-apiserver');
};

type HelmrepositoryFormProps = {
  defaultValue?: any;
};
export const HelmrepositoryForm: React.FC<HelmrepositoryFormProps> = props => {
  const { t } = useTranslation();
  const { defaultValue } = props;
  const name = defaultValue ? Object.values(defaultValue?.indexfile.entries)[0][0].repo.name : '';
  const repoURL = defaultValue ? Object.values(defaultValue?.indexfile.entries)[0][0].repo.url : '';
  const [postName, setPostName] = React.useState(name);
  const [postRepoURL, setPostRepoURL] = React.useState(repoURL);
  const [postID, setPostID] = React.useState('');
  const [postPassword, setPostPassword] = React.useState('');
  const [inProgress, setProgress] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');
  const [host, setHost] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [isPrivate, setIsPrivate] = React.useState(false);

  React.useEffect(() => {
    const updateHost = async () => {
      const tempHost = await getHost();
      if (!tempHost || tempHost === '') {
        setErrorMessage('Helm Server is not found');
      }
      setHost(tempHost);
      setLoading(true);
    };
    updateHost();
  }, []);

  const onClick = () => {
    setProgress(true);
    const putHelmRepository = () => {
      const url = `${host}/helm/repos`;
      const payload = isPrivate
        ? {
            name: postName,
            repoURL: postRepoURL,
            is_private: isPrivate,
            id: postID,
            password: postPassword,
          }
        : { name: postName, repoURL: postRepoURL };
      coFetchJSON
        .post(url, payload)
        .then(() => {
          history.goBack();
        })
        .catch(e => {
          setProgress(false);
          setErrorMessage(`error : ${e.json.error}\ndescription : ${e.json.description}`);
        });
    };
    putHelmRepository();
  };
  const updatePostName = e => {
    setPostName(e.target.value);
  };
  const updatePostRepoURL = e => {
    setPostRepoURL(e.target.value);
  };
  const updatePostID = e => {
    setPostID(e.target.value);
  };
  const updatePostPassword = e => {
    setPostPassword(e.target.value);
  };
  const handleTypeChangePublic = () => {
    setIsPrivate(false);
  };
  const handleTypeChangePrivate = () => {
    setIsPrivate(true);
  };

  return (
    <div style={{ padding: '30px' }}>
      {loading ? (
        <ButtonBar inProgress={inProgress} errorMessage={errorMessage}>
          <form className="co-m-pane__body-group co-m-pane__form" method="post" action={`${host}/helm/repos`}>
            <div className="co-form-section__label">{t('SINGLE:MSG_HELMCHARTS_CREATEFORM_DIV2_1')}</div>
            <div className="co-form-subsection">
              <Section label={'리포지터리 타입'} id="repositorytype">
                <div className={classNames('co-radio-group', { 'co-radio-group--inline': true })}>
                  <div className="radio">
                    <Radio isChecked={isPrivate === false} onChange={handleTypeChangePublic} id="radio-1" label="Public" name="repository-type" />
                    <Radio isChecked={isPrivate === true} onChange={handleTypeChangePrivate} id="radio-2" label="Private" name="repository-type" />
                  </div>
                </div>
              </Section>
              <Section label={t('SINGLE:MSG_HELMCHARTS_CREATEFORM_DIV2_2')} id="name" isRequired={true}>
                <input className="pf-c-form-control" id="name" name="name" defaultValue={name} onChange={updatePostName} />
              </Section>
              <Section label={t('SINGLE:MSG_HELMCHARTS_CREATEFORM_DIV2_3')} id="repoURL" isRequired={true}>
                <input className="pf-c-form-control" id="repoURL" name="repoURL" defaultValue={repoURL} onChange={updatePostRepoURL} />
              </Section>
              {isPrivate && (
                <>
                  <Section label={t('SINGLE:MSG_VIRTUALMACHINES_CREATEFORM_STEP4_DIV2_5')} id="id" isRequired={true}>
                    <input className="pf-c-form-control" id="id" name="id" defaultValue={postID} onChange={updatePostID} />
                  </Section>
                  <Section label={t('SINGLE:MSG_VIRTUALMACHINES_CREATEFORM_STEP4_DIV2_6')} id="password" isRequired={true}>
                    <input className="pf-c-form-control" id="password" name="password" defaultValue={postPassword} onChange={updatePostPassword} />
                  </Section>
                </>
              )}
            </div>
            <div className="co-form-section__separator" />
            <Button type="button" variant="primary" id="save" onClick={onClick} isDisabled={!host}>
              {defaultValue ? t('COMMON:MSG_DETAILS_TAB_18') : t('COMMON:MSG_COMMON_BUTTON_COMMIT_1')}
            </Button>
            <Button
              style={{ marginLeft: '10px' }}
              type="button"
              variant="secondary"
              id="cancel"
              onClick={() => {
                history.goBack();
              }}
            >
              {t('COMMON:MSG_COMMON_BUTTON_COMMIT_2')}
            </Button>
          </form>
        </ButtonBar>
      ) : (
        <LoadingBox />
      )}
    </div>
  );
};
export const HelmrepositoryCreatePage = () => {
  const { t } = useTranslation();
  return (
    <>
      <Helmet>
        <title>{t('COMMON:MSG_MAIN_CREATEBUTTON_1', { 0: t('SINGLE:MSG_HELMCHARTS_HELMCHARTDETAILS_TABDETAILS_1') })}</title>
      </Helmet>
      <div style={{ marginLeft: '15px' }}>
        <h1>{t('COMMON:MSG_MAIN_CREATEBUTTON_1', { 0: t('SINGLE:MSG_HELMCHARTS_HELMCHARTDETAILS_TABDETAILS_1') })}</h1>
      </div>
      <HelmrepositoryForm />
    </>
  );
};
