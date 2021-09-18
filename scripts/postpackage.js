import path from 'path';
import pLimit from 'p-limit';
import { promises as fs } from 'fs';

const PACKAGE_FOLDER = process.env.PACKAGE_FOLDER || 'package';
const CWD = process.cwd();

const limit = pLimit(10);

const getFolder = async (folder, depth = 0) => {
	const contents = await fs.readdir(path.join(CWD, folder), {
		withFileTypes: true
	});

	return {
		depth,
		folders: await Promise.all(
			contents
				.filter((f) => f.isDirectory())
				.map((dir) => limit(() => getFolder(`${folder}/${dir.name}`, depth + 1)))
		),
		files: contents.filter((f) => !f.isDirectory()).map(({ name }) => `${folder}/${name}`)
	};
};

const transformFile = async (file, depth) => {
	const filepath = path.join(CWD, file);
	const contents = await fs.readFile(filepath, 'utf-8');
	const base = depth ? [...Array(depth).fill('..')].join('/') : './';
	const updated = contents
		.replace(/from '\$lib(.*)'/g, `from '${base}$1'`)
		.replace(/src\/lib\//g, '');
	await fs.writeFile(filepath, updated);
};

const transformFolder = ({ folders, files, depth }) =>
	Promise.all([
		...files.map((f) => limit(() => transformFile(f, depth))),
		...folders.map((f) => limit(() => transformFolder(f)))
	]);

getFolder(PACKAGE_FOLDER)
	.then(transformFolder)
	.catch(console.error)
	.finally(() => process.exit());
