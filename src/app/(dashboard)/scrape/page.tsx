import { ScrapeForm } from "@/components/scrape/scrape-form";

export default function ScrapePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">New Scrape</h1>
      <p className="text-muted-foreground mb-8">Enter parameters to find and enrich leads.</p>
      <ScrapeForm />
    </div>
  );
}
