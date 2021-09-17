import { promises as fs } from 'fs';
import path from 'path';

const PACKAGE_FOLDER = process.env.PACKAGE_FOLDER || 'package';
const TARGETS = ['components', 'config', 'src', 'stores'];
const BASE_DIR = path.join(process.cwd(), PACKAGE_FOLDER);

const getFolder = async (folder, depth = 0) => {
	const contents = await fs.readdir(path.join(process.cwd(), PACKAGE_FOLDER, folder), {
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
			const filepath = path.join(BASE_DIR, f);
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

Promise.all(TARGETS.map((t) => getFolder(t).then(transformFolder)));
