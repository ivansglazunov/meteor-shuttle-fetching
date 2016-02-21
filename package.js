Package.describe({
	name: 'ivansglazunov:shuttle-fetching',
	version: '0.0.6',
	summary: 'The tree right to fetch documents with isolation requests.',
	git: 'https://github.com/ivansglazunov/meteor-shuttle-fetching.git',
	documentation: 'README.md'
});

Package.onUse(function(api) {
	api.versionsFrom('1.2.1');
	
	api.use('ecmascript');
	api.use('mongo');
	api.use('accounts-base');
	
	api.use('stevezhu:lodash@4.3.0');
	api.use('matb33:collection-hooks@0.8.1');
	api.use('aldeed:collection2@2.8.0');
	api.use('ivansglazunov:refs@0.1.0');
	api.use('ivansglazunov:trees@1.1.6');
	api.use('ivansglazunov:history@0.0.2');
	api.use('ivansglazunov:delete@0.1.0');
	api.use('ivansglazunov:shuttle-rights@0.0.4');
	
	api.addFiles([
		'fetching.js'
	]);
});
