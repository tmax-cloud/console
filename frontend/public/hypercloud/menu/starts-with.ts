const clustermanagersStartsWith = ['clustermanagers', 'clusterclaims', 'clusterregistrations'];
const searchStartsWith = ['search'];
const rolesStartsWith = ['roles', 'clusterroles'];
const rolebindingsStartsWith = ['rolebindings', 'clusterrolebindings', 'rolebindingclaims', 'clusterrolebindingclaims'];
const rolebindingclaimsStartsWith = ['rolebindingclaims', 'clusterrolebindingclaims'];
const quotaStartsWith = ['resourcequotas', 'clusterresourcequotas', 'resourcequotaclaims'];
const namespaceStartsWith = ['namespaces', 'namespaceclaims'];
const clusterserviceversionsStartsWith = ['operators.coreos.com', 'clusterserviceversions'];

const startsWith = { clustermanagersStartsWith, searchStartsWith, rolesStartsWith, rolebindingsStartsWith, rolebindingclaimsStartsWith, quotaStartsWith, namespaceStartsWith, clusterserviceversionsStartsWith };
export default startsWith;
