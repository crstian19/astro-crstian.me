import { cn, formatDate } from "@lib/utils";
import type { CollectionEntry } from "astro:content";
import { githubRepo } from "@lib/github";

/**
 * GitHub stars or forks, as on the blog's project list. Rendered with the
 * build-time value; /js/github-counts.js counts it up and refreshes it.
 */
function Count(props: { label: string; value: number; repo: string; kind: "stars" | "forks" | "pulls" }) {
	return (
		<span class="flex items-baseline gap-2">
			<span class="text-[11px] uppercase tracking-wide font-medium text-muted-foreground">{props.label}</span>
			<span class="font-semibold text-lg tabular-nums" data-gh-count={props.kind} data-gh-repo={props.repo} data-value={props.value}>
				{props.value}
			</span>
		</span>
	);
}

type Props = {
	entry: CollectionEntry<"projects">;
	pill?: boolean;
	featured?: boolean;
	class?: string;
};

/**
 * Card in the style of the project list on the blog: the project's logo in
 * grayscale (colour on hover), or a monochrome Iconify icon, top-right and Website / GitHub links bottom-right. The title is the card's
 * link, stretched over the whole card, so the footer links can sit inside it.
 */
export default function ArrowCard({ entry, pill, featured, class: className }: Props) {
	const project = entry.collection === "projects" ? (entry as CollectionEntry<"projects">).data : undefined;
	const href = `/${entry.collection}/${entry.id}`;
	const repo = githubRepo(project?.repoUrl);

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
					{pill && <span class="tag">project</span>}
					{featured && <span class="tag !border-primary/40 !bg-primary/10 !text-primary">Latest launch</span>}
					{formatDate(entry.data.date)}
				</span>
				{project?.logo ? (
					// Real project logo: grayscale at rest, in colour on hover (.project-logo).
					<img
						src={project.logo.src}
						alt=""
						width={project.logo.width}
						height={project.logo.height}
						loading="lazy"
						decoding="async"
						class={cn("project-logo shrink-0 object-contain", featured ? "size-16 sm:size-20" : "size-12")}
					/>
				) : (
					project?.icon && (
						<span
							class={cn(
								project.icon,
								"shrink-0 text-muted-foreground transition-all duration-300 group-hover:text-primary group-hover:rotate-6",
								featured ? "size-14 sm:size-16" : "size-10",
							)}
							aria-hidden="true"
						/>
					)
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

			<ul class="relative mt-auto pt-5 flex flex-wrap gap-1.5">
				{entry.data.tags.slice(0, featured ? 8 : 4).map((tag: string) => (
					<li class="tag">{tag}</li>
				))}
			</ul>

			{project && (repo || project.demoUrl) && (
				<div class="relative mt-4 pt-4 border-t border-foreground/10 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
					{repo ? (
						<div class="flex items-center gap-5">
							<Count label="Stars" value={project.stars} repo={repo} kind="stars" />
							<Count label="Forks" value={project.forks} repo={repo} kind="forks" />
							{project.pulls !== undefined && <Count label="Pulls" value={project.pulls} repo={repo} kind="pulls" />}
						</div>
					) : (
						<span />
					)}
					{/* z-10 lifts the links above the title's stretched link. */}
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
				</div>
			)}
		</div>
	);
}
