const { Client } = require('@elastic/elasticsearch');
require('dotenv').config();

const esClient = new Client({
  node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
});

const INDEX_NAME = process.env.ELASTICSEARCH_INDEX || 'library_resources';

module.exports = { esClient, INDEX_NAME };
