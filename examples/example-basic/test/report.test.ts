import fs from 'fs';
import { expect, test } from 'vitest';

import { stabilizeReport } from '../../../test/utils';

test('report exists', () => {
    expect(fs.existsSync('./sonar-report.xml')).toBe(true);
});

test('report matches snapshot', () => {
    const output = fs.readFileSync('./sonar-report.xml', 'utf8');
    const report = stabilizeReport(output);

    expect(report).toMatchInlineSnapshot(`
      "<testExecutions version=\\"1\\">
        <file path=\\"test/math.test.ts\\">
          <testCase name=\\"math - sum\\" duration=\\"123\\" />
          <testCase name=\\"math - multiply\\" duration=\\"123\\" />
        </file>
      </testExecutions>"
    `);
});
