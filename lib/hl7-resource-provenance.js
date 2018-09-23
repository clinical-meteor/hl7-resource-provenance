import SimpleSchema from 'simpl-schema';


// create the object using our BaseModel
Provenance = BaseModel.extend();

//Assign a collection so the object knows how to perform CRUD operations
Provenance.prototype._collection = Provenances;

// Create a persistent data store for addresses to be stored.
// HL7.Resources.Patients = new Mongo.Collection('HL7.Resources.Patients');
Provenances = new Mongo.Collection('Provenances');

//Add the transform to the collection since Meteor.users is pre-defined by the accounts package
Provenances._transform = function (document) {
  return new Provenance(document);
};


if (Meteor.isClient){
  Meteor.subscribe('Provenances');
}

if (Meteor.isServer){
  Meteor.publish('Provenances', function (argument){
    if (this.userId) {
      return Provenances.find();
    } else {
      return [];
    }
  });
}



ProvenanceSchema = new SimpleSchema({
  'resourceType' : {
    type: String,
    defaultValue: 'Provenance'
  },

});
Provenances.attachSchema(ProvenanceSchema);
