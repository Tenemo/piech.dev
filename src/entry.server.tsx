import { PassThrough } from 'node:stream';

import { createReadableStreamFromReadable } from '@react-router/node';
import React from 'react';
import type { RenderToPipeableStreamOptions } from 'react-dom/server';
import { renderToPipeableStream } from 'react-dom/server';
import type { AppLoadContext, EntryContext } from 'react-router';
import { ServerRouter } from 'react-router';

export const streamTimeout = 5_000;

export default function handleRequest(
    request: Request,
    responseStatusCode: number,
    responseHeaders: Headers,
    routerContext: EntryContext,
    _loadContext: AppLoadContext,
): Promise<Response> {
    return new Promise<Response>((resolve, reject) => {
        let shellRendered = false;

        // During SPA mode prerender, wait for all content to load; otherwise shell is fine
        const readyOption: keyof RenderToPipeableStreamOptions =
            routerContext.isSpaMode ? 'onAllReady' : 'onShellReady';

        const { pipe, abort } = renderToPipeableStream(
            <ServerRouter context={routerContext} url={request.url} />,
            {
                [readyOption]() {
                    shellRendered = true;
                    const body = new PassThrough();
                    const stream = createReadableStreamFromReadable(body);

                    responseHeaders.set('Content-Type', 'text/html');

                    resolve(
                        new Response(stream, {
                            headers: responseHeaders,
                            status: responseStatusCode,
                        }),
                    );

                    pipe(body);
                },
                onShellError(err: unknown) {
                    reject(err instanceof Error ? err : new Error(String(err)));
                },
                onError(err: unknown) {
                    responseStatusCode = 500;
                    if (shellRendered) {
                        console.error(err);
                    }
                },
            },
        );

        // Abort the rendering stream after the timeout so it has time to flush down rejected boundaries
        setTimeout(abort, streamTimeout + 1000);
    });
}
