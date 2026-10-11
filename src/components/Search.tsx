import type { CollectionEntry } from "astro:content";
import { createEffect, createSignal } from "solid-js";
import Fuse from "fuse.js";
import ArrowCard from "@components/ArrowCard";

type Props = {
	data: CollectionEntry<"projects">[];
};

export default function Search({ data }: Props) {
	const [query, setQuery] = createSignal("");
	const [results, setResults] = createSignal<CollectionEntry<"projects">[]>([]);

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
					class="w-full px-4 py-3.5 pl-11 rounded-2xl outline-hidden text-lg text-foreground bg-background/50 backdrop-blur-md border border-border placeholder:text-muted-foreground focus:border-primary transition-colors"
				/>
				<svg class="absolute size-5 left-4 top-1/2 -translate-y-1/2 stroke-current text-muted-foreground">
					<use href={"/ui.svg#search"} />
				</svg>
			</div>
			{query().length >= 2 && results().length >= 1 && (
				<div class="mt-8">
					<div class="mb-3 font-mono text-xs text-muted-foreground">
						Found {results().length} results for {`'${query()}'`}
					</div>
					<ul class="grid gap-4 sm:grid-cols-2">
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
