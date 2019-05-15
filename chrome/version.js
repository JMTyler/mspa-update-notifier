
// TODO: Really have to go through this and comment... it's confusing as heck.  But it works!

var jmtyler = jmtyler || {};
jmtyler.version = (() => {
	const migrations = {
		'1557880371381 - 2.0.0 - Migrate from MSPA to Homestuck.com': () => {
			const lastPageRead = jmtyler.memory.get('last_page_read');
			const matches = lastPageRead ? lastPageRead.match(/^http:\/\/www\.mspaintadventures\.com\/?.*\?s=6&p=(\d+)/) : null;
			if (matches !== null) {
				const mspaPage = parseInt(matches[1], 10);
				const homestuckPage = mspaPage - 1900;

				const stories = jmtyler.memory.get('stories');

				jmtyler.memory.set('active', '/story');
				jmtyler.memory.set('stories', Object.assign(stories, {
					'/story': {
						endpoint: '/story',
						title:    'Homestuck',
						subtitle: null,
						pages:    8130,
						current:  homestuckPage,
					},
				}));
			}

			// TODO: Need to fetch all the other existing stories to populate our memory.
			// TODO: Also need to pre-populate our memory with existing stories on every fresh install.
			// TODO: Do we need a flag to indicate that we're still populating the DB? To avoid false positive potatoes?
			// TODO: Might need to inspect the 'toast_icon_uri' setting and migrate it, if the user ever changed it then reverted.

			jmtyler.memory.clear('http_last_modified');
			jmtyler.memory.clear('latest_update');
			jmtyler.memory.clear('last_page_read');
			jmtyler.settings.clear('check_frequency');
		},
	};

	const runMigrations = () => {
		const finishedMigrations = jmtyler.memory.get('migrations') || [];
		const migrationsToRun = Object.keys(migrations).filter((v) => !finishedMigrations.includes(v)).sort();

		// TODO: Does this need to support async?
		migrationsToRun.forEach((v) => {
			jmtyler.log('* migrating:', v, { settings: jmtyler.settings.get(), memory: jmtyler.memory.get() });

			migrations[v]();
			finishedMigrations.push(v);
			jmtyler.memory.set('migrations', finishedMigrations);

			jmtyler.log('** finished:', v, { settings: jmtyler.settings.get(), memory: jmtyler.memory.get() });
		});
	};

	return {
		isInstalled(version) {
			return jmtyler.memory.get('version') == version;
		},
		install(version) {
			jmtyler.log('fresh install at', version);
			jmtyler.memory.set('migrations', Object.keys(migrations));
		},
		update(version) {
			jmtyler.log('updating extension to', version);
			runMigrations();
		},
		migrate() {
			return new Promise((resolve) => {
				const version = chrome.runtime.getManifest().version;
				jmtyler.log('checking if current version has been installed... ' + (this.isInstalled(version) ? 'yes' : 'no'));

				if (this.isInstalled(version)) {
					// Only run the main process immediately if the latest version has already been fully installed.
					jmtyler.log('current version is already installed, running Main() immediately');
					return resolve();
				}

				chrome.runtime.onInstalled.addListener(({ reason }) => {
					jmtyler.log('onInstalled triggered', { previous: jmtyler.memory.get('version'), current: version, reason });

					// If the latest version has already been fully installed, don't do anything. (Not sure how we got here, though.)
					if (this.isInstalled(version)) {
						jmtyler.log('new version has already been installed... aborting');
						return;
					}

					// Install the latest version, performing any necessary migrations.
					if (reason == 'install') {
						this.install(version);
					}
					if (reason == 'update') {
						this.update(version);
					}
					jmtyler.memory.set('version', version);

					jmtyler.log('finished migration, running Main()');

					// Now that we've finished any migrations, we can run the main process.
					return resolve();
				});
			});
		},
	};
})();
