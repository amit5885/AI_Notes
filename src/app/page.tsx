import { SearchBar } from "@/components/SearchBar";
import { TrendingTopics } from "@/components/TrendingTopics";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold mb-4">AI Notes</h1>
        <p className="text-xl text-gray-600 max-w-lg mx-auto">
          Enter any topic and get AI-generated study notes with text explanations
          and concept diagrams.
        </p>
      </div>

      <SearchBar />
      <TrendingTopics />

      <footer className="mt-auto pt-16 pb-8 text-center text-sm text-gray-400">
        <p>AI Notes &mdash; Learn anything, instantly.</p>
      </footer>
    </main>
  );
}
