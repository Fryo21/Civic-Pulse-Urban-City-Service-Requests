interface CategoryFilterProps {
  categories: string[];
  value: string;
  onChange: (value: string) => void;
}

export default function CategoryFilter({
  categories,
  value,
  onChange,
}: CategoryFilterProps) {
  return (
    <label className="category-filter">
      <span>Category</span>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="all">All</option>

        {categories.map((category) => (
          <option
            key={category}
            value={category}
          >
            {category}
          </option>
        ))}
      </select>
    </label>
  );
}
