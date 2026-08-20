import { SearchBar } from "@/components/SearchBar";
import { TrendingTopics } from "@/components/TrendingTopics";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <div className="text-center mb-10 max-w-xl">
        <h1
          className="text-4xl sm:text-5xl font-bold tracking-tight mb-4"
          style={{ textWrap: "balance" }}
        >
          AI Notes
        </h1>
        <p
          className="text-lg text-muted max-w-md mx-auto leading-relaxed"
          style={{ textWrap: "pretty" }}
        >
          Enter any topic and get structured study notes with explanations and
          concept diagrams.
        </p>
      </div>

      <SearchBar />
      <TrendingTopics />

      <footer className="mt-auto pt-20 pb-8 text-center text-sm text-muted">
        <p>AI Notes &mdash; Learn anything, instantly.</p>
      </footer>
    </main>
  );
}
