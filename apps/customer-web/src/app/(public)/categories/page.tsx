import { CategorySection } from "@/src/features/categories/components/category-section";

export default function CategoriesPage() {
  return (
    <main className="w-full py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight">
            Explore Categories
          </h1>

          <p className="mt-3 text-muted-foreground">
            Discover courses across multiple domains and
            find the right learning path for your career.
          </p>
        </div>

        <CategorySection />
      </div>
    </main>
  );  
}