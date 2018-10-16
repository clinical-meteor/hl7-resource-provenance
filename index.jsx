
import ProvenancesPage from './client/ProvenancesPage';
import ProvenanceTable from './client/ProvenanceTable';
import ProvenanceDetail from './client/ProvenanceDetail';

var DynamicRoutes = [{
  'name': 'ProvenancePage',
  'path': '/provenances',
  'component': ProvenancesPage,
  'requireAuth': true
}];

var AdminSidebarElements = [{
  'primaryText': 'Provenances',
  'to': '/provenances',
  'href': '/provenances'
}];

export { 
  AdminSidebarElements,
  DynamicRoutes, 

  ProvenancesPage,
  ProvenanceTable
};


