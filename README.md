# ShuttleFetching

```
meteor add ivansglazunov:shuttle-fetching
```

The tree right to fetch documents with isolation all `find` and `findOne` requests.

## Trees

### Fetching

* Inherit in `used` and `unused` trees.
* Holder of the right `owner` of source can create and remove links to and target.
* It is forbidden to duplication is not inherited links.

![Fetching](http://ivansglazunov.github.io/meteor-shuttle-fetching/fetching.svg)

* 1 can fetch 1, 2, 3, 4, 5 and 6
* 8 merged with 7
* 7 and 8 can fetch 5 and 6

## Fetch self
This will make all the documents used by the user visible to him.
When creating a user is recommended to use the following code:

```js
if (Meteor.isServer) {
	Meteor.users.after.insert(function(userId, _user) {
		var user = Meteor.users._transform(_user);
		Shuttle.Fetching.link(user, user);
	});
}
```

## `Shuttle.Fetching.secureCollection(collection: Mongo.Collection, field: String)`
Hides the documents in which the specified field does not contain references to the user or those with whom it is merged.
To ignore the restriction on the server, and use `collection.direct.find` `collection.direct.findOne`.