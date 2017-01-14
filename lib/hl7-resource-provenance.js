

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
  'identifier' : {
    optional: true,
    type: [ IdentifierSchema ]
  }, // Instance id from manufacturer, owner, and others
  'type' : {
    optional: true,
    type: CodeableConceptSchema
  }, // R!  What kind of provenance this is
  'note' : {
    optional: true,
    type: [ AnnotationSchema ]
  }, // Provenance notes and comments
  'status' : {
    optional: true,
    type: Code
  }, // available | not-available | entered-in-error
  'manufacturer' : {
    optional: true,
    type: String
  }, // Name of provenance manufacturer
  'model' : {
    optional: true,
    type: String
  }, // Model id assigned by the manufacturer
  'version' : {
    optional: true,
    type: String
  }, // Version number (i.e. software)
  'manufactureDate' : {
    optional: true,
    type: Date
  }, // Manufacture date
  'expiry' : {
    optional: true,
    type: Date
  }, // Date and time of expiry of this provenance (if applicable)
  'udi' : {
    optional: true,
    type: String
  }, // FDA mandated Unique Provenance Identifier
  'lotNumber' : {
    optional: true,
    type: String
  }, // Lot number of manufacture
  'owner' : {
    optional: true,
    type: ReferenceSchema
  }, // (Organization) Organization responsible for provenance
  'location' : {
    optional: true,
    type: ReferenceSchema
  }, // (Location)Where the resource is found
  'patient' : {
    optional: true,
    type: ReferenceSchema
  }, // (Patient) If the resource is affixed to a person
  'contact' : {
    optional: true,
    type: [ ContactPointSchema ]
  }, // Details for human/organization for support
  'url' : {
    optional: true,
    type: String
  } // Network address to contact provenance
});
Provenances.attachSchema(ProvenanceSchema);
