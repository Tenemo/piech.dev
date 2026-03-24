/* eslint-disable @typescript-eslint/no-require-imports */
const childProcess = require('node:child_process');
const { EventEmitter } = require('node:events');
const path = require('node:path');

if (process.platform === 'win32') {
    const originalExec = childProcess.exec;

    childProcess.exec = function patchedExec(command, ...args) {
        if (command === 'net use') {
            const callback =
                typeof args.at(-1) === 'function' ? args.pop() : undefined;
            const child = new EventEmitter();

            child.stdin = null;
            child.stdout = null;
            child.stderr = null;
            child.kill = () => true;

            process.nextTick(() => {
                callback?.(null, '', '');
            });

            return child;
        }

        return originalExec.call(this, command, ...args);
    };
}

const reactRouterBin = path.join(
    path.dirname(require.resolve('@react-router/dev/package.json')),
    'bin.js',
);

require(reactRouterBin);
