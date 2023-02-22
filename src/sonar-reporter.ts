import { existsSync, mkdirSync, rmSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'path';
import type { Reporter, File, Vitest } from 'vitest';

import { generateXml } from './xml.js';

// const _summarizer: ReturnType<typeof Symbol> = Symbol('ReportBase.#summarizer');
// const _summarizer: unique symbol = Symbol('ReportBase.#summarizer');

/**
 * Reporter used by `vitest`
 */
export default class SonarReporter implements Reporter {
    opts: any;
    cw: any;
    xml: any;
    file!: string;
    _summarizer: symbol;

    constructor(opts: { summarizer: symbol; file: string }) {
        this._summarizer = Symbol('ReportBase.#summarizer');
        // this[this._summarizer] = opts.summarizer;

        this.opts = opts;
        this.file = opts.file || 'sonar-report.xml';

        if (existsSync(this.file)) {
            rmSync(this.file);
        }
    }

    execute(context: any) {
        // context.getTree(this[_summarizer]).visit(this, context);
        context.getTree(this._summarizer).visit(this, context);
    }

    onStart(root: any, context: any) {
        this.cw = context.writer.writeFile(this.file);
        this.xml = context.getXMLWriter(this.cw);
        // this.writeRootStats(root);
    }

    writeRootStats(node: any) {
        // const metrics = node.getCoverageSummary();
        this.cw.println('<?xml version="1.0" ?>');
        /*
        this.cw.println(
            '<!DOCTYPE coverage SYSTEM "http://cobertura.sourceforge.net/xml/coverage-04.dtd">'
        );
        this.xml.openTag('coverage', {
            'lines-valid': metrics.lines.total,
            'lines-covered': metrics.lines.covered,
            'line-rate': metrics.lines.pct / 100.0,
            'branches-valid': metrics.branches.total,
            'branches-covered': metrics.branches.covered,
            'branch-rate': metrics.branches.pct / 100.0,
            timestamp: this.timestamp,
            complexity: '0',
            version: '0.1',
        });
        this.xml.openTag('sources');
        this.xml.inlineTag('source', null, this.projectRoot);
        this.xml.closeTag('sources');
        this.xml.openTag('packages');
        */
    }

    writeSummary(filePath: string, sc: any) {
        /*
        const cw = this.contentWriter;
        if (this.first) {
            this.first = false;
        } else {
            cw.write(',');
        }
        cw.write(JSON.stringify(filePath));
        cw.write(': ');
        cw.write(JSON.stringify(sc));
        cw.println('');
        */
    }

    onDetail(node) {
        this.writeSummary(
            node.getFileCoverage().path,
            node.getCoverageSummary()
        );
    }

    onEnd() {
        this.xml.closeAll();
        this.cw.close();
    }

    onFinished(files?: File[]) {
        const reportFile = resolve(this.opts.config.root, this.file);

        const outputDirectory = dirname(reportFile);
        if (!existsSync(outputDirectory)) {
            mkdirSync(outputDirectory, { recursive: true });
        }

        const sorted = files?.sort(sortByFilename);

        writeFileSync(reportFile, generateXml(sorted), 'utf-8');
        this.opts.logger.log(`SonarQube report written to ${reportFile}`);
    }
}

function sortByFilename(a: File, b: File): -1 | 0 | 1 {
    if (a.name < b.name) return -1;
    if (a.name > b.name) return 1;

    return 0;
}
