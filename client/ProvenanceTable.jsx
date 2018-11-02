import Avatar from 'material-ui/Avatar';
import FlatButton from 'material-ui/FlatButton';
import { HTTP } from 'meteor/http';
import React from 'react';
import { ReactMeteorData } from 'meteor/react-meteor-data';
import ReactMixin from 'react-mixin';
import { Table } from 'react-bootstrap';

import { Session } from 'meteor/session';
import { has, get } from 'lodash';
import { TableNoData } from 'meteor/clinical:glass-ui'
import PropTypes from 'prop-types';

import FaFilePdfO from 'react-icons/lib/fa/file-pdf-o';

Session.setDefault('csiGuid', '')
export class ProvenanceTable extends React.Component {
  getMeteorData() {
    let data = {
      style: {
        hideOnPhone: {
          visibility: 'visible',
          display: 'table'
        },
        cellHideOnPhone: {
          visibility: 'visible',
          display: 'table'
          //paddingTop: '16px'
        },
        cell: {
          paddingTop: '16px'
        }
      },
      selected: [],
      provenances: []
    };

    let query = {};
    let options = {
      sort: { issued: -1 }
    };

    if(this.props.sort){

      switch (this.props.sort) {
        case "issued":
          options.sort = { issued: -1 }
          break;
        case "signatureDate":
          options.sort = { 'signature.0.when': -1 }
          break;      
        default:
          break;
      }
    }


    // number of items in the table should be set globally
    if (get(Meteor, 'settings.public.defaults.paginationLimit')) {
      options.limit = get(Meteor, 'settings.public.defaults.paginationLimit');
    }
    // but can be over-ridden by props being more explicit
    if(this.props.limit){
      options.limit = this.props.limit;  
    }

    // data.provenances = [];
    data.provenances = Provenances.find(query, options).map(function(document){
      let result = {
        _id: document._id,
        csiGuid: get(document, 'entity.0.whatReference.id', ''),
        issued: moment(get(document, 'issued', null)).format("YYYY-MM-DD hh:mm:ss"),
        targetReference: get(document, 'target.0.reference', ''),
        signatureDate: get(document, 'signature.0.when', ''),
        signatureBlob: get(document, 'signature.0.blob', ''),
        signatureReference: get(document, 'signature.0.whoReference.reference', ''),
      };

      return result;
    });

    if (Session.get('appWidth') < 768) {
      data.style.hideOnPhone.visibility = 'hidden';
      data.style.hideOnPhone.display = 'none';
      data.style.cellHideOnPhone.visibility = 'hidden';
      data.style.cellHideOnPhone.display = 'none';
    } else {
      data.style.hideOnPhone.visibility = 'visible';
      data.style.hideOnPhone.display = 'table-cell';
      data.style.cellHideOnPhone.visibility = 'visible';
      data.style.cellHideOnPhone.display = 'table-cell';
    }



    if(this.props.disableBarcodes){
      data.signatureBlob = "signatureBlob"
    } else {
      data.signatureBlob = "signatureBlob barcode"
    }


    return data;
  }
  rowClick(id){
    Session.set('provenancesUpsert', false);
    Session.set('selectedProvenance', id);
    Session.set('provenancePageTabIndex', 2);
  }
  handleVerify(provenance){
    console.log('handleVerify', provenance);

    if(this.props.onVerify){
      this.props.onVerify(provenance);
    } 
    
    // HTTP.post('https://poc-node-1.fhirblocks.io/smoac/audit/validate', {
    //   headers: {
    //     'Accept': 'application/json',
    //     'Content-Type': 'application/json',
    //     'Access-Control-Allow-Origin': '*'
    //   },
    //   data: {
    //     "csiGuid": get(provenance, 'csiGuid', '/').split('csi/')[1],
    //     "signature": get(provenance, 'signatureBlob')
    //   }
    // }, function(error, result){
    //   if(error){
    //     alert('Error!  Something wrong happened.  :( /nThis is extremely likely a 500 Internal Server Error')
    //   }
    //   if(result){
    //     console.log('result', result)
    //     let validation = JSON.parse(result.content);
    //     if(validation.valid === true){
    //       alert('Valid!  This signature was found matched to this self-soverign identifier on the blockchain.')
    //     } else if (validation.valid === false){
    //       alert("Not valid.  Either the signature or the self-soverign identifier weren't found.  A match couldn't be made. ")
    //     }
    //   }
    // })
    
  }
  renderIssuedDate(provenance){
    if (!this.props.hideIssuedDate) {
      return (
        <td className='issued' onClick={ this.rowClick.bind(this, provenance._id)} style={{minWidth: '100px', paddingTop: '16px'}}>{ provenance.issued }</td>
      );
    }
  }
  renderIssuedDateHeader(){
    if (!this.props.hideIssuedDate) {
      return (
        <th className='issued' style={{minWidth: '100px'}}>Issued Date</th>
      );
    }
  }
  renderVerify(provenance){
    if (!this.props.hideVerify) {
      return (
        <td className='revoke'>
          <FlatButton label="Verify" onClick={this.handleVerify.bind(this, provenance)} />
        </td>
      );
    }
  }
  renderVerifyHeader(){
    if (!this.props.hideVerify) {
      return (
        <th className='end' style={{minWidth: '100px', marginLeft: '20px'}}> Verify </th>
      );
    }
  }
  render () {
    let tableRows = [];
    let footer;

    if(this.data.provenances.length === 0){
      if(!(this.props.noDataMessage === false)){
        footer = <TableNoData noDataPadding={ this.props.noDataMessagePadding } />
      }
    } else {
      for (var i = 0; i < this.data.provenances.length; i++) {
        tableRows.push(
          <tr key={i} className="provenanceRow" style={{cursor: "pointer"}}>
            {this.renderIssuedDate(this.data.provenances[i]) }

            <td className='targetReference' onClick={ this.onConsentClick.bind(this, this.data.provenances[i]._id, this.data.provenances[i].targetReference )} style={this.data.style.cell}>{this.data.provenances[i].targetReference }</td>
            <td className='signatureDate' style={this.data.style.cellHideOnPhone}>{ moment(this.data.provenances[i].signatureDate).format("YYYY MM DD hh:mm:ss") }</td>
            <td className={this.data.signatureBlob} style={this.data.style.cellHideOnPhone}>{this.data.provenances[i].signatureBlob.substring(0,64) + '...' }</td>
            <td className='signatureReference' style={this.data.style.cellHideOnPhone}>{this.data.provenances[i].signatureReference}</td>

            {this.renderVerify(this.data.provenances[i]) }
          </tr>
        );
      }
    }

    return(
      <div>
        <Table id='provenancesTable' hover >
          <thead>
            <tr>
              {this.renderIssuedDateHeader() }
              <th className='targetReference' style={this.data.style.cellHideOnPhone}>Target</th>
              <th className='signatureDate' style={this.data.style.cellHideOnPhone} >Signature Date</th>
              <th className='signatureDate' style={this.data.style.cellHideOnPhone} >Signature Blob</th>
              <th className='signatureDate' style={this.data.style.cellHideOnPhone} >Signature Reference</th>
              {this.renderVerifyHeader() }
            </tr>
          </thead>
          <tbody>
            { tableRows }
          </tbody>
        </Table>
        { footer }
      </div>
    );
  }
  onConsentClick(id, targetReference){
    if(typeof this.props.onConsentClick === "function"){
      this.props.onConsentClick(targetReference);
    } else {
      Session.set('provenancesUpsert', false);
      Session.set('selectedProvenance', id);
      Session.set('provenancePageTabIndex', 2); 
    }
  }
}

ProvenanceTable.propTypes = {
  id: PropTypes.string,
  fhirVersion: PropTypes.string,
  hideVerify: PropTypes.bool,
  limit: PropTypes.number,
  onConsentClick: PropTypes.func
};


ReactMixin(ProvenanceTable.prototype, ReactMeteorData);
export default ProvenanceTable;