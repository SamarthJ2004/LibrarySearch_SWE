import { useState, useEffect, useCallback } from 'react';
import { searchResources, getFilters } from '../services/api';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import ResourceCard from '../components/ResourceCard';
import Pagination from '../components/Pagination';

function SearchPage() {
    const [results, setResults] = useState([]);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({ subjects: [], resource_types: [], publishers: [], year_range: {} });
    const [searchParams, setSearchParams] = useState({ q: '', author: '', subject: '', year_from: '', year_to: '', type: '' });
    const [hasSearched, setHasSearched] = useState(false);

    useEffect(() => {
        getFilters()
            .then(setFilters)
            .catch(() => { });
    }, []);

    const performSearch = useCallback(async (params, pageNum = 1) => {
        setLoading(true);
        setError(null);
        try {
            const data = await searchResources({ ...params, page: pageNum, size: 10 });
            setResults(data.results);
            setTotal(data.total);
            setTotalPages(data.total_pages);
            setPage(pageNum);
            setHasSearched(true);
        } catch (err) {
            setError('Search failed. Make sure the backend and Elasticsearch are running.');
        } finally {
            setLoading(false);
        }
    }, []);

    const handleSearch = (query) => {
        const newParams = { ...searchParams, q: query };
        setSearchParams(newParams);
        performSearch(newParams, 1);
    };

    const handleFilterChange = (key, value) => {
        const newParams = { ...searchParams, [key]: value };
        setSearchParams(newParams);
        performSearch(newParams, 1);
    };

    const handleClearFilters = () => {
        const clearedParams = { q: searchParams.q, author: '', subject: '', year_from: '', year_to: '', type: '' };
        setSearchParams(clearedParams);
        performSearch(clearedParams, 1);
    };

    const handlePageChange = (newPage) => {
        performSearch(searchParams, newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="search-page">
            <div className="search-hero">
                <div className="hero-content">
                    <h1 className="hero-title">
                        <span className="hero-icon">📚</span>
                        Campus Library Search
                    </h1>
                    <p className="hero-subtitle">
                        Search across books, journals, and digital resources in one place
                    </p>
                    <SearchBar onSearch={handleSearch} initialQuery={searchParams.q} />
                </div>
            </div>

            <div className="search-content">
                <aside className="filter-sidebar">
                    <FilterPanel
                        filters={filters}
                        searchParams={searchParams}
                        onFilterChange={handleFilterChange}
                        onClear={handleClearFilters}
                    />
                </aside>

                <main className="results-area">
                    {error && <div className="error-message">{error}</div>}

                    {loading && (
                        <div className="loading-container">
                            <div className="spinner"></div>
                            <p>Searching resources...</p>
                        </div>
                    )}

                    {!loading && hasSearched && (
                        <>
                            <div className="results-header">
                                <span className="results-count">
                                    {total === 0 ? 'No results found' : `${total} result${total !== 1 ? 's' : ''} found`}
                                </span>
                            </div>

                            <div className="results-list">
                                {results.map((resource) => (
                                    <ResourceCard key={resource.id} resource={resource} />
                                ))}
                            </div>

                            {totalPages > 1 && (
                                <Pagination
                                    page={page}
                                    totalPages={totalPages}
                                    onPageChange={handlePageChange}
                                />
                            )}
                        </>
                    )}

                    {!loading && !hasSearched && (
                        <div className="welcome-message">
                            <div className="welcome-icon">🔍</div>
                            <h2>Start Searching</h2>
                            <p>Enter keywords above to search across all library resources</p>
                            <div className="quick-tags">
                                {['Machine Learning', 'Algorithms', 'Database', 'AI', 'Software Engineering'].map(tag => (
                                    <button key={tag} className="quick-tag" onClick={() => handleSearch(tag)}>
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

export default SearchPage;
