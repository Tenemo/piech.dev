import fs from 'node:fs';
import path from 'node:path';

const CONFIG_PATH = path.resolve(
    process.cwd(),
    '.github',
    'playwright-workflow-config.json',
);

type WorkflowTarget = 'pull_request' | 'production';

type BaseWorkflowConfig = {
    runnerLabel: string;
    workers: number;
};

type ProductionWorkflowConfig = BaseWorkflowConfig & {
    maxParallel: number;
};

type WorkflowConfig = {
    pull_request: BaseWorkflowConfig;
    production: ProductionWorkflowConfig;
};

function assertPositiveInteger(value: number, fieldName: string): void {
    if (!Number.isInteger(value) || value < 1) {
        throw new Error(
            `Expected "${fieldName}" to be a positive integer, received ${String(value)}.`,
        );
    }
}

function parseWorkflowTarget(rawTarget: string | undefined): WorkflowTarget {
    if (rawTarget === 'pull_request' || rawTarget === 'production') {
        return rawTarget;
    }

    throw new Error(
        'Expected a workflow target of "pull_request" or "production".',
    );
}

function validateBaseConfig(
    rawConfig: unknown,
    fieldPrefix: WorkflowTarget,
): BaseWorkflowConfig {
    if (
        typeof rawConfig !== 'object' ||
        rawConfig === null ||
        Array.isArray(rawConfig)
    ) {
        throw new Error(`Expected "${fieldPrefix}" to be an object.`);
    }

    const config = rawConfig as Record<string, unknown>;
    const { runnerLabel, workers } = config;

    if (typeof runnerLabel !== 'string' || runnerLabel === '') {
        throw new Error(
            `Expected "${fieldPrefix}.runnerLabel" to be a non-empty string.`,
        );
    }

    if (typeof workers !== 'number') {
        throw new Error(`Expected "${fieldPrefix}.workers" to be a number.`);
    }

    assertPositiveInteger(workers, `${fieldPrefix}.workers`);

    return {
        runnerLabel,
        workers,
    };
}

function validateProductionConfig(
    rawConfig: unknown,
): ProductionWorkflowConfig {
    if (
        typeof rawConfig !== 'object' ||
        rawConfig === null ||
        Array.isArray(rawConfig)
    ) {
        throw new Error('Expected "production" to be an object.');
    }

    const config = rawConfig as Record<string, unknown>;
    const validatedConfig = validateBaseConfig(rawConfig, 'production');
    const { maxParallel } = config;

    if (typeof maxParallel !== 'number') {
        throw new Error('Expected "production.maxParallel" to be a number.');
    }

    assertPositiveInteger(maxParallel, 'production.maxParallel');

    return {
        ...validatedConfig,
        maxParallel,
    };
}

function parseWorkflowConfig(rawConfig: unknown): WorkflowConfig {
    if (typeof rawConfig !== 'object' || rawConfig === null) {
        throw new Error('Expected workflow config to be an object.');
    }

    const maybeConfig = rawConfig as Record<string, unknown>;

    return {
        pull_request: validateBaseConfig(
            maybeConfig.pull_request,
            'pull_request',
        ),
        production: validateProductionConfig(maybeConfig.production),
    };
}

const target = parseWorkflowTarget(process.argv[2]);
const rawConfig = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8')) as unknown;
const parsedConfig = parseWorkflowConfig(rawConfig);
const outputs: Record<string, string> =
    target === 'pull_request'
        ? {
              runner_label: parsedConfig.pull_request.runnerLabel,
              workers: String(parsedConfig.pull_request.workers),
          }
        : {
              runner_label: parsedConfig.production.runnerLabel,
              workers: String(parsedConfig.production.workers),
              max_parallel: String(parsedConfig.production.maxParallel),
          };

process.stdout.write(
    `${Object.entries(outputs)
        .map(([key, value]) => `${key}=${value}`)
        .join('\n')}\n`,
);
