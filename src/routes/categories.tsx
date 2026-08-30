import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { AppShell } from "@/components/AppShell";
import { CategoryCard } from "@/components/CategoryCard";
import { SearchBar } from "@/components/SearchBar";
import { quoteService } from "@/services/quoteService";

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [
      { title: "Categories – DailySpark" },
      { name: "description", content: "Browse quotes by category: motivation, success, life, business, study, fitness, love, happiness, discipline, and self growth." },
    ],
  }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const categories = useMemo(() => {
    return quoteService.getCategories();
  }, []);

  const filteredCategories = useMemo(() => {
    if (!searchQuery) return categories;
    const cleanQuery = searchQuery.toLowerCase().trim();
    return categories.filter((c) => c.name.toLowerCase().includes(cleanQuery));
  }, [categories, searchQuery]);

  return (
    <AppShell>
      <header className="px-5 pt-8">
        <p className="text-sm text-muted-foreground">Browse</p>
        <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
        <div className="mt-5">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search categories…"
          />
        </div>
      </header>

      <section className="mt-6 px-5 pb-8">
        {filteredCategories.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {filteredCategories.map((c, idx) => (
              <CategoryCard
                key={c.name}
                icon={c.icon}
                name={c.name}
                count={c.count}
                gradient={c.gradient}
                onClick={() =>
                  navigate({
                    to: "/categories/$category",
                    params: { category: c.name },
                  })
                }
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <h3 className="text-lg font-bold">No categories found</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-xs">
              No categories match your search. Try adjusting your spelling or searching for a different keyword.
            </p>
          </div>
        )}
      </section>
    </AppShell>
  );
}
