import { promises as fs } from 'fs';
import path from 'path';

const PACKAGE_FOLDER = process.env.PACKAGE_FOLDER || 'package';
const CWD = process.cwd();

const getFolder = async (folder, depth = 0) => {
	const contents = await fs.readdir(path.join(CWD, folder), {
		withFileTypes: true
	});

	return {
		depth,
		folders: await Promise.all(
			contents
				.filter((f) => f.isDirectory())
				.map((dir) => getFolder(`${folder}/${dir.name}`, depth + 1))
		),
		files: contents.filter((f) => !f.isDirectory()).map(({ name }) => `${folder}/${name}`)
	};
};

const transformFolder = async ({ folders, files, depth }) => {
	await Promise.all(
		files.map(async (f) => {
			const filepath = path.join(CWD, f);
			const contents = await fs.readFile(filepath, 'utf-8');
			const base = depth ? [...Array(depth + 1).fill('..')].join('/') : './';
			const updated = contents.replace(/from '\$lib(.*)'/g, `from '${base}$1'`);
			await Promise.all(
				[
					updated === contents ? null : fs.writeFile(filepath, updated),
					...folders.map(transformFolder)
				].filter(Boolean)
			);
		})
	);
};

getFolder(PACKAGE_FOLDER)
	.then(transformFolder)
	.catch(console.error)
	.finally(() => process.exit());
