import { reactRouter } from '@react-router/dev/vite';
import type { Plugin, PluginOption, UserConfig } from 'vite';

type ViteConfigHook = (
    ...args: readonly unknown[]
) => Promise<UserConfig | null | undefined> | UserConfig | null | undefined;

type LegacyEsbuildConfig = {
    jsx?: 'automatic' | 'preserve' | 'transform';
    jsxDev?: boolean;
    jsxFactory?: string;
    jsxFragment?: string;
    jsxImportSource?: string;
    jsxInject?: string;
    jsxSideEffects?: boolean;
    define?: Record<string, string>;
    exclude?: RegExp | readonly (RegExp | string)[] | string;
    include?: RegExp | readonly (RegExp | string)[] | string;
} & Record<string, unknown>;

type LegacyOptimizeDepsEsbuildOptions = {
    jsx?: 'automatic' | 'preserve' | 'transform';
} & Record<string, unknown>;

type OptimizeDepsConfigWithoutEsbuild = Omit<
    NonNullable<UserConfig['optimizeDeps']>,
    'esbuildOptions'
>;

type LegacyOptimizeDepsConfig = OptimizeDepsConfigWithoutEsbuild & {
    esbuildOptions?: LegacyOptimizeDepsEsbuildOptions;
};

type UserConfigWithLegacyCompat = Omit<
    UserConfig,
    'esbuild' | 'optimizeDeps'
> & {
    esbuild?: false | LegacyEsbuildConfig;
    optimizeDeps?: LegacyOptimizeDepsConfig;
};

type RolldownJsxRuntime = 'preserve' | 'react' | 'react-jsx';
type OxcConfig = Exclude<UserConfig['oxc'], false | undefined>;

const getRolldownJsxRuntime = (
    jsx: LegacyOptimizeDepsEsbuildOptions['jsx'],
): RolldownJsxRuntime | undefined => {
    if (jsx === 'automatic') {
        return 'react-jsx';
    }

    if (jsx === 'transform') {
        return 'react';
    }

    return jsx;
};

const convertEsbuildToOxcConfig = (
    esbuildConfig: LegacyEsbuildConfig,
): OxcConfig => {
    const { jsxInject, include, exclude, ...transformOptions } = esbuildConfig;
    const oxcConfig: OxcConfig = {
        exclude,
        include,
        jsxInject,
    };

    if (transformOptions.jsx === 'preserve') {
        oxcConfig.jsx = 'preserve';
    } else {
        const jsxOptions: Exclude<OxcConfig['jsx'], string | undefined> = {};

        if (transformOptions.jsx === 'automatic') {
            jsxOptions.runtime = 'automatic';
            if (typeof transformOptions.jsxImportSource === 'string') {
                jsxOptions.importSource = transformOptions.jsxImportSource;
            }
        }

        if (transformOptions.jsx === 'transform') {
            jsxOptions.runtime = 'classic';
            if (typeof transformOptions.jsxFactory === 'string') {
                jsxOptions.pragma = transformOptions.jsxFactory;
            }
            if (typeof transformOptions.jsxFragment === 'string') {
                jsxOptions.pragmaFrag = transformOptions.jsxFragment;
            }
        }

        if (typeof transformOptions.jsxDev === 'boolean') {
            jsxOptions.development = transformOptions.jsxDev;
        }

        if (typeof transformOptions.jsxSideEffects === 'boolean') {
            jsxOptions.pure = transformOptions.jsxSideEffects;
        }

        oxcConfig.jsx = jsxOptions;
    }

    if (transformOptions.define) {
        oxcConfig.define = transformOptions.define;
    }

    return oxcConfig;
};

const migrateEsbuildToOxcConfig = (
    config: UserConfig | null | undefined,
): UserConfig | null | undefined => {
    const legacyConfig = config as
        | UserConfigWithLegacyCompat
        | null
        | undefined;
    const esbuildConfig = legacyConfig?.esbuild;

    if (!config || !esbuildConfig || config.oxc) {
        return config;
    }

    const migratedConfig: UserConfigWithLegacyCompat = {
        ...legacyConfig,
        oxc: convertEsbuildToOxcConfig(esbuildConfig),
    };

    delete migratedConfig.esbuild;

    return migratedConfig;
};

const migrateOptimizeDepsEsbuildOptions = (
    config: UserConfig | null | undefined,
): UserConfig | null | undefined => {
    const legacyOptimizeDeps = (
        config as UserConfigWithLegacyCompat | null | undefined
    )?.optimizeDeps;
    const esbuildOptions = legacyOptimizeDeps?.esbuildOptions;

    if (!config || !legacyOptimizeDeps || !esbuildOptions) {
        return config;
    }

    const { jsx, ...remainingEsbuildOptions } = esbuildOptions;
    const rolldownJsxRuntime = getRolldownJsxRuntime(jsx);
    const migratedOptimizeDeps: LegacyOptimizeDepsConfig = {
        ...legacyOptimizeDeps,
    };

    if (rolldownJsxRuntime) {
        const existingTransform =
            migratedOptimizeDeps.rolldownOptions?.transform &&
            typeof migratedOptimizeDeps.rolldownOptions.transform === 'object'
                ? migratedOptimizeDeps.rolldownOptions.transform
                : {};

        migratedOptimizeDeps.rolldownOptions = {
            ...migratedOptimizeDeps.rolldownOptions,
            transform: {
                ...existingTransform,
                jsx: existingTransform.jsx ?? rolldownJsxRuntime,
            },
        };
    }

    if (Object.keys(remainingEsbuildOptions).length === 0) {
        delete migratedOptimizeDeps.esbuildOptions;
    } else {
        migratedOptimizeDeps.esbuildOptions = remainingEsbuildOptions;
    }

    return {
        ...config,
        optimizeDeps: migratedOptimizeDeps,
    };
};

const wrapConfigHook = (hook: ViteConfigHook): ViteConfigHook => {
    return async (...args) =>
        migrateOptimizeDepsEsbuildOptions(
            migrateEsbuildToOxcConfig(await hook(...args)),
        );
};

const wrapReactRouterPluginOptions = (
    pluginOption: PluginOption,
): PluginOption => {
    if (Array.isArray(pluginOption)) {
        return pluginOption.map(wrapReactRouterPluginOptions);
    }

    if (!pluginOption || typeof pluginOption !== 'object') {
        return pluginOption;
    }

    const plugin = pluginOption as Plugin;
    const wrappedPlugin: Plugin = { ...plugin };

    if (plugin.config) {
        wrappedPlugin.config = wrapConfigHook(plugin.config as ViteConfigHook);
    }

    if (plugin.configEnvironment) {
        wrappedPlugin.configEnvironment = wrapConfigHook(
            plugin.configEnvironment as ViteConfigHook,
        );
    }

    return wrappedPlugin;
};

export const reactRouterVite8Compat = (): PluginOption =>
    wrapReactRouterPluginOptions(reactRouter());
