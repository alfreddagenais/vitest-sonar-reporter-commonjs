# vitest-sonar-reporter

[![version](https://img.shields.io/npm/v/vitest-sonar-reporter)](https://www.npmjs.com/package/vitest-sonar-reporter)

> [SonarQube](https://docs.sonarqube.org/) reporter for [Vitest](https://vitest.dev/)

Generates [Generic Execution](https://docs.sonarqube.org/latest/analysis/generic-test/#header-2) reports from `vitest` tests for SonarQube to analyze.

## Installation

`vitest-sonar-reporter` should be included in development dependencies. `vitest` is required as peer dependency.

```
yarn add --dev vitest-sonar-reporter
```

## Configuration

Add new custom reporter and defined `outputFile` in your [`vite.config.ts`](https://vitest.dev/config/):

```ts
import { defineConfig } from 'vitest/config';
import SonarReporter from 'vitest-sonar-reporter';

export default defineConfig({
    test: {
        reporters: new SonarReporter(),
        outputFile: 'sonar-report.xml',
    },
});
```

Instruct SonarQube to pick report in your [`sonar-project.properties`](https://docs.sonarqube.org/latest/analysis/scan/sonarscanner/):

```
sonar.testExecutionReportPaths=sonar-report.xml
```

## Examples

```ts
import { describe, expect, test } from 'vitest';

describe('animals', () => {
    test('dogs say woof', () => {
        const dog = { say: () => 'woof' };
        expect(dog.say()).toBe('woof');
    });

    test.todo('figure out what rabbits say', () => {
        const rabbit = { say: () => '????' };
        expect(rabbit.say()).toBe('?');
    });

    describe('flying ones', () => {
        test('cats can fly', () => {
            const cat = { fly: () => false };
            expect(cat.fly()).toBe(true);
        });

        test('birds can fly', () => {
            const bird = { fly: () => true };
            expect(bird.fly()).toBe(true);
        });
    });
});
```

```xml
<testExecutions version="1">
  <file path="test/animals.test.ts">
    <testCase name="animals - dogs say woof" duration="2" />
    <testCase name="animals - figure out what rabbits say">
      <skipped message="figure out what rabbits say" />
    </testCase>
    <testCase name="animals - flying ones - cats can fly" duration="4">
      <failure message="expected false to be true // Object.is equality">
        <![CDATA[AssertionError: expected false to be true // Object.is equality
    at /workspaces/example/test/animals.test.ts:15:47
    at /workspaces/example/node_modules/vitest/dist/chunk-runtime-chain.7032872a.js:82:26
    at runTest (/workspaces/example/node_modules/vitest/dist/entry.js:771:40)
    at async runSuite (/workspaces/example/node_modules/vitest/dist/entry.js:836:13)
    at async runSuite (/workspaces/example/node_modules/vitest/dist/entry.js:836:13)
    at async runSuite (/workspaces/example/node_modules/vitest/dist/entry.js:836:13)
    at async runFiles (/workspaces/example/node_modules/vitest/dist/entry.js:873:5)
    at async startTests (/workspaces/example/node_modules/vitest/dist/entry.js:879:3)
    at async /workspaces/example/node_modules/vitest/dist/entry.js:906:7
    at async withEnv (/workspaces/example/node_modules/vitest/dist/entry.js:503:5)]]>
      </failure>
    </testCase>
    <testCase name="animals - flying ones - birds can fly" duration="5" />
  </file>
</testExecutions>
```
