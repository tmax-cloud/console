import * as React from 'react';
import * as _ from 'lodash';
import * as fuzzy from 'fuzzysearch';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';
import { match as RMatch } from 'react-router';
import { useFormContext, useWatch, Controller } from 'react-hook-form';
import { safeDump } from 'js-yaml';
import { Button } from '@patternfly/react-core';
import { coFetchJSON } from '@console/internal/co-fetch';
import { Section } from '@console/internal/components/hypercloud/utils/section';
import { ButtonBar, Dropdown } from '@console/internal/components/utils';
import { DropdownWithRef } from '../../utils/dropdown-new';
import { history } from '@console/internal/components/utils/router';
import { getIdToken } from '@console/internal/hypercloud/auth';
import YAMLEditor from '@console/shared/src/components/editor/YAMLEditor';
import { getQueryArgument } from '@console/internal/components/utils';
import { CustomMenusMap } from '@console/internal/hypercloud/menu/menu-types';
import { getIngressUrl } from '@console/internal/components/hypercloud/utils/ingress-utils';
import { HelmReleasePageProps } from '@console/internal/components/hypercloud/helmrelease';
import { HelmReleaseModel } from '@console/internal/models/hypercloud/helm-model';
import { WithCommonForm } from '../create-form';
import { TextInput } from '../../utils/text-input';
import { TextArea } from '../../utils/text-area';
import { getNamespace } from '@console/internal/components/utils/link';

const getHost = async () => {
  const mapUrl = (CustomMenusMap as any).Helm.url;
  return mapUrl !== '' ? mapUrl : await getIngressUrl('helm-apiserver');
};

const defaultValuesTemplate = {
  name: '',
  chart: {
    metadata: {
      name: '',
      version: '',
      values: null,
    },
  },
};

