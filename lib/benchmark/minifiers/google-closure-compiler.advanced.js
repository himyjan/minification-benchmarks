// google-closure-compiler is no longer maintained
// https://github.com/google/closure-compiler-npm/blob/master/packages/google-closure-compiler-js/readme.md

import googleClosureCompiler from 'google-closure-compiler';
import measure from './measure.js';

const { compiler: Compiler } = googleClosureCompiler;

measure(async ({ filePath }) => {
	const compiler = new Compiler({
		js: filePath,
		compilation_level: 'ADVANCED',
	});

	const code = await new Promise((resolve, reject) => {
		compiler.run((exitCode, stdOut, stdError) => {
			if (exitCode > 0) {
				console.log(stdError);
				reject(stdError);
				return;
			}
			resolve(stdOut);
		});
	});

	return code;
});