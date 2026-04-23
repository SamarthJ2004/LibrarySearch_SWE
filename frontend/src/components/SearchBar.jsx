import { useState, useRef, useEffect } from 'react';

function SearchBar({ onSearch, initialQuery = '' }) {
    const [query, setQuery] = useState(initialQuery);
    const inputRef = useRef(null);
    const debounceRef = useRef(null);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    const handleChange = (e) => {
        const value = e.target.value;
        setQuery(value);

        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            if (value.trim().length >= 2 || value.trim().length === 0) {
                onSearch(value);
            }
        }, 400);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (debounceRef.current) clearTimeout(debounceRef.current);
        onSearch(query);
    };

    const handleClear = () => {
        setQuery('');
        onSearch('');
        inputRef.current.focus();
    };

    return (
        <form className="search-bar" onSubmit={handleSubmit}>
            <div className="search-input-wrapper">
                <svg className="search-icon" viewBox="0 0 24 24" width="20" height="20">
                    <circle cx="11" cy="11" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
                    <path d="M21 21l-4.35-4.35" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <input
                    ref={inputRef}
                    type="text"
                    className="search-input"
                    placeholder="Search books, journals, digital resources..."
                    value={query}
                    onChange={handleChange}
                    id="search-input"
                />
                {query && (
                    <button type="button" className="search-clear" onClick={handleClear} aria-label="Clear search">
                        ×
                    </button>
                )}
            </div>
            <button type="submit" className="search-button" id="search-button">
                Search
            </button>
        </form>
    );
}

export default SearchBar;
