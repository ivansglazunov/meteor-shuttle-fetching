Shuttle.Fetching = new Mongo.Collection('shuttle:fetching');

Shuttle.Fetching.attachTree();
Shuttle.Fetching.attachDelete();

if (Meteor.isServer) {
	History.watchInsert(Shuttle.Fetching);
	History.watchRemove(Shuttle.Fetching);
	Shuttle.Used.inheritTree(Shuttle.Fetching);
	Shuttle.Unused.inheritTree(Shuttle.Fetching);
}

Shuttle.Fetching.deny({
	insert: function(userId, _fetching) {
		var fetching = Shuttle.Fetching._transform(_fetching);
		if (userId) {
			var user = Meteor.users.findOne(userId);
			
			var fetchings = Shuttle.Fetching.find(lodash.merge(
				fetching.source().Ref('_source'),
				fetching.target().Ref('_target'),
				{
					_inherit: { $exists: false },
					'_inserted.user.id': userId
				}
			));
			
			if (fetchings.count()) {
				throw new Meteor.Error('Duplication of links of this type is prohibited.');
			}
	
			if (Shuttle.can(Shuttle.Owning, fetching.source(), user)) { // User can own source.
				return false; // The owner can do anything.
			}
		}
		throw new Meteor.Error('You are not permitted to insert fetching '+JSON.stringify(fetching));
	},
	update: function(userId, _fetching) {
		var fetching = Shuttle.Fetching._transform(_fetching);
		if (userId) {
			var user = Meteor.users.findOne(userId);
	
			if (Shuttle.can(Shuttle.Owning, fetching.source(), user)) { // User can own source.
				return false; // a owner can do anything.
			}
		}
		throw new Meteor.Error('You are not permitted to update fetching '+JSON.stringify(fetching.Ref()));
	},
	remove: function(userId, _fetching) {
		return true;
	}
});

// Hides the documents in which the specified field does not contain references to the user or those with whom it is merged.
// Shuttle.Fetching.secureCollection(collection: Mongo.Collection, field: String)
Shuttle.Fetching.secureCollection = function(Collection, field) {
	var Tree = this;

	var schema = {};
	schema[field] = { type: [Refs.Schema], optional: true };
	Collection.attachSchema(schema);

	Collection.deny({
		insert: function (userId, document) {
			if (field in document)
				throw new Meteor.Error('Users can not insert document with secure fields.');
		},
		update: function (userId, document, fieldNames, modifier) {
			if (lodash.includes(fieldNames, field))
				throw new Meteor.Error('Users can not update secure fields.');
		}
	});
	
	Collection.mirrorTreeTargetsToSourceField(Tree, field);
	
	var before = function (userId, selector, options) {
		if (typeof(selector) == 'object') {
			if (!userId) userId = 'guest';
			if (!('$and' in selector)) selector.$and = [];
			var $or = [];
			var mergeds = Shuttle.Merged.find({ '_source.collection': Meteor.users._name, '_source.id': userId }).fetch();
			for (var s in mergeds) {
				var push = {};
				push[field+'.collection'] = mergeds[s]._target.collection;
				push[field+'.id'] = mergeds[s]._target.id;
				$or.push(push);
			}
			var push = {};
			push[field+'.collection'] = Meteor.users._name;
			push[field+'.id'] = userId;
			$or.push(push);
			selector.$and.push({ $or: $or });
		}
	};
	Collection.before.find(before);
	Collection.before.findOne(before);
};