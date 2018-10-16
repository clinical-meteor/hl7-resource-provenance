import { CardText, CardTitle } from 'material-ui/Card';
import { Tab, Tabs } from 'material-ui/Tabs';
import { GlassCard, Glass, VerticalCanvas, FullPageCanvas } from 'meteor/clinical:glass-ui';
import ProvenanceDetail from './ProvenanceDetail';
import ProvenanceTable from './ProvenanceTable';
import React from 'react';
import { ReactMeteorData } from 'meteor/react-meteor-data';
import ReactMixin from 'react-mixin';

import { Session } from 'meteor/session';

let defaultProvenance = {
  index: 2,
  id: '',
  username: '',
  email: '',
  given: '',
  family: '',
  gender: ''
};
Session.setDefault('provenanceFormData', defaultProvenance);
Session.setDefault('provenanceSearchFilter', '');

export class ProvenancesPage extends React.Component {
  getMeteorData() {
    let data = {
      style: {
        opacity: Session.get('globalOpacity'),
        tab: {
          borderBottom: '1px solid lightgray',
          borderRight: 'none'
        }
      },
      tabIndex: Session.get('provenancePageTabIndex'),
      provenance: defaultProvenance,
      provenanceSearchFilter: '',
      currentProvenance: null
    };

    if (Session.get('provenanceFormData')) {
      data.provenance = Session.get('provenanceFormData');
    }
    if (Session.get('provenanceSearchFilter')) {
      data.provenanceSearchFilter = Session.get('provenanceSearchFilter');
    }
    if (Session.get("selectedProvenance")) {
      data.currentProvenance = Session.get("selectedProvenance");
    }

    data.style = Glass.blur(data.style);
    data.style.appbar = Glass.darkroom(data.style.appbar);
    data.style.tab = Glass.darkroom(data.style.tab);

    if(process.env.NODE_ENV === "test") console.log("ProvenancesPage[data]", data);
    return data;
  }

  handleTabChange(index){
    Session.set('provenancePageTabIndex', index);
  }

  onNewTab(){
    Session.set('selectedProvenance', false);
    Session.set('provenanceUpsert', false);
  }

  render() {
    console.log('React.version: ' + React.version);
    return (
      <div id="provenancesPage">
        <FullPageCanvas>
          <GlassCard height="auto">
            <CardTitle
              title="Provenances"
            />
            <CardText>
              <ProvenanceTable                 
                showBarcodes={true} 
                sort="signatureDate"
                />

              {/* <Tabs id='provenancesPageTabs' default value={this.data.tabIndex} onChange={this.handleTabChange} initialSelectedIndex={1}>
                 <Tab className="newProvenanceTab" label='New' style={this.data.style.tab} onActive={ this.onNewTab } value={0}>
                   <ProvenanceDetail id='newProvenance' />
                 </Tab>
                 <Tab className="provenanceListTab" label='Provenances' onActive={this.handleActive} style={this.data.style.tab} value={1}>
                   <ProvenanceTable showBarcodes={true} />
                 </Tab>
                 <Tab className="provenanceDetailTab" label='Detail' onActive={this.handleActive} style={this.data.style.tab} value={2}>
                   <ProvenanceDetail id='provenanceDetails' currentProvenance={this.data.currentProvenance} />
                 </Tab>
             </Tabs> */}


            </CardText>
          </GlassCard>
        </FullPageCanvas>
      </div>
    );
  }
}



ReactMixin(ProvenancesPage.prototype, ReactMeteorData);

export default ProvenancesPage;