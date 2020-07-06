import * as _ from 'lodash-es';
import * as React from 'react';
import { Helmet } from 'react-helmet';
import * as PropTypes from 'prop-types';

import { history, NavTitle, SelectorInput, LoadingBox } from './utils';
import { namespaceProptype } from '../propTypes';
import { resourceListPages } from './resource-pages';
import { connectToModel } from '../kinds';
import { connectToFlags, FLAGS, flagPending } from '../features';
import { referenceForModel, kindForReference } from '../module/k8s';
import { AsyncComponent } from './utils/async';
import { DefaultPage } from './default-resource';

const ResourceList = connectToModel(({ kindObj, kindsInFlight, namespace, selector, fake }) => {
    if (kindsInFlight) {
        return <LoadingBox />;
    }

    const componentLoader = resourceListPages.get(referenceForModel(kindObj), () => Promise.resolve(DefaultPage));
    const ns = kindObj.namespaced ? namespace : undefined;

    return <AsyncComponent loader={componentLoader} namespace={ns} selector={selector} kind={kindObj.crd ? referenceForModel(kindObj) : kindObj.kind} showTitle={false} autoFocus={false} fake={fake} />;
});

const updateUrlParams = (k, v) => {
    const url = new URL(window.location);
    const sp = new URLSearchParams(window.location.search);
    sp.set(k, v);
    history.push(`${url.pathname}?${sp.toString()}${url.hash}`);
};

const updateKind = kind => updateUrlParams('kind', encodeURIComponent(kind));

class KialiPage_ extends React.PureComponent {
    constructor(props) {
        super(props);
        this.setRef = ref => (this.ref = ref);
        this.onSelectorChange = k => {
            updateKind(k);
            this.ref && this.ref.focus();
        };
    }

    render() {
        const { flags, location, namespace, t } = this.props;

        if (flagPending(flags.OPENSHIFT) || flagPending(flags.PROJECTS_AVAILABLE)) {
            return null;
        }
        let url = `${document.location.origin}/api/kiali`
        return (
            <React.Fragment>
                <div>
                    <Helmet>
                        <title>Kiali</title>
                    </Helmet>
                    <NavTitle title='Kiali'>
                    </NavTitle>
                    <iframe style={{ width: '100%', height: '100vh', border: 0 }} src={url} target="_blank" />
                </div>
            </React.Fragment>
        );
    }
}

export const KialiPage = connectToFlags(FLAGS.OPENSHIFT, FLAGS.PROJECTS_AVAILABLE)(KialiPage_);

KialiPage.propTypes = {
    namespace: namespaceProptype,
    location: PropTypes.object.isRequired,
};
