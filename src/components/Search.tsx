import type { CollectionEntry } from "astro:content";
import { createEffect, createSignal } from "solid-js";
import Fuse from "fuse.js";
import ArrowCard from "@components/ArrowCard";

type Props = {
	data: CollectionEntry<"blog">[];
};

export default function Search({ data }: Props) {
	const [query, setQuery] = createSignal("");
	const [results, setResults] = createSignal<CollectionEntry<"blog">[]>([]);

	const fuse = new Fuse(data, {
		keys: ["slug", "data.title", "data.summary", "data.tags"],
		includeMatches: true,
		minMatchCharLength: 2,
		threshold: 0.4,
	});

	createEffect(() => {
		if (query().length < 2) {
			setResults([]);
		} else {
			setResults(fuse.search(query()).map((result) => result.item));
		}
	});

	const onInput = (e: Event) => {
		const target = e.target as HTMLInputElement;
		setQuery(target.value);
	};

	return (
		<div class="flex flex-col">
			<div class="relative">
				<input
					name="search"
					type="text"
					value={query()}
					onInput={onInput}
					autocomplete="off"
					spellcheck={false}
					placeholder="What are you looking for?"
					class="w-full px-3 py-2.5 pl-10 rounded-lg outline-none text-foreground bg-muted/60 border border-border placeholder:text-muted-foreground focus:border-primary transition-colors"
				/>
				<svg class="absolute size-5 left-3 top-1/2 -translate-y-1/2 stroke-current text-muted-foreground">
					<use href={"/ui.svg#search"} />
				</svg>
			</div>
			{query().length >= 2 && results().length >= 1 && (
				<div class="mt-8 -mx-6 sm:-mx-8">
					<div class="px-6 sm:px-8 mb-3 font-mono text-xs text-muted-foreground">
						Found {results().length} results for {`'${query()}'`}
					</div>
					<ul class="border-t border-border/50 divide-y divide-border/50">
						{results().map((result) => (
							<li>
								<ArrowCard entry={result} pill={true} />
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
}
