const { buildSearchQuery } = require('../../src/utils/queryBuilder');

describe('buildSearchQuery', () => {
    test('should return match_all query when no parameters provided', () => {
        const query = buildSearchQuery({});
        expect(query.query.bool.must).toEqual([{ match_all: {} }]);
        expect(query.query.bool.filter).toEqual([]);
        expect(query.from).toBe(0);
        expect(query.size).toBe(10);
    });

    test('should build keyword search query with multi_match', () => {
        const query = buildSearchQuery({ q: 'machine learning' });
        const must = query.query.bool.must;
        expect(must).toHaveLength(1);
        expect(must[0].bool.should).toHaveLength(2);
        // First should clause: best_fields multi_match
        expect(must[0].bool.should[0].multi_match.query).toBe('machine learning');
        expect(must[0].bool.should[0].multi_match.type).toBe('best_fields');
        // Second should clause: cross_fields multi_match
        expect(must[0].bool.should[1].multi_match.type).toBe('cross_fields');
    });

    test('should add author filter as match query', () => {
        const query = buildSearchQuery({ author: 'Knuth' });
        const must = query.query.bool.must;
        // When only author is provided (no keyword), author match is the only must clause
        expect(must).toHaveLength(1);
        expect(must[0].match.authors.query).toBe('Knuth');
    });

    test('should add subject filter', () => {
        const query = buildSearchQuery({ subject: 'Computer Science' });
        const filter = query.query.bool.filter;
        expect(filter).toHaveLength(1);
        expect(filter[0].term['subject.keyword']).toBe('Computer Science');
    });

    test('should add year range filter', () => {
        const query = buildSearchQuery({ year_from: '2015', year_to: '2022' });
        const filter = query.query.bool.filter;
        expect(filter).toHaveLength(1);
        expect(filter[0].range.publication_year.gte).toBe(2015);
        expect(filter[0].range.publication_year.lte).toBe(2022);
    });

    test('should add resource type filter', () => {
        const query = buildSearchQuery({ type: 'journal' });
        const filter = query.query.bool.filter;
        expect(filter).toHaveLength(1);
        expect(filter[0].term.resource_type).toBe('journal');
    });

    test('should handle pagination correctly', () => {
        const query = buildSearchQuery({ page: 3, size: 20 });
        expect(query.from).toBe(40); // (3-1) * 20
        expect(query.size).toBe(20);
    });

    test('should combine keyword search with multiple filters', () => {
        const query = buildSearchQuery({
            q: 'algorithms',
            author: 'Cormen',
            subject: 'Computer Science',
            year_from: '2000',
            type: 'book',
        });

        const must = query.query.bool.must;
        const filter = query.query.bool.filter;

        // Keyword search + author
        expect(must).toHaveLength(2);
        // subject + year + type
        expect(filter).toHaveLength(3);
    });

    test('should include highlight configuration', () => {
        const query = buildSearchQuery({ q: 'test' });
        expect(query.highlight).toBeDefined();
        expect(query.highlight.fields.title).toBeDefined();
        expect(query.highlight.fields.description).toBeDefined();
        expect(query.highlight.pre_tags).toEqual(['<mark>']);
        expect(query.highlight.post_tags).toEqual(['</mark>']);
    });

    test('should sort by score when keyword is present, by year otherwise', () => {
        const withKeyword = buildSearchQuery({ q: 'test' });
        expect(withKeyword.sort[0]).toBe('_score');

        const withoutKeyword = buildSearchQuery({});
        expect(withoutKeyword.sort[0]).toEqual({ publication_year: 'desc' });
    });

    test('should trim whitespace from query parameters', () => {
        const query = buildSearchQuery({ q: '  algorithms  ', author: '  Knuth  ' });
        const must = query.query.bool.must;
        expect(must[0].bool.should[0].multi_match.query).toBe('algorithms');
        expect(must[1].match.authors.query).toBe('Knuth');
    });
});
