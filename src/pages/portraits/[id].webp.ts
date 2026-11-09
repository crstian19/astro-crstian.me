import type { APIRoute, GetStaticPaths } from "astro";
import { buildPhoto, portraitId, profileSources } from "@lib/portrait";

// Hover photos of the MatrixPortrait sources, as static files: inlined as data
// URIs they made the home page HTML ~25 KB (gzipped) heavier.
export const getStaticPaths = (() =>
	profileSources().map((source) => ({ params: { id: portraitId(source) }, props: { source } }))) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) =>
	new Response(new Uint8Array(await buildPhoto(props.source)), { headers: { "Content-Type": "image/webp" } });
