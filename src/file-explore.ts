import { readFileSync } from 'fs';
import { resolve } from 'path';

interface TestList {
    children?: Array<TestList>;
    level: number;
    name: string;
}

export function parseTests(file: string, code: string) {
    const stack = [];
    const results = [];

    const regex = /(describe|test|it)\(['"](.+?)['"]/g;
    let match;
    while ((match = regex.exec(code))) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [_, method, arg] = match;
        const level: number = stack.length;
        const item: TestList = { name: arg, level, children: [] };

        if (level === 0) {
            results.push(item);
        } else {
            const parent = stack[level - 1];
            parent.children = parent.children || [];
            parent.children.push(item);
        }

        if (method === 'describe') {
            stack.push(item);
        }
    }

    return results;
}

interface JSONData {
    [key: string]: any;
}

export function readJSONFile(filePath: string): JSONData | null {
    try {
        const resolvedPath = resolve(filePath);
        const fileData = readFileSync(resolvedPath, 'utf-8');
        const jsonData = JSON.parse(fileData);
        return jsonData;
    } catch (error) {
        return null;
    }
}