const repositoryFormFactory = (params, obj) => {
  const defaultValues = obj || defaultValuesTemplate;
  return WithCommonForm(CreateHelmReleaseComponent, params, defaultValues, HelmReleaseModel);
};
const CreateHelmReleaseComponent: React.FC<HelmReleaseFormProps> = props => {
  const methods = useFormContext();
  const {
    control: {
      defaultValuesRef: { current: defaultValues },
    },
  } = methods;
  const { t } = useTranslation();
  const queryChartName = getQueryArgument('chartName');
  const queryChartRepo = getQueryArgument('chartRepo');
  const defaultChartName = queryChartName ? queryChartName : defaultValues ? defaultValues.chart.metadata.name : '';
  const defaultReleaseName = defaultValues ? defaultValues.name : '';
  const defaultVersion = defaultValues ? defaultValues.chart.metadata.version : '';
  const defaultYamlValues = defaultValues ? defaultValues.chart.values : null;
  const defaultRepoName = queryChartRepo ? queryChartRepo : '';

  const [loading, setLoading] = React.useState(false);
  const [selectChartName, setSelectChartName] = React.useState(defaultChartName);
  const [yamlValues, setYamlValues] = React.useState(defaultYamlValues ? safeDump(defaultYamlValues) : null);
  const [entries, setEntries] = React.useState([]);
  const [chartNameList, setChartNameList] = React.useState({});
  const [versions, setVersions] = React.useState([]);
  const [selectRepoName, setSelectRepoName] = React.useState(defaultRepoName);

  const [host, setHost] = React.useState('');

  const version = useWatch<{ value: string; label: string }>({
    control: methods.control,
    name: 'version',
    defaultValue: { value: defaultVersion, label: defaultVersion },
  });
  const packageURL = useWatch<string>({
    control: methods.control,
    name: 'packageURL',
  });

  // const noEntryMessageTest = 'This chart is not on the server';

  const [postUrl, setPostUrl] = React.useState('');
  React.useEffect(() => {
    const getUrl = async () => {
      const tempHost = await getHost();
      const namespace = getNamespace(window.location.pathname);
      setPostUrl(`${tempHost}/helm/ns/${namespace}/releases`);
    };
    getUrl();
    const fetchHelmChart = async () => {
      const tempHost = await getHost();
      if (!tempHost || tempHost === '') {
        methods.setValue('error', 'Helm Server is not found');
      }
      setHost(tempHost);
      await coFetchJSON(`${tempHost}/helm/charts`).then(res => {
        let tempEntriesList = [];
        let tempChartObject = {};
        const entriesvalues = Object.values(_.get(res, 'indexfile.entries'));
        entriesvalues.map((entries: any) => {
          entries.map(e => {
            tempEntriesList.push(e);
            let tempObject = { [e.name]: e.name };
            _.merge(tempChartObject, tempObject);
          });
        });
        if (defaultValues.name !== '') {
          const entry = tempEntriesList.filter(e => {
            if (e.name === tempChartObject[defaultChartName]) return true;
          })[0];
          methods.setValue('packageURL', entry ? entry.urls[0] : null);
        }
        setEntries(tempEntriesList);
        setChartNameList(tempChartObject);
        if (defaultChartName) {
          const selectedEntry = tempEntriesList.filter(e => {
            if (e.name === defaultChartName) return true;
          })[0];
          setSelectRepoName(selectedEntry.repo?.name);
        }
        setLoading(true);
      });
    };
    fetchHelmChart();
  }, []);

  React.useEffect(() => {
    const getVersions = async () => {
      const tempHost = await getHost();
      await coFetchJSON(`${tempHost}/helm/charts/${selectRepoName}_${selectChartName}`).then(res => {
        const tempVersionsList = _.get(res, 'versions');
        if (tempVersionsList) {
          let tempVersionsObjectList = [];
          tempVersionsList.map((version: any) => {
            let tempObject = { label: version, value: version };
            tempVersionsObjectList.push(tempObject);
          });
          setVersions(tempVersionsObjectList);
        }
      });
    };
    getVersions();
    methods.setValue('version', { value: defaultVersion, label: defaultVersion });
    methods.setValue('packageURL', '');
    setYamlValues(defaultYamlValues ? safeDump(defaultYamlValues) : null);
  }, [selectChartName, selectRepoName]);

  const updateChartName = (selection: string) => {
    setSelectChartName(selection);
    const selectedEntry = entries.filter(e => {
      if (e.name === chartNameList[selection]) return true;
    })[0];
    setSelectRepoName(selectedEntry.repo?.name);
  };

  React.useEffect(() => {
    const selectedVersion =
      versions.length > 0 && version.label !== ''
        ? versions.filter(e => {
            if (e.label === version.label) return true;
          })[0].value
        : '';
    const setChartVersion = async () => {
      await coFetchJSON(`${host}/helm/charts/${selectRepoName}_${selectChartName}/versions/${selectedVersion}`).then(res => {
        const entryValue = Object.values(_.get(res, 'indexfile.entries'))[0];
        methods.setValue('packageURL', entryValue[0].urls[0]);
        setYamlValues(safeDump(_.get(res, 'values')));
      });
    };
    versions.length > 0 ? setChartVersion() : methods.setValue('version', { value: defaultVersion, label: defaultVersion });
  }, [version]);

  const updateYamlValues = (newValue, event) => {
    setYamlValues(newValue);
    return {};
  };

  React.useEffect(() => {
    methods.setValue('values', yamlValues);
  }, [yamlValues]);

  React.useEffect(() => {
    methods.setValue('postUrl', postUrl);
  }, [postUrl]);

  return (
    <>
      <Section label={t('SINGLE:MSG_HELMRELEASES_CREATEFORM_DIV2_1')} id="releaseName" isRequired={true}>
        <>
          <TextInput inputClassName="pf-c-form-control" id="releaseName" name="releaseName" defaultValue={defaultReleaseName} hidden={defaultReleaseName !== ''} />
          {defaultReleaseName !== '' && <p>{defaultReleaseName}</p>}
        </>
      </Section>
      {loading && (
        <Section label={t('SINGLE:MSG_HELMRELEASES_CREATEFORM_DIV2_2')} id="chartName" isRequired={true}>
          <Dropdown
            name="chartName"
            className="btn-group"
            title={selectChartName || t('SINGLE:MSG_HELMRELEASES_CREATEFORM_DIV2_3')}
            items={chartNameList} // (필수)
            required={true}
            onChange={updateChartName}
            buttonClassName="dropdown-btn" // 선택된 아이템 보여주는 button (title) 부분 className
            itemClassName="dropdown-item" // 드롭다운 아이템 리스트 전체의 className - 각 row를 의미하는 것은 아님
            disabled={defaultValues.name !== ''}
            autocompleteFilter={fuzzy}
          />
        </Section>
      )}
      {selectChartName && (
        <>
          <Section label={t('SINGLE:MSG_HELMRELEASES_CREATEFORM_DIV2_6')} id="version">
            <Controller
              as={<DropdownWithRef name="version" defaultValue={{ value: defaultVersion, label: defaultVersion }} methods={methods} useResourceItemsFormatter={false} items={versions} placeholder={t('SINGLE:MSG_HELMRELEASES_CREATEFORM_DIV2_6')} />}
              control={methods.control}
              name="version"
              onChange={([selected]) => {
                return { value: selected };
              }}
              defaultValue={{ value: defaultVersion, label: defaultVersion }}
            />
          </Section>
          {packageURL && (
            <Section label={t('SINGLE:MSG_HELMRELEASES_CREATEFORM_DIV2_4')} id="Package URL">
              <p>{packageURL}</p>
            </Section>
          )}
        </>
      )}
      {yamlValues !== undefined && yamlValues !== null && <YAMLEditor value={yamlValues} minHeight="300px" onChange={updateYamlValues} showShortcuts={true} />}
      <TextInput inputClassName="pf-c-form-control" id="packageURL" name="packageURL" defaultValue="" hidden={true} />
      <TextArea inputClassName="pf-c-form-control" id="values" name="values" defaultValue="" hidden={true} />
      <TextInput inputClassName="pf-c-form-control" id="postUrl" name="postUrl" defaultValue="" hidden={true} />
    </>
  );
};

