import { cn, formatDate } from "@lib/utils";
import type { CollectionEntry } from "astro:content";

type Props = {
	entry: CollectionEntry<"blog"> | CollectionEntry<"projects">;
	pill?: boolean;
	featured?: boolean;
	class?: string;
};

function Logo(props: { entry: CollectionEntry<"projects">; size: "sm" | "lg" }) {
	const { logo, logoBg, title } = props.entry.data;
	if (!logo) return null;
	return (
		<div
			class={cn(
				"logo-tile relative shrink-0 grid place-items-center overflow-hidden border border-foreground/10 transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-3",
				props.size === "lg" ? "size-20 sm:size-24 rounded-2xl p-2" : "size-16 rounded-2xl p-1.5",
			)}
			style={{ background: logoBg ?? "oklch(var(--foreground) / 0.06)" }}
		>
			<img src={logo.src} alt={`${title} logo`} width={logo.width} height={logo.height} loading="lazy" decoding="async" class="size-full object-contain" />
		</div>
	);
}

export default function ArrowCard({ entry, pill, featured, class: className }: Props) {
	const hasLogo = entry.collection === "projects" && !!entry.data.logo;
	const Meta = () => (
		<span class="flex flex-wrap items-center gap-2">
			{pill && <span class="tag">{entry.collection === "blog" ? "post" : "project"}</span>}
			{featured && <span class="tag !border-primary/40 !bg-primary/10 !text-primary">Latest launch</span>}
			{formatDate(entry.data.date)}
		</span>
	);
	return (
		<a
			href={`/${entry.collection}/${entry.id}`}
			class={cn("panel group flex flex-col h-full overflow-hidden", featured ? "p-7 sm:p-9" : "p-6", className)}
		>
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
			{/* Top row: logo (if any) on the left, arrow on the right; the date sits below it when there is a logo. */}
			<div class="relative flex items-start justify-between gap-3 font-mono text-xs text-muted-foreground">
				{hasLogo ? (
					<Logo entry={entry as CollectionEntry<"projects">} size={featured ? "lg" : "sm"} />
				) : (
					<Meta />
				)}
				<svg
					class="size-5 shrink-0 transition-all duration-300 group-hover:text-primary group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<path d="M7 17 17 7M8 7h9v9" />
				</svg>
			</div>
			{hasLogo && (
				<div class="relative mt-5 font-mono text-xs text-muted-foreground">
					<Meta />
				</div>
			)}
			<div
				class={cn(
					"relative mt-2 font-serif font-medium tracking-tight transition-colors group-hover:text-primary",
					featured ? "text-3xl sm:text-4xl" : "text-xl",
				)}
			>
				{entry.data.title}
			</div>
			<p class={cn("relative mt-2 text-muted-foreground text-pretty", featured ? "text-base sm:text-lg" : "text-sm line-clamp-3")}>
				{entry.data.summary}
			</p>
			<ul class="relative mt-auto pt-5 flex flex-wrap gap-1.5">
				{entry.data.tags.slice(0, featured ? 8 : 4).map((tag: string) => (
					<li class="tag">{tag}</li>
				))}
			</ul>
		</a>
	);
}
