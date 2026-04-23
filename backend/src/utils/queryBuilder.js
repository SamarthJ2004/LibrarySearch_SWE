/**
 * Builds Elasticsearch query from search parameters.
 */
function buildSearchQuery({ q, author, subject, year_from, year_to, type, page = 1, size = 10 }) {
    const must = [];
    const filter = [];

    // Keyword search across multiple fields
    if (q && q.trim()) {
        must.push({
            bool: {
                should: [
                    {
                        multi_match: {
                            query: q.trim(),
                            fields: ['title^3', 'title.autocomplete^2', 'authors^2', 'subject^2', 'description'],
                            type: 'best_fields',
                            fuzziness: 'AUTO',
                        },
                    },
                    {
                        multi_match: {
                            query: q.trim(),
                            fields: ['title^3', 'authors^2', 'subject^2', 'description'],
                            type: 'cross_fields',
                        },
                    },
                ],
                minimum_should_match: 1,
            },
        });
    }

    // Filters
    if (author && author.trim()) {
        must.push({
            match: {
                authors: {
                    query: author.trim(),
                    fuzziness: 'AUTO',
                },
            },
        });
    }

    if (subject && subject.trim()) {
        filter.push({
            term: {
                'subject.keyword': subject.trim(),
            },
        });
    }

    if (year_from || year_to) {
        const range = {};
        if (year_from) range.gte = parseInt(year_from);
        if (year_to) range.lte = parseInt(year_to);
        filter.push({
            range: {
                publication_year: range,
            },
        });
    }

    if (type && type.trim()) {
        filter.push({
            term: {
                resource_type: type.trim().toLowerCase(),
            },
        });
    }

    const from = (parseInt(page) - 1) * parseInt(size);

    const query = {
        from,
        size: parseInt(size),
        query: {
            bool: {
                must: must.length > 0 ? must : [{ match_all: {} }],
                filter,
            },
        },
        highlight: {
            fields: {
                title: { number_of_fragments: 0 },
                description: { fragment_size: 200, number_of_fragments: 2 },
                authors: { number_of_fragments: 0 },
                subject: { number_of_fragments: 0 },
            },
            pre_tags: ['<mark>'],
            post_tags: ['</mark>'],
        },
        sort: q && q.trim() ? ['_score', { publication_year: 'desc' }] : [{ publication_year: 'desc' }],
    };

    return query;
}

module.exports = { buildSearchQuery };
