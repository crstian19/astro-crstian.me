import { formatDate } from "@lib/utils";
import type { CollectionEntry } from "astro:content";

type Props = {
	entry: CollectionEntry<"blog"> | CollectionEntry<"projects">;
	pill?: boolean;
};

export default function ArrowCard({ entry, pill }: Props) {
	return (
		<a
			href={`/${entry.collection}/${entry.id}`}
			class="group flex items-start gap-4 px-6 sm:px-8 py-4 hover:bg-muted/30 transition-colors"
		>
			<div class="min-w-0 flex-1">
				<div class="flex flex-wrap items-center gap-2 font-mono text-xs text-muted-foreground">
					{pill && <span class="tag">{entry.collection === "blog" ? "post" : "project"}</span>}
					{formatDate(entry.data.date)}
				</div>
				<div class="mt-1 font-semibold text-lg/snug group-hover:text-primary transition-colors">
					{entry.data.title}
				</div>
				<p class="mt-1 text-sm text-muted-foreground line-clamp-2">{entry.data.summary}</p>
				<ul class="mt-3 flex flex-wrap gap-1.5">
					{entry.data.tags.map((tag: string) => (
						<li class="tag">{tag}</li>
					))}
				</ul>
			</div>
			<svg
				class="mt-7 size-5 shrink-0 text-muted-foreground transition-all group-hover:text-primary group-hover:translate-x-1"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
			>
				<path d="M5 12h14M12 5l7 7-7 7" />
			</svg>
		</a>
	);
}
