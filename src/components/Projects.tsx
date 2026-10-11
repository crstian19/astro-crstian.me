import type { CollectionEntry } from "astro:content";
import { createMemo, createSignal, For } from "solid-js";
import ArrowCard from "@components/ArrowCard";
import { cn } from "@lib/utils";

type Props = {
	tags: string[];
	data: CollectionEntry<"projects">[];
};

export default function Projects({ data, tags }: Props) {
	const [filter, setFilter] = createSignal(new Set<string>());

	const projects = createMemo(() =>
		data.filter((entry) =>
			Array.from(filter()).every((value) =>
				entry.data.tags.some((tag: string) => tag.toLowerCase() === value.toLowerCase()),
			),
		),
	);

	function toggleTag(tag: string) {
		setFilter((prev) => new Set(prev.has(tag) ? [...prev].filter((t) => t !== tag) : [...prev, tag]));
	}

	return (
		<div>
			<div class="px-6 sm:px-8 pb-6">
				<div class="flex flex-wrap gap-1.5">
					<For each={tags}>
						{(tag) => (
							<button
								type="button"
								onClick={() => toggleTag(tag)}
								aria-pressed={filter().has(tag)}
								class={cn(
									"tag cursor-pointer hover:bg-tag-bg-hover",
									filter().has(tag) && "border-primary/60 bg-primary/15 text-primary",
								)}
							>
								{tag}
							</button>
						)}
					</For>
				</div>
				<div class="mt-4 font-mono text-xs text-muted-foreground">
					Showing {projects().length} of {data.length} projects
				</div>
			</div>
			<ul class="border-t border-border/50 divide-y divide-border/50">
				<For each={projects()}>
					{(project) => (
						<li>
							<ArrowCard entry={project} />
						</li>
					)}
				</For>
			</ul>
		</div>
	);
}
