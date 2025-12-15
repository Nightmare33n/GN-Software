"use client";

import { useState } from "react";
import config from "@/config";

export default function GigFilters({ onFilterChange, initialCategory = "all", initialSearch = "" }) {
  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onFilterChange({ search, category: selectedCategory });
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    onFilterChange({ search, category });
  };

  return (
    <div className="space-y-4">
      {/* GigFilters START */}

      {/* Search */}
      <form onSubmit={handleSearchSubmit} className="join w-full">
        <input
          type="text"
          className="input input-bordered join-item flex-1"
          placeholder="Search gigs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit" className="btn btn-primary join-item">
          Search
        </button>
      </form>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        <button
          className={`btn btn-sm ${selectedCategory === 'all' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => handleCategoryChange('all')}
        >
          All Categories
        </button>
        {config.categories.map((cat) => (
          <button
            key={cat.value}
            className={`btn btn-sm ${selectedCategory === cat.value ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => handleCategoryChange(cat.value)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* GigFilters END */}
    </div>
  );
}
