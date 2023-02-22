import { readdirSync, existsSync, rmSync } from 'fs';
import { join, resolve } from 'path';
import minimatch from 'minimatch';

import { generateXml } from './xml.js';
import { readJSONFile } from './file-explore.js';

/**
 * Reporter used by `vitest`
 */
export default class SonarReporter {
    _summarizer: string;
    basePath: string;
    cw: any;
    excludedPatterns: Array<string>;
    file!: string;
    opts: any;
    patterns: Array<string>;
    xml: any;

    constructor(opts: {
        defaultSummarizer: string;
        file: string;
        projectRoot: string;
    }) {
        this.basePath = opts.projectRoot || resolve();

        const jsonFile = join(this.basePath, 'vitest-sonar-reporter-cjs.json');
        const optsJson = readJSONFile(jsonFile);

        this.opts = opts;
        this.file = opts.file || optsJson?.file || 'sonar-report.xml';

        this._summarizer =
            opts.defaultSummarizer || optsJson?.summarizer || 'pkg';

        this.patterns = optsJson?.patterns || ['**/*.test.js', '**/*.spec.js'];
        this.excludedPatterns = optsJson?.excludedPatterns || [
            '*/node_modules/**',
            '**/node_modules/**',
            '*/dist/**',
            '**/dist/**',
        ];

        if (existsSync(this.file)) {
            rmSync(this.file);
        }
    }

    execute(context: any) {
        context.getTree(this._summarizer).visit(this, context);
    }

    onStart(root: any, context: any) {
        this.cw = context.writer.writeFile(this.file);
        this.xml = context.getXMLWriter(this.cw);

        const patterns: Array<string> = this.patterns;
        const excludedPatterns: Array<string> = this.excludedPatterns;

        const files: Array<string> = this.getMatchingFiles(
            this.basePath,
            patterns,
            excludedPatterns
        );

        this.writeTestsCase(files);
    }

    getMatchingFiles(
        directory: string,
        patterns: Array<string>,
        excludedPatterns: Array<string>
    ) {
        const files: Array<string> = [];
        const entries = readdirSync(directory, { withFileTypes: true });

        entries.forEach((entry) => {
            const fullPath = join(directory, entry.name);

            if (entry.isDirectory()) {
                if (
                    !excludedPatterns.some((pattern) =>
                        minimatch(fullPath, pattern)
                    )
                ) {
                    files.push(
                        ...this.getMatchingFiles(
                            fullPath,
                            patterns,
                            excludedPatterns
                        )
                    );
                }
            } else {
                for (const pattern of patterns) {
                    if (minimatch(fullPath, pattern)) {
                        files.push(fullPath);
                        break;
                    }
                }
            }
        });

        return files;
    }

    writeTestsCase(files: Array<string>) {
        const sorted = files.sort(sortByFilename);
        this.cw.println(generateXml(this.basePath, sorted));
    }

    onDetail() {
        // onDetail
    }

    onEnd() {
        this.xml.closeAll();
        this.cw.close();
    }
}

function sortByFilename(a: string, b: string): -1 | 0 | 1 {
    if (a < b) return -1;
    if (a > b) return 1;

    return 0;
}
