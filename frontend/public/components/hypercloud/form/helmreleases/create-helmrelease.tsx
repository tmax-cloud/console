import * as React from 'react';
import * as _ from 'lodash';
import * as fuzzy from 'fuzzysearch';
import { useTranslation } from 'react-i18next';
import { match as RMatch } from 'react-router';
import { useFormContext, useWatch, Controller } from 'react-hook-form';
import { safeDump } from 'js-yaml';
import { coFetchJSON } from '@console/internal/co-fetch';
import { Section } from '@console/internal/components/hypercloud/utils/section';
import { Dropdown } from '@console/internal/components/utils';
import { DropdownWithRef } from '../../utils/dropdown-new';
import YAMLEditor from '@console/shared/src/components/editor/YAMLEditor';
import { getQueryArgument } from '@console/internal/components/utils';
import { HelmReleaseModel } from '@console/internal/models/hypercloud/helm-model';
import { WithCommonForm } from '../create-form';
import { TextInput } from '../../utils/text-input';
import { TextArea } from '../../utils/text-area';
import { getNamespace } from '@console/internal/components/utils/link';
import { getHelmHost } from '@console/internal/actions/utils/nonk8s-utils'

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
  const defaultYamlValues = defaultValues ? defaultValues.config : null;
  const defaultRepoName = queryChartRepo ? queryChartRepo : '';

  const [loading, setLoading] = React.useState(false);
  const [selectChartName, setSelectChartName] = React.useState(defaultChartName);
  const [yamlValues, setYamlValues] = React.useState(defaultYamlValues ? safeDump(defaultYamlValues) : null);
  const [entries, setEntries] = React.useState([]);
  const [chartNameList, setChartNameList] = React.useState({});
  const [versions, setVersions] = React.useState([]);
  const [selectRepoName, setSelectRepoName] = React.useState(defaultRepoName);
  const [editLoading, setEditLoading] = React.useState(defaultValues.name !== '');
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
      const tempHost = await getHelmHost();
      const namespace = getNamespace(window.location.pathname);
      setPostUrl(defaultReleaseName ? `${tempHost}/helm/v1/namespaces/${namespace}/releases/${defaultReleaseName}` : `${tempHost}/helm/v1/namespaces/${namespace}/releases`);
    };
    getUrl();
    const fetchHelmChart = async () => {
      const tempHost = await getHelmHost();
      if (!tempHost || tempHost === '') {
        methods.setValue('error', 'Helm Server is not found');
      }
      setHost(tempHost);
      await coFetchJSON(`${tempHost}/helm/v1/charts`).then(res => {
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
      const tempHost = await getHelmHost();
      await coFetchJSON(`${tempHost}/helm/v1/charts/${selectRepoName}_${selectChartName}`).then(res => {
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
      await coFetchJSON(`${host}/helm/v1/charts/${selectRepoName}_${selectChartName}/versions/${selectedVersion}`).then(res => {
        const entryValue = Object.values(_.get(res, 'indexfile.entries'))[0];
        methods.setValue('packageURL', entryValue[0].urls[0]);
        !editLoading && setYamlValues(safeDump(_.get(res, 'values')));
        setEditLoading(false);
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
    kind: HelmReleaseModel.kind,
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
