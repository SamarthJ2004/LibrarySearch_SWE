import { useState } from 'react';

function ResourceCard({ resource }) {
    const [expanded, setExpanded] = useState(false);

    const typeBadgeClass = {
        book: 'badge-book',
        journal: 'badge-journal',
        digital: 'badge-digital',
    }[resource.resource_type] || 'badge-book';

    const typeIcon = {
        book: '📖',
        journal: '📄',
        digital: '💻',
    }[resource.resource_type] || '📖';

    const renderHighlight = (field) => {
        if (resource.highlight && resource.highlight[field]) {
            return <span dangerouslySetInnerHTML={{ __html: resource.highlight[field].join('... ') }} />;
        }
        return null;
    };

    return (
        <div className={`resource-card ${expanded ? 'expanded' : ''}`} onClick={() => setExpanded(!expanded)}>
            <div className="card-main">
                <div className="card-left">
                    <div className="card-type-icon">{typeIcon}</div>
                </div>
                <div className="card-body">
                    <div className="card-top-row">
                        <h3 className="card-title">
                            {renderHighlight('title') || resource.title}
                        </h3>
                        <span className={`type-badge ${typeBadgeClass}`}>
                            {resource.resource_type}
                        </span>
                    </div>
                    <p className="card-authors">
                        {renderHighlight('authors') || (Array.isArray(resource.authors) ? resource.authors.join(', ') : resource.authors)}
                    </p>
                    <div className="card-meta">
                        {resource.subject && (
                            <span className="meta-tag">
                                {renderHighlight('subject') || resource.subject}
                            </span>
                        )}
                        {resource.publication_year && (
                            <span className="meta-tag meta-year">{resource.publication_year}</span>
                        )}
                        {resource.publisher && (
                            <span className="meta-tag meta-publisher">{resource.publisher}</span>
                        )}
                    </div>
                </div>
            </div>

            {expanded && (
                <div className="card-details">
                    {resource.description && (
                        <p className="card-description">
                            {renderHighlight('description') || resource.description}
                        </p>
                    )}
                    <div className="card-details-meta">
                        {resource.isbn && <span className="detail-item"><strong>ISBN:</strong> {resource.isbn}</span>}
                        {resource.publisher && <span className="detail-item"><strong>Publisher:</strong> {resource.publisher}</span>}
                    </div>
                    {resource.url && (
                        <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="card-link"
                            onClick={(e) => e.stopPropagation()}
                        >
                            Visit Publisher →
                        </a>
                    )}
                </div>
            )}
        </div>
    );
}

export default ResourceCard;
