import { cn, formatDate } from "@lib/utils";
import type { CollectionEntry } from "astro:content";

type Props = {
	entry: CollectionEntry<"blog"> | CollectionEntry<"projects">;
	pill?: boolean;
	featured?: boolean;
	class?: string;
};

/**
 * Card in the style of the project list on the blog: a monochrome Iconify icon
 * top-right and Website / GitHub links bottom-right. The title is the card's
 * link, stretched over the whole card, so the footer links can sit inside it.
 */
export default function ArrowCard({ entry, pill, featured, class: className }: Props) {
	const project = entry.collection === "projects" ? (entry as CollectionEntry<"projects">).data : undefined;
	const href = `/${entry.collection}/${entry.id}`;

	return (
		<div class={cn("panel panel-hover group flex flex-col h-full overflow-hidden", featured ? "p-7 sm:p-9" : "p-6", className)}>
			{featured && (
				<div
					class="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full opacity-40 blur-3xl transition-opacity duration-500 group-hover:opacity-70"
					style={{ background: "radial-gradient(circle, oklch(var(--brand) / 0.6), transparent 70%)" }}
					aria-hidden="true"
				/>
			)}
			{featured && (
				<span
					class="featured-index pointer-events-none absolute -bottom-10 right-4 font-serif font-semibold leading-none select-none text-[11rem] sm:text-[14rem]"
					aria-hidden="true"
				>
					01
				</span>
			)}

			<div class="relative flex items-start justify-between gap-4">
				<span class="flex flex-wrap items-center gap-2 font-mono text-xs text-muted-foreground pt-1">
					{pill && <span class="tag">{entry.collection === "blog" ? "post" : "project"}</span>}
					{featured && <span class="tag !border-primary/40 !bg-primary/10 !text-primary">Latest launch</span>}
					{formatDate(entry.data.date)}
				</span>
				{project?.icon && (
					<span
						class={cn(
							project.icon,
							"shrink-0 text-muted-foreground transition-all duration-300 group-hover:text-primary group-hover:rotate-6",
							featured ? "size-14 sm:size-16" : "size-10",
						)}
						aria-hidden="true"
					/>
				)}
			</div>

			<a
				href={href}
				class={cn(
					"relative mt-3 font-serif font-medium tracking-tight transition-colors group-hover:text-primary",
					"after:absolute after:inset-0 after:content-[''] focus-visible:outline-none",
					featured ? "text-3xl sm:text-4xl" : "text-xl",
				)}
			>
				{entry.data.title}
			</a>
			<p class={cn("relative mt-2 text-muted-foreground text-pretty", featured ? "text-base sm:text-lg max-w-xl" : "text-sm line-clamp-3")}>
				{entry.data.summary}
			</p>

			<div class="relative mt-auto pt-5 flex flex-wrap items-end justify-between gap-x-4 gap-y-3">
				<ul class="flex flex-wrap gap-1.5">
					{entry.data.tags.slice(0, featured ? 8 : 4).map((tag: string) => (
						<li class="tag">{tag}</li>
					))}
				</ul>
				{(project?.demoUrl || project?.repoUrl) && (
					// z-10 lifts the links above the title's stretched link.
					<div class="relative z-10 flex items-center gap-4 text-sm text-muted-foreground">
						{project.demoUrl && (
							<a href={project.demoUrl} target="_blank" rel="noopener" class="flex items-center gap-1 hover:text-primary transition-colors">
								<span class="icon-[ph--globe] size-4" aria-hidden="true" />
								Website
							</a>
						)}
						{project.repoUrl && (
							<a href={project.repoUrl} target="_blank" rel="noopener" class="flex items-center gap-1 hover:text-primary transition-colors">
								<span class="icon-[simple-icons--github] size-4" aria-hidden="true" />
								GitHub
							</a>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
