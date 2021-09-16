module.exports = {
	branches: ['master'],
	verifyConditions: [
		'@semantic-release/changelog',
		[
			'@semantic-release/npm',
			{
				pkgRoot: 'package'
			}
		],
		'@semantic-release/git'
	],
	prepare: [
		'@semantic-release/changelog',
		'@semantic-release/npm',
		{
			path: '@semantic-release/git',
			assets: ['docs', 'package.json', 'CHANGELOG.md'],
			message: 'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}'
		}
	],
	publish: ['@semantic-release/npm', '@semantic-release/github']
};
