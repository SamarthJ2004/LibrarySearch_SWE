function Pagination({ page, totalPages, onPageChange }) {
    const getPageNumbers = () => {
        const pages = [];
        const delta = 2;
        const start = Math.max(1, page - delta);
        const end = Math.min(totalPages, page + delta);

        if (start > 1) {
            pages.push(1);
            if (start > 2) pages.push('...');
        }

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        if (end < totalPages) {
            if (end < totalPages - 1) pages.push('...');
            pages.push(totalPages);
        }

        return pages;
    };

    return (
        <div className="pagination">
            <button
                className="page-btn page-prev"
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
            >
                ← Previous
            </button>

            <div className="page-numbers">
                {getPageNumbers().map((p, idx) =>
                    p === '...' ? (
                        <span key={`ellipsis-${idx}`} className="page-ellipsis">...</span>
                    ) : (
                        <button
                            key={p}
                            className={`page-btn page-num ${p === page ? 'active' : ''}`}
                            onClick={() => onPageChange(p)}
                        >
                            {p}
                        </button>
                    )
                )}
            </div>

            <button
                className="page-btn page-next"
                disabled={page >= totalPages}
                onClick={() => onPageChange(page + 1)}
            >
                Next →
            </button>
        </div>
    );
}

export default Pagination;
