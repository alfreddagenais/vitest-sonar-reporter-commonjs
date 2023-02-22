import { readFileSync } from 'fs';
import { resolve } from 'path';

import { escapeXML } from './xml-escape.js';
import { parseTests } from './file-explore.js';

const NEWLINE = '\n';

/**
 * Generate XML. Reference:
 *
 * ```xml
 * <testExecutions version="1">
 *   <file path="testx/ClassOneTest.xoo">
 *     <testCase name="test1" duration="5"/>
 *     <testCase name="test2" duration="500">
 *       <skipped message="short message">other</skipped>
 *     </testCase>
 *     <testCase name="test3" duration="100">
 *       <failure message="short">stacktrace</failure>
 *     </testCase>
 *     <testCase name="test4" duration="500">
 *       <error message="short">stacktrace</error>
 *     </testCase>
 *   </file>
 * </testExecutions>
 * ```
 */
export function generateXml(basePath: string, files?: Array<string>) {
    return join(
        '<testExecutions version="1">',
        NEWLINE,
        files
            ?.map((file: string) => generateFileElement(basePath, file))
            .join(NEWLINE),
        NEWLINE,
        '</testExecutions>'
    );
}

function generateFileElement(basePath: string, file: string) {
    const filePath = file.replace(basePath, '').replace(/^\/|\/$/g, ''); // remove first and last slash

    return join(
        indent(1),
        `<file path="${escapeXML(filePath)}">`,
        NEWLINE,
        generateTestCases(file),
        NEWLINE,
        indent(1),
        `</file>`
    );
}

function generateTestCases(file: string) {
    let data;
    try {
        data = readFileSync(resolve(file), 'utf8');
    } catch (err) {
        // console.error(`Erreur lors de la lecture du fichier : ${err}`);
    }
    if (!data) {
        return '';
    }

    const tests = parseTests(file, data);

    const testCase: Array<string> = [];
    tests.forEach((test) => {
        const children = test.children;
        if (!children || !children.length) {
            testCase.push(
                join(
                    indent(2),
                    `<testCase name="${escapeXML(test.name)}" duration="0" />`
                )
            );
            return;
        }

        children.forEach((child) => {
            testCase.push(
                join(
                    indent(2),
                    `<testCase name="${escapeXML(
                        test.name + ' - ' + child.name
                    )}" duration="0" />`
                )
            );
        });
    });

    return testCase.join(NEWLINE);
}

function join(...lines: (string | undefined)[]) {
    return lines.filter(Boolean).join('');
}

function indent(level: number) {
    return '  '.repeat(level);
}
