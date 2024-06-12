import * as fs from "fs";
import * as path from "path";

import { createRequestHandler } from "@remix-run/server-runtime";
import * as build from "./build/server/index.js";


const requestHandler = createRequestHandler(build);

setInterval(() => {
	Bun.gc(true);
}, 9000);

async function handler(request: Request): Promise<Response> {
	const file = tryServeStaticFile("public", request);
	if (file) return file;

	return requestHandler(request);
}

const server = Bun.serve({
	port: 3000,
	fetch: handler,
});

console.log(`${server.hostname}:${server.port}`);

function tryServeStaticFile(
	staticDir: string,
	request: Request
): Response | undefined {
	const url = new URL(request.url);

	if (url.pathname.length < 2) return undefined;

	const filePath = path.join(staticDir, url.pathname);

	if (fs.existsSync(filePath)) {
		const file = Bun.file(filePath);
		return new Response(file, {
			headers: {
				"Content-Type": file.type,
				"Cache-Control": "public, max-age=31536000",
			},
		});
	}

	return undefined;
}
