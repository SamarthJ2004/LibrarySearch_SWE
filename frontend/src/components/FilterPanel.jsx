function FilterPanel({ filters, searchParams, onFilterChange, onClear }) {
    const hasActiveFilters = searchParams.author || searchParams.subject ||
        searchParams.year_from || searchParams.year_to || searchParams.type;

    return (
        <div className="filter-panel">
            <div className="filter-header">
                <h3>🎯 Filters</h3>
                {hasActiveFilters && (
                    <button className="filter-clear-btn" onClick={onClear}>
                        Clear all
                    </button>
                )}
            </div>

            <div className="filter-group">
                <label className="filter-label">Author</label>
                <input
                    type="text"
                    className="filter-input"
                    placeholder="Filter by author..."
                    value={searchParams.author || ''}
                    onChange={(e) => onFilterChange('author', e.target.value)}
                    id="filter-author"
                />
            </div>

            <div className="filter-group">
                <label className="filter-label">Subject</label>
                <select
                    className="filter-select"
                    value={searchParams.subject || ''}
                    onChange={(e) => onFilterChange('subject', e.target.value)}
                    id="filter-subject"
                >
                    <option value="">All subjects</option>
                    {filters.subjects && filters.subjects.map((s) => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
            </div>

            <div className="filter-group">
                <label className="filter-label">Resource Type</label>
                <select
                    className="filter-select"
                    value={searchParams.type || ''}
                    onChange={(e) => onFilterChange('type', e.target.value)}
                    id="filter-type"
                >
                    <option value="">All types</option>
                    {filters.resource_types && filters.resource_types.map((t) => (
                        <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                    ))}
                </select>
            </div>

            <div className="filter-group">
                <label className="filter-label">Publication Year</label>
                <div className="filter-year-range">
                    <input
                        type="number"
                        className="filter-input filter-year"
                        placeholder="From"
                        value={searchParams.year_from || ''}
                        onChange={(e) => onFilterChange('year_from', e.target.value)}
                        min={filters.year_range?.min || 1900}
                        max={filters.year_range?.max || 2030}
                        id="filter-year-from"
                    />
                    <span className="year-separator">—</span>
                    <input
                        type="number"
                        className="filter-input filter-year"
                        placeholder="To"
                        value={searchParams.year_to || ''}
                        onChange={(e) => onFilterChange('year_to', e.target.value)}
                        min={filters.year_range?.min || 1900}
                        max={filters.year_range?.max || 2030}
                        id="filter-year-to"
                    />
                </div>
            </div>
        </div>
    );
}

export default FilterPanel;
