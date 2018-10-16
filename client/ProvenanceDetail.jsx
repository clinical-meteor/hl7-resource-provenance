import { CardActions, CardText, SelectField, MenuItem, TextField, RaisedButton } from 'material-ui';

import { get, has, set } from 'lodash';

import { Bert } from 'meteor/clinical:alert';
import React from 'react';
import { ReactMeteorData } from 'meteor/react-meteor-data';
import ReactMixin from 'react-mixin';

import { Session } from 'meteor/session';


let defaultProvenance = {
  "resourceType" : "Provenance",
  "name" : [{
    "text" : "",
    "resourceType" : "HumanName"
  }],
  "active" : true,
  "gender" : "",
  "birthDate" : '',
  "photo" : [{
    url: ""
  }],
  identifier: [{
    "use": "usual",
    "type": {
      "coding": [
        {
          "system": "http://hl7.org/fhir/v2/0203",
          "code": "MR"
        }
      ]
    },
    "value": ""
  }],
  "test" : false
};


Session.setDefault('provenanceUpsert', false);
Session.setDefault('selectedProvenance', false);

export class ProvenanceDetail extends React.Component {
  getMeteorData() {
    let data = {
      customWidth: {
        width: 150
      },
      provenanceId: false,
      provenance: defaultProvenance
    };

    if (Session.get('provenanceUpsert')) {
      data.provenance = Session.get('provenanceUpsert');
    } else {
      if (Session.get('selectedProvenance')) {
        data.provenanceId = Session.get('selectedProvenance');
        console.log("selectedProvenance", Session.get('selectedProvenance'));

        let selectedProvenance = Provenances.findOne({_id: Session.get('selectedProvenance')});
        console.log("selectedProvenance", selectedProvenance);

        if (selectedProvenance) {
          data.provenance = selectedProvenance;

          if (typeof selectedProvenance.birthDate === "object") {
            data.provenance.birthDate = moment(selectedProvenance.birthDate).add(1, 'day').format("YYYY-MM-DD");
          }
        }
      } else {
        data.provenance = defaultProvenance;
      }
    }

    if(process.env.NODE_ENV === "test") console.log("ProvenanceDetail[data]", data);
    return data;
  }

  render() {
    return (
      <div id={this.props.id} className="provenanceDetail">
        <CardText>
          <SelectField
            floatingLabelText="Type"
            value={1}
            fullWidth
          >
            <MenuItem value={1} primaryText="Power of Attorney" />
          </SelectField><br/>
          <TextField
            id='subjectInput'
            ref='subject'
            name='subject'
            floatingLabelText='Full Name of Subject (i.e. Patient)'
            hintText='Jason Argonaut'
            // value={ get(this, 'data.provenance.name[0].text', '')}
            // onChange={ this.changeState.bind(this, 'name')}
            fullWidth
            /><br/>
          <TextField
            id='agentNameInput'
            ref='agentName'
            name='agentName'
            floatingLabelText='Full Name of Agent'
            hintText='agent name'
            // value={ get(this, 'data.provenance.gender', '')}
            // onChange={ this.changeState.bind(this, 'gender')}
            fullWidth
            /><br/>
          <TextField
            id='issuedDateInput'
            ref='issuedDate'
            name='issuedDate'
            floatingLabelText='Issued Date'
            hintText='YYYY-MM-DD'
            // value={ get(this, 'data.provenance.birthDate', '')}
            // onChange={ this.changeState.bind(this, 'birthDate')}
            fullWidth
            /><br/>       
        </CardText>
        <CardActions>
          { this.determineButtons(this.data.provenanceId) }
        </CardActions>
      </div>
    );
  }
  determineButtons(provenanceId){
    if (provenanceId) {
      return (
        <div>
          <RaisedButton id='saveProvenanceButton' className='saveProvenanceButton' label="Save" primary={true} onClick={this.handleSaveButton.bind(this)} style={{marginRight: '20px'}} />
          <RaisedButton label="Delete" onClick={this.handleDeleteButton.bind(this)} />
        </div>
      );
    } else {
      return(
        <div>
          <RaisedButton id='previewProvenanceButton'  className='saveProvenanceButton' label="Preview" primary={true} onClick={this.handleSaveButton.bind(this)} style={{marginRight: '20px'}} />
          <RaisedButton id='cancelProvenanceButton'  className='saveProvenanceButton' label="Cencel" primary={false} onClick={this.handleCancelButton.bind(this)} />
        </div>
      );
    }
  }

