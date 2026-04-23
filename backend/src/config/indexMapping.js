const INDEX_NAME = process.env.ELASTICSEARCH_INDEX || 'library_resources';

const indexMapping = {
    settings: {
        number_of_shards: 1,
        number_of_replicas: 0,
        analysis: {
            filter: {
                synonym_filter: {
                    type: 'synonym',
                    synonyms: [
                        'ai, artificial intelligence, machine intelligence',
                        'ml, machine learning',
                        'dl, deep learning',
                        'nlp, natural language processing',
                        'db, database, databases',
                        'os, operating system, operating systems',
                        'oop, object oriented programming',
                        'dsa, data structures and algorithms',
                        'js, javascript',
                        'py, python',
                        'www, world wide web, web',
                        'iot, internet of things',
                        'cs, computer science',
                        'se, software engineering',
                        'hci, human computer interaction',
                        'cv, computer vision',
                        'ir, information retrieval',
                        'distributed systems, distributed computing',
                        'cyber security, cybersecurity, information security',
                        'math, mathematics',
                        'stats, statistics',
                        'algo, algorithm, algorithms',
                        'net, network, networking',
                        'api, application programming interface',
                    ],
                },
                edge_ngram_filter: {
                    type: 'edge_ngram',
                    min_gram: 2,
                    max_gram: 15,
                },
            },
            analyzer: {
                synonym_analyzer: {
                    tokenizer: 'standard',
                    filter: ['lowercase', 'synonym_filter'],
                },
                autocomplete_analyzer: {
                    tokenizer: 'standard',
                    filter: ['lowercase', 'edge_ngram_filter'],
                },
                autocomplete_search_analyzer: {
                    tokenizer: 'standard',
                    filter: ['lowercase'],
                },
            },
        },
    },
    mappings: {
        properties: {
            title: {
                type: 'text',
                analyzer: 'synonym_analyzer',
                fields: {
                    autocomplete: {
                        type: 'text',
                        analyzer: 'autocomplete_analyzer',
                        search_analyzer: 'autocomplete_search_analyzer',
                    },
                    keyword: {
                        type: 'keyword',
                    },
                },
            },
            authors: {
                type: 'text',
                analyzer: 'standard',
                fields: {
                    keyword: {
                        type: 'keyword',
                    },
                },
            },
            subject: {
                type: 'text',
                analyzer: 'synonym_analyzer',
                fields: {
                    keyword: {
                        type: 'keyword',
                    },
                },
            },
            publisher: {
                type: 'keyword',
            },
            publication_year: {
                type: 'integer',
            },
            resource_type: {
                type: 'keyword',
            },
            isbn: {
                type: 'keyword',
            },
            url: {
                type: 'keyword',
            },
            description: {
                type: 'text',
                analyzer: 'synonym_analyzer',
            },
        },
    },
};

module.exports = { indexMapping, INDEX_NAME };
