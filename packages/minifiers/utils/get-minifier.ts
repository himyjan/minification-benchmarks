import path from 'node:path';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import { minifiersDirectory } from './minifiers-directory.js';
import type { MinifierLoaded } from './create-minifier.js';

const loadMinifierByPath = async (
	minifierPath: string,
) => {
	try {
		const fullMinifierPath = path.join(minifiersDirectory, minifierPath);
		const minifierConfig = await fs.readFile(fullMinifierPath, 'utf8');
		const configHash = crypto.createHash('sha256').update(minifierConfig).digest('hex').slice(0, 10);

		const minifierModule = await import(fullMinifierPath);
		const minifier: MinifierLoaded = minifierModule.default;

		await minifier.loadMeta(minifierPath, configHash);

		return minifier;
	} catch (error) {
		throw new Error(`Error loading minifier "${minifierPath}":\n${
			error instanceof Error
				? error.stack
				: JSON.stringify(error, null, '\t')
		}`);
	}
};

export const getMinifier = async (
	minifierName: string,
) => {
	const stat = await fs.stat(path.join(minifiersDirectory, minifierName)).catch(() => null);
	if (!stat) {
		minifierName += '.ts';
	} else if (stat.isDirectory()) {
		minifierName = path.join(minifierName, 'index.ts');
	}

	return await loadMinifierByPath(minifierName);
};

export const getMinifiers = async () => {
	const files = await fs.readdir(minifiersDirectory);
	const minifierFiles = files.filter(filePath => !filePath.startsWith('_'));

	return await Promise.all(minifierFiles.map(async (minifier) => {
		const stat = await fs.stat(path.join(minifiersDirectory, minifier));
		if (stat.isDirectory()) {
			minifier = path.join(minifier, 'index.ts');
		}

		return await loadMinifierByPath(minifier);
	}));
};