  changeState(field, event, value){
    let provenanceUpdate;

    if(process.env.TRACE) console.log("provenanceDetail.changeState", field, event, value);

    // by default, assume there's no other data and we're creating a new provenance
    if (Session.get('provenanceUpsert')) {
      provenanceUpdate = Session.get('provenanceUpsert');
    } else {
      provenanceUpdate = defaultProvenance;
    }



    // if there's an existing provenance, use them
    if (Session.get('selectedProvenance')) {
      provenanceUpdate = this.data.provenance;
    }

    switch (field) {
      case "name":
        provenanceUpdate.name[0].text = value;
        break;
      case "gender":
        provenanceUpdate.gender = value.toLowerCase();
        break;
      case "birthDate":
        provenanceUpdate.birthDate = value;
        break;
      case "photo":
        provenanceUpdate.photo[0].url = value;
        break;
      case "mrn":
        provenanceUpdate.identifier[0].value = value;
        break;
      default:

    }
    // provenanceUpdate[field] = value;
    process.env.TRACE && console.log("provenanceUpdate", provenanceUpdate);

    Session.set('provenanceUpsert', provenanceUpdate);
  }


  // this could be a mixin
  handleSaveButton(){
    if(process.env.NODE_ENV === "test") console.log('handleSaveButton()');
    let provenanceUpdate = Session.get('provenanceUpsert', provenanceUpdate);


    if (provenanceUpdate.birthDate) {
      provenanceUpdate.birthDate = new Date(provenanceUpdate.birthDate);
    }
    if(process.env.NODE_ENV === "test") console.log("provenanceUpdate", provenanceUpdate);

    if (Session.get('selectedProvenance')) {
      if(process.env.NODE_ENV === "test") console.log("Updating provenance...");

      delete provenanceUpdate._id;

      // not sure why we're having to respecify this; fix for a bug elsewhere
      provenanceUpdate.resourceType = 'Provenance';

      Provenances._collection.update({_id: Session.get('selectedProvenance')}, {$set: provenanceUpdate }, function(error, result){
        if (error) {
          if(process.env.NODE_ENV === "test") console.log("Provenances.insert[error]", error);
          Bert.alert(error.reason, 'danger');
        }
        if (result) {
          HipaaLogger.logEvent({eventType: "update", userId: Meteor.userId(), userName: Meteor.user().fullName(), collectionName: "Provenances", recordId: Session.get('selectedProvenance')});
          // Session.set('provenanceUpdate', defaultProvenance);
          Session.set('provenanceUpsert', false);
          Session.set('selectedProvenance', false);
          Session.set('provenancePageTabIndex', 1);
          Bert.alert('Provenance added!', 'success');
        }
      });
    } else {
      if(process.env.NODE_ENV === "test") console.log("Creating a new provenance...", provenanceUpdate);

      Provenances._collection.insert(provenanceUpdate, function(error, result) {
        if (error) {
          if(process.env.NODE_ENV === "test")  console.log('Provenances.insert[error]', error);
          Bert.alert(error.reason, 'danger');
        }
        if (result) {
          HipaaLogger.logEvent({eventType: "create", userId: Meteor.userId(), userName: Meteor.user().fullName(), collectionName: "Provenances", recordId: result});
          Session.set('provenancePageTabIndex', 1);
          Session.set('selectedProvenance', false);
          Session.set('provenanceUpsert', false);
          Bert.alert('Provenance added!', 'success');
        }
      });
    }
  }

  handleCancelButton(){
    Session.set('provenancePageTabIndex', 1);
  }

  handleDeleteButton(){
    Provenances._collection.remove({_id: Session.get('selectedProvenance')}, function(error, result){
      if (error) {
        if(process.env.NODE_ENV === "test") console.log('Provenances.insert[error]', error);
        Bert.alert(error.reason, 'danger');
      }
      if (result) {
        HipaaLogger.logEvent({eventType: "delete", userId: Meteor.userId(), userName: Meteor.user().fullName(), collectionName: "Provenances", recordId: Session.get('selectedProvenance')});
        // Session.set('provenanceUpdate', defaultProvenance);
        Session.set('provenanceUpsert', false);
        Session.set('provenancePageTabIndex', 1);
        Session.set('selectedProvenance', false);
        Bert.alert('Provenance removed!', 'success');
      }
    });
  }
}


ReactMixin(ProvenanceDetail.prototype, ReactMeteorData);
export default ProvenanceDetail;