export const CreateHelmRelease: React.FC<CreateHelmReleaseProps> = props => {
  const formComponent = repositoryFormFactory(props.match.params, props.obj);
  const HelmReleaseFormComponent = formComponent;
  return <HelmReleaseFormComponent fixed={{}} explanation={''} titleVerb="Create" onSubmitCallback={onSubmitCallback} isCreate={true} useDefaultForm={false} />;
};

export const onSubmitCallback = data => {
  const returnData = {
    nonK8sResource: true,
    kind: 'HelmRelease',
    postUrl: data.postUrl,
    releaseRequestSpec: {
      packageURL: data.packageURL,
      releaseName: data.releaseName,
      version: data.version.value,
    },
    values: data.values,
  };
  return returnData;
};

type CreateHelmReleaseProps = {
  match: RMatch<{
    ns?: string;
  }>;
  fixed: object;
  explanation: string;
  titleVerb: string;
  saveButtonText?: string;
  isCreate: boolean;
  obj?: any;
};

type HelmReleaseFormProps = {
  onChange: Function;
  stringData: {
    [key: string]: string;
  };
  isCreate: boolean;
};

type HelmreleasesFormProps = {
  namespace: string;
  defaultValue?: any;
};
export const HelmreleasesForm: React.FC<HelmreleasesFormProps> = props => {
  const { t } = useTranslation();
  const { defaultValue, namespace } = props;
  const queryChartName = getQueryArgument('chartName');
  const queryChartRepo = getQueryArgument('chartRepo');
  const chartName = queryChartName ? queryChartName : defaultValue ? defaultValue.chart.metadata.name : '';
  const releaseName = defaultValue ? defaultValue.name : '';
  const version = defaultValue ? defaultValue.chart.metadata.version : '';
  const values = defaultValue ? defaultValue.chart.values : null;
  const repoName = queryChartRepo ? queryChartRepo : '';

  const [loading, setLoading] = React.useState(false);
  const [selectChartName, setSelectChartName] = React.useState(chartName);
  const [postPackageURL, setPostPackageURL] = React.useState('');
  const [postReleaseName, setPostReleaseName] = React.useState(releaseName);
  const [postVersion, setPostVersion] = React.useState(version);
  const [postValues, setPostValues] = React.useState(values ? safeDump(values) : '');
  const [inProgress, setProgress] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');
  const [entries, setEntries] = React.useState([]);
  const [chartNameList, setChartNameList] = React.useState({});
  const [versions, setVersions] = React.useState({});
  const [selectRepoName, setSelectRepoName] = React.useState(repoName);

  const [host, setHost] = React.useState('');

  const noEntryMessageTest = 'This chart is not on the server';

  React.useEffect(() => {
    const fetchHelmChart = async () => {
      const tempHost = await getHost();
      if (!tempHost || tempHost === '') {
        setErrorMessage('Helm Server is not found');
      }
      setHost(tempHost);
      await coFetchJSON(`${tempHost}/helm/charts`).then(res => {
        let tempEntriesList = [];
        let tempChartObject = {};
        const entriesvalues = Object.values(_.get(res, 'indexfile.entries'));
        entriesvalues.map((entries: any) => {
          entries.map(e => {
            tempEntriesList.push(e);
            let tempObject = { [e.name]: e.name };
            _.merge(tempChartObject, tempObject);
          });
        });
        if (defaultValue) {
          const entry = tempEntriesList.filter(e => {
            if (e.name === tempChartObject[chartName]) return true;
          })[0];
          setPostPackageURL(entry ? entry.urls[0] : null);
        }
        setEntries(tempEntriesList);
        setChartNameList(tempChartObject);
        setLoading(true);
      });
    };
    fetchHelmChart();
  }, []);
  React.useEffect(() => {
    const getVersions = async () => {
      await coFetchJSON(`${host}/helm/charts/${selectRepoName}_${selectChartName}`).then(res => {
        const tempVersionsList = _.get(res, 'versions');
        if (tempVersionsList) {
          let tempVersionsObject = {};
          tempVersionsList.map((version: any) => {
            let tempObject = { [version]: version };
            _.merge(tempVersionsObject, tempObject);
          });
          setVersions(tempVersionsList);
        }
      });
    };
    getVersions();
  }, [selectChartName]);

  const onClick = () => {
    setProgress(true);
    const putHelmChart = () => {
      const url = `${host}/helm/ns/${namespace}/releases`;
      const payload = {
        releaseRequestSpec: {
          packageURL: postPackageURL,
          releaseName: postReleaseName,
          version: postVersion,
        },
        values: postValues,
      };
      coFetchJSON
        .post(url, payload, { headers: { 'user-token': getIdToken() } })
        .then(() => {
          history.goBack();
        })
        .catch(e => {
          setProgress(false);
          setErrorMessage(`error : ${e.json.error}\ndescription : ${e.json.description}`);
        });
    };
    putHelmChart();
  };
  const updatePostReleaseName = e => {
    setPostReleaseName(e.target.value);
  };
  const updatePostValues = (newValue, event) => {
    setPostValues(newValue);
    return {};
  };
  const updateChartName = (selection: string) => {
    setSelectChartName(selection);
    const selectedEntry = entries.filter(e => {
      if (e.name === chartNameList[selection]) return true;
    })[0];
    setSelectRepoName(selectedEntry.repo?.name);
  };
  const updateVersion = (selection: string) => {
    const selectedVersion = versions[selection];
    setPostVersion(selectedVersion ? selectedVersion : noEntryMessageTest);
    const setChartVersion = async () => {
      await coFetchJSON(`${host}/helm/charts/${selectRepoName}_${selectChartName}/versions/${selectedVersion}`).then(res => {
        const entryValue = Object.values(_.get(res, 'indexfile.entries'))[0];
        setPostPackageURL(entryValue[0].urls[0]);
        setPostValues(safeDump(_.get(res, 'values')));
      });
    };
    setChartVersion();
  };

  return (
    <div style={{ padding: '30px' }}>
      {loading && (
        <ButtonBar inProgress={inProgress} errorMessage={errorMessage}>
          <form className="co-m-pane__body-group co-m-pane__form" method="post" action={`${host}/helm/repos`}>
            <Section label={t('SINGLE:MSG_HELMRELEASES_CREATEFORM_DIV2_1')} id="releaseName" isRequired={true}>
              {defaultValue ? <p>{releaseName}</p> : <input className="pf-c-form-control" id="releaseName" name="releaseName" defaultValue={releaseName} onChange={updatePostReleaseName} disabled={defaultValue} />}
            </Section>
            <Section label={t('SINGLE:MSG_HELMRELEASES_CREATEFORM_DIV2_2')} id="chartName" isRequired={true}>
              {defaultValue ? (
                <p>{selectChartName}</p>
              ) : (
                <Dropdown
                  name="chartName"
                  className="btn-group"
                  title={selectChartName || t('SINGLE:MSG_HELMRELEASES_CREATEFORM_DIV2_3')}
                  items={chartNameList} // (필수)
                  required={true}
                  onChange={updateChartName}
                  buttonClassName="dropdown-btn" // 선택된 아이템 보여주는 button (title) 부분 className
                  itemClassName="dropdown-item" // 드롭다운 아이템 리스트 전체의 className - 각 row를 의미하는 것은 아님
                  disabled={defaultValue}
                  autocompleteFilter={fuzzy}
                />
              )}
            </Section>
            {selectChartName && (
              <>
                <Section label={t('SINGLE:MSG_HELMRELEASES_CREATEFORM_DIV2_6')} id="version">
                  {defaultValue ? (
                    <p>{postVersion}</p>
                  ) : (
                    <Dropdown
                      name="chartName"
                      className="btn-group"
                      title={t('SINGLE:MSG_HELMRELEASES_CREATEFORM_DIV2_6')}
                      items={versions} // (필수)
                      required={true}
                      onChange={updateVersion}
                      buttonClassName="dropdown-btn" // 선택된 아이템 보여주는 button (title) 부분 className
                      itemClassName="dropdown-item" // 드롭다운 아이템 리스트 전체의 className - 각 row를 의미하는 것은 아님
                      disabled={defaultValue}
                      autocompleteFilter={fuzzy}
                    />
                  )}
                </Section>
                {postPackageURL && (
                  <Section label={t('SINGLE:MSG_HELMRELEASES_CREATEFORM_DIV2_4')} id="Package URL">
                    <p>{postPackageURL}</p>
                  </Section>
                )}
              </>
            )}
            {postValues && <YAMLEditor value={postValues} minHeight="300px" onChange={updatePostValues} showShortcuts={true} />}
            <div style={{ marginTop: '10px' }}>
              <Button type="button" variant="primary" id="save" onClick={onClick} isDisabled={!postPackageURL && !host}>
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
            </div>
          </form>
        </ButtonBar>
      )}
    </div>
  );
};

export const HelmReleaseCreatePage: React.FC<HelmReleasePageProps> = ({ match }) => {
  const namespace = match.params.ns;
  const { t } = useTranslation();
  return (
    <>
      <Helmet>
        <title>{t('COMMON:MSG_LNB_MENU_203')}</title>
      </Helmet>
      <div style={{ background: 'white', height: '100%' }}>
        <div style={{ marginLeft: '15px' }}>
          <h1>{t('COMMON:MSG_MAIN_CREATEBUTTON_1', { 0: t('COMMON:MSG_LNB_MENU_203') })}</h1>
        </div>
        <HelmreleasesForm namespace={namespace} />
      </div>
    </>
  );
};
