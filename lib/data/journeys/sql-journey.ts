import type { CreateJourney } from '@/lib/db/schemas/journey';

/**
 * SQL journey
 * Comprehensive learning path for SQL and database fundamentals
 *
 * Layout: Vertical flow with horizontal branching
 * Node positions are on a grid: x in steps of 200, y in steps of 120
 */
export const sqlJourney: CreateJourney = {
  slug: 'sql',
  title: 'SQL Mastery',
  description:
    'Master SQL from fundamentals to advanced topics. Learn database concepts, queries, performance optimization, and enterprise patterns.',
  category: 'sql',
  version: '2025.1',
  estimatedHours: 120,
  difficulty: 4,
  prerequisites: [],
  isActive: true,
  nodes: [
    // === ROW 0: LEARN THE BASICS ===
    {
      id: 'learn-basics',
      title: 'Learn the Basics',
      description:
        'Understand what relational databases are and why SQL is the universal language for data.',
      type: 'milestone',
      position: { x: 400, y: 0 },
      learningObjectives: [
        { title: 'What are Relational Databases?', lessonId: 'what-is-rdbms' },
        { title: 'RDBMS Benefits and Limitations', lessonId: 'rdbms-benefits' },
        { title: 'SQL vs NoSQL Databases', lessonId: 'sql-vs-nosql' },
      ],
      resources: [
        {
          title: 'SQL journey - journey.sh',
          url: 'https://journey.sh/sql',
          type: 'documentation',
          description: 'Comprehensive SQL learning journey',
        },
        {
          title: 'What is SQL? - W3Schools',
          url: 'https://www.w3schools.com/sql/sql_intro.asp',
          type: 'documentation',
          description: 'Introduction to SQL basics',
        },
      ],
      estimatedMinutes: 60,
      difficulty: 1,
      skillCluster: 'backend',
      tags: ['sql', 'rdbms', 'basics', 'introduction'],
    },

    // === ROW 1: BASIC SQL SYNTAX ===
    {
      id: 'basic-sql-syntax',
      title: 'Basic SQL Syntax',
      description:
        'Learn the fundamental building blocks of SQL: keywords, data types, and operators.',
      type: 'milestone',
      position: { x: 400, y: 120 },
      learningObjectives: [
        { title: 'SQL Keywords', lessonId: 'sql-keywords' },
        { title: 'Data Types', lessonId: 'sql-data-types' },
        { title: 'Operators', lessonId: 'sql-operators' },
        { title: 'Statements (SELECT, INSERT, DELETE, UPDATE)', lessonId: 'sql-statements' },
      ],
      resources: [
        {
          title: 'SQL Syntax Reference',
          url: 'https://www.w3schools.com/sql/sql_syntax.asp',
          type: 'documentation',
          description: 'SQL syntax fundamentals',
        },
      ],
      estimatedMinutes: 90,
      difficulty: 2,
      skillCluster: 'backend',
      tags: ['sql', 'syntax', 'keywords', 'data-types'],
    },

    // === ROW 2: DML AND DDL SPLIT ===
    {
      id: 'dml',
      title: 'Data Manipulation Language (DML)',
      description:
        'Master CRUD operations - the core of everyday SQL work.',
      type: 'milestone',
      position: { x: 200, y: 240 },
      learningObjectives: [
        { title: 'SELECT - Querying Data', lessonId: 'select-querying' },
        { title: 'FROM, WHERE, ORDER BY', lessonId: 'from-where-orderby' },
        { title: 'GROUP BY and HAVING', lessonId: 'groupby-having' },
        { title: 'INSERT - Adding Data', lessonId: 'insert-data' },
        { title: 'UPDATE - Modifying Data', lessonId: 'update-data' },
        { title: 'DELETE - Removing Data', lessonId: 'delete-data' },
      ],
      resources: [
        {
          title: 'SQL SELECT Statement',
          url: 'https://www.w3schools.com/sql/sql_select.asp',
          type: 'documentation',
          description: 'Learn the SELECT statement',
        },
      ],
      estimatedMinutes: 180,
      difficulty: 3,
      skillCluster: 'backend',
      tags: ['sql', 'dml', 'select', 'insert', 'update', 'delete'],
    },
    {
      id: 'ddl',
      title: 'Data Definition Language (DDL)',
      description:
        'Learn to create and modify database structures - tables, schemas, and more.',
      type: 'topic',
      position: { x: 600, y: 240 },
      learningObjectives: [
        { title: 'CREATE TABLE', lessonId: 'create-table' },
        { title: 'ALTER TABLE', lessonId: 'alter-table' },
        { title: 'DROP TABLE', lessonId: 'drop-table' },
        { title: 'TRUNCATE TABLE', lessonId: 'truncate-table' },
      ],
      resources: [
        {
          title: 'SQL CREATE TABLE',
          url: 'https://www.w3schools.com/sql/sql_create_table.asp',
          type: 'documentation',
          description: 'Creating tables in SQL',
        },
      ],
      estimatedMinutes: 120,
      difficulty: 3,
      skillCluster: 'backend',
      tags: ['sql', 'ddl', 'create', 'alter', 'drop'],
    },

    // === ROW 3: DATA CONSTRAINTS ===
    {
      id: 'data-constraints',
      title: 'Data Constraints',
      description:
        'Enforce data integrity with constraints - the rules that keep your data clean.',
      type: 'topic',
      position: { x: 600, y: 360 },
      learningObjectives: [
        { title: 'Primary Key', lessonId: 'primary-key' },
        { title: 'Foreign Key', lessonId: 'foreign-key' },
        { title: 'UNIQUE Constraint', lessonId: 'unique-constraint' },
        { title: 'NOT NULL Constraint', lessonId: 'not-null-constraint' },
        { title: 'CHECK Constraint', lessonId: 'check-constraint' },
      ],
      resources: [
        {
          title: 'SQL Constraints',
          url: 'https://www.w3schools.com/sql/sql_constraints.asp',
          type: 'documentation',
          description: 'Understanding SQL constraints',
        },
      ],
      estimatedMinutes: 90,
      difficulty: 3,
      skillCluster: 'backend',
      tags: ['sql', 'constraints', 'primary-key', 'foreign-key'],
    },

    // === ROW 3: AGGREGATE QUERIES ===
    {
      id: 'aggregate-queries',
      title: 'Aggregate Queries',
      description:
        'Summarize and analyze data with aggregate functions.',
      type: 'topic',
      position: { x: 200, y: 360 },
      learningObjectives: [
        { title: 'SUM Function', lessonId: 'sum-function' },
        { title: 'COUNT Function', lessonId: 'count-function' },
        { title: 'AVG, MIN, MAX Functions', lessonId: 'avg-min-max' },
        { title: 'GROUP BY Clause', lessonId: 'groupby-clause' },
        { title: 'HAVING Clause', lessonId: 'having-clause' },
      ],
      resources: [
        {
          title: 'SQL Aggregate Functions',
          url: 'https://www.w3schools.com/sql/sql_count_avg_sum.asp',
          type: 'documentation',
          description: 'Learn aggregate functions',
        },
      ],
      estimatedMinutes: 90,
      difficulty: 3,
      skillCluster: 'backend',
      tags: ['sql', 'aggregate', 'sum', 'count', 'avg'],
    },

    // === ROW 4: SUBQUERIES AND JOINS ===
    {
      id: 'subqueries',
      title: 'Subqueries',
      description:
        'Master nested queries - queries within queries for powerful data retrieval.',
      type: 'topic',
      position: { x: 200, y: 480 },
      learningObjectives: [
        { title: 'Nested Subqueries', lessonId: 'nested-subqueries' },
        { title: 'Correlated Subqueries', lessonId: 'correlated-subqueries' },
        { title: 'Scalar, Column, Row, Table Types', lessonId: 'subquery-types' },
      ],
      resources: [
        {
          title: 'SQL Subqueries',
          url: 'https://www.w3schools.com/sql/sql_subqueries.asp',
          type: 'documentation',
          description: 'Working with subqueries',
        },
      ],
      estimatedMinutes: 120,
      difficulty: 4,
      skillCluster: 'backend',
      tags: ['sql', 'subqueries', 'nested', 'correlated'],
    },
    {
      id: 'join-queries',
      title: 'JOIN Queries',
      description:
        'Combine data from multiple tables - the heart of relational databases.',
      type: 'milestone',
      position: { x: 600, y: 480 },
      learningObjectives: [
        { title: 'INNER JOIN', lessonId: 'inner-join' },
        { title: 'LEFT JOIN', lessonId: 'left-join' },
        { title: 'RIGHT JOIN', lessonId: 'right-join' },
        { title: 'FULL OUTER JOIN', lessonId: 'full-outer-join' },
        { title: 'SELF JOIN', lessonId: 'self-join' },
        { title: 'CROSS JOIN', lessonId: 'cross-join' },
      ],
      resources: [
        {
          title: 'SQL Joins',
          url: 'https://www.w3schools.com/sql/sql_join.asp',
          type: 'documentation',
          description: 'Understanding SQL joins',
        },
        {
          title: 'Visual SQL Joins',
          url: 'https://blog.codinghorror.com/a-visual-explanation-of-sql-joins/',
          type: 'article',
          description: 'Visual guide to SQL joins',
        },
      ],
      estimatedMinutes: 180,
      difficulty: 4,
      skillCluster: 'backend',
      tags: ['sql', 'joins', 'inner', 'left', 'right', 'outer'],
    },

    // === ROW 5: ADVANCED FUNCTIONS ===
    {
      id: 'advanced-functions',
      title: 'Advanced Functions',
      description:
        'Powerful built-in functions for numeric, conditional, and data operations.',
      type: 'topic',
      position: { x: 200, y: 600 },
      learningObjectives: [
        { title: 'FLOOR, ABS, MOD Functions', lessonId: 'numeric-functions-1' },
        { title: 'ROUND, CEILING Functions', lessonId: 'numeric-functions-2' },
        { title: 'CASE Expression', lessonId: 'case-expression' },
        { title: 'NULLIF and COALESCE', lessonId: 'nullif-coalesce' },
      ],
      resources: [
        {
          title: 'SQL Numeric Functions',
          url: 'https://www.w3schools.com/sql/sql_ref_mysql.asp',
          type: 'documentation',
          description: 'SQL function reference',
        },
      ],
      estimatedMinutes: 90,
      difficulty: 4,
      skillCluster: 'backend',
      tags: ['sql', 'functions', 'numeric', 'case', 'coalesce'],
    },
    {
      id: 'string-functions',
      title: 'String Functions',
      description:
        'Manipulate text data with string functions.',
      type: 'topic',
      position: { x: 400, y: 600 },
      learningObjectives: [
        { title: 'CONCAT and LENGTH', lessonId: 'concat-length' },
        { title: 'SUBSTRING and REPLACE', lessonId: 'substring-replace' },
        { title: 'UPPER and LOWER', lessonId: 'upper-lower' },
      ],
      resources: [
        {
          title: 'SQL String Functions',
          url: 'https://www.w3schools.com/sql/sql_ref_mysql.asp',
          type: 'documentation',
          description: 'SQL string function reference',
        },
      ],
      estimatedMinutes: 60,
      difficulty: 3,
      skillCluster: 'backend',
      tags: ['sql', 'functions', 'string', 'text'],
    },
    {
      id: 'date-time',
      title: 'Date and Time',
      description:
        'Work with dates and times - essential for any real-world application.',
      type: 'topic',
      position: { x: 600, y: 600 },
      learningObjectives: [
        { title: 'DATE and TIME Types', lessonId: 'date-time-types' },
        { title: 'TIMESTAMP', lessonId: 'timestamp' },
        { title: 'DATEPART and DATEADD', lessonId: 'datepart-dateadd' },
      ],
      resources: [
        {
          title: 'SQL Date Functions',
          url: 'https://www.w3schools.com/sql/sql_dates.asp',
          type: 'documentation',
          description: 'Working with dates in SQL',
        },
      ],
      estimatedMinutes: 60,
      difficulty: 3,
      skillCluster: 'backend',
      tags: ['sql', 'date', 'time', 'datetime'],
    },

    // === ROW 6: VIEWS AND INDEXES ===
    {
      id: 'views',
      title: 'Views',
      description:
        'Create virtual tables for simplified data access and security.',
      type: 'topic',
      position: { x: 200, y: 720 },
      learningObjectives: [
        { title: 'Creating Views', lessonId: 'creating-views' },
        { title: 'Modifying Views', lessonId: 'modifying-views' },
        { title: 'Dropping Views', lessonId: 'dropping-views' },
      ],
      resources: [
        {
          title: 'SQL Views',
          url: 'https://www.w3schools.com/sql/sql_view.asp',
          type: 'documentation',
          description: 'Understanding SQL views',
        },
      ],
      estimatedMinutes: 60,
      difficulty: 4,
      skillCluster: 'backend',
      tags: ['sql', 'views', 'virtual-tables'],
    },
    {
      id: 'indexes',
      title: 'Indexes',
      description:
        'Speed up your queries dramatically with proper indexing strategies.',
      type: 'topic',
      position: { x: 600, y: 720 },
      learningObjectives: [
        { title: 'Managing Indexes', lessonId: 'managing-indexes' },
        { title: 'Query Optimization with Indexes', lessonId: 'index-optimization' },
      ],
      resources: [
        {
          title: 'SQL Indexes',
          url: 'https://www.w3schools.com/sql/sql_create_index.asp',
          type: 'documentation',
          description: 'Creating and using indexes',
        },
      ],
      estimatedMinutes: 90,
      difficulty: 5,
      skillCluster: 'backend',
      tags: ['sql', 'indexes', 'performance', 'optimization'],
    },

    // === ROW 7: TRANSACTIONS ===
    {
      id: 'transactions',
      title: 'Transactions',
      description:
        'Ensure data integrity with ACID-compliant transactions.',
      type: 'milestone',
      position: { x: 400, y: 840 },
      learningObjectives: [
        { title: 'ACID Properties', lessonId: 'acid-properties' },
        { title: 'BEGIN Transaction', lessonId: 'begin-transaction' },
        { title: 'COMMIT', lessonId: 'commit-transaction' },
        { title: 'ROLLBACK', lessonId: 'rollback-transaction' },
        { title: 'SAVEPOINT', lessonId: 'savepoint' },
        { title: 'Transaction Isolation Levels', lessonId: 'isolation-levels' },
      ],
      resources: [
        {
          title: 'SQL Transactions',
          url: 'https://www.geeksforgeeks.org/sql-transactions/',
          type: 'documentation',
          description: 'Understanding SQL transactions',
        },
      ],
      estimatedMinutes: 120,
      difficulty: 5,
      skillCluster: 'backend',
      tags: ['sql', 'transactions', 'acid', 'commit', 'rollback'],
    },

    // === ROW 8: SECURITY AND STORED PROCEDURES ===
    {
      id: 'data-integrity-security',
      title: 'Data Integrity & Security',
      description:
        'Protect your data with proper access control and security practices.',
      type: 'topic',
      position: { x: 200, y: 960 },
      learningObjectives: [
        { title: 'GRANT and REVOKE', lessonId: 'grant-revoke' },
        { title: 'DB Security Best Practices', lessonId: 'security-best-practices' },
        { title: 'Data Integrity Constraints', lessonId: 'integrity-constraints' },
      ],
      resources: [
        {
          title: 'SQL GRANT and REVOKE',
          url: 'https://www.w3schools.com/sql/sql_grant_revoke.asp',
          type: 'documentation',
          description: 'Managing permissions in SQL',
        },
      ],
      estimatedMinutes: 90,
      difficulty: 5,
      skillCluster: 'backend',
      tags: ['sql', 'security', 'grant', 'revoke', 'permissions'],
    },
    {
      id: 'stored-procedures',
      title: 'Stored Procedures & Functions',
      description:
        'Create reusable code blocks that run on the database server.',
      type: 'optional',
      position: { x: 600, y: 960 },
      learningObjectives: [
        { title: 'Creating Stored Procedures', lessonId: 'creating-stored-procedures' },
        { title: 'User-Defined Functions', lessonId: 'user-defined-functions' },
        { title: 'Parameters and Return Values', lessonId: 'procedure-parameters' },
      ],
      resources: [
        {
          title: 'SQL Stored Procedures',
          url: 'https://www.w3schools.com/sql/sql_stored_procedures.asp',
          type: 'documentation',
          description: 'Working with stored procedures',
        },
      ],
      estimatedMinutes: 120,
      difficulty: 5,
      skillCluster: 'backend',
      tags: ['sql', 'stored-procedures', 'functions'],
    },

    // === ROW 9: PERFORMANCE OPTIMIZATION ===
    {
      id: 'performance-optimization',
      title: 'Performance Optimization',
      description:
        'Make your queries blazing fast with optimization techniques.',
      type: 'topic',
      position: { x: 400, y: 1080 },
      learningObjectives: [
        { title: 'Query Analysis Techniques', lessonId: 'query-analysis' },
        { title: 'Using Indexes Effectively', lessonId: 'using-indexes' },
        { title: 'Optimizing JOINs', lessonId: 'optimizing-joins' },
        { title: 'Reducing Subqueries', lessonId: 'reducing-subqueries' },
        { title: 'Selective Projection', lessonId: 'selective-projection' },
        { title: 'Query Optimization Techniques', lessonId: 'query-optimization-techniques' },
      ],
      resources: [
        {
          title: 'SQL Performance Tuning',
          url: 'https://use-the-index-luke.com/',
          type: 'documentation',
          description: 'Comprehensive guide to SQL performance',
        },
      ],
      estimatedMinutes: 180,
      difficulty: 6,
      skillCluster: 'backend',
      tags: ['sql', 'performance', 'optimization', 'tuning'],
    },

    // === ROW 10: ADVANCED SQL ===
    {
      id: 'advanced-sql',
      title: 'Advanced SQL',
      description:
        'Master advanced SQL concepts for complex data scenarios.',
      type: 'optional',
      position: { x: 400, y: 1200 },
      learningObjectives: [
        { title: 'Window Functions', lessonId: 'window-functions-intro' },
        { title: 'ROW_NUMBER and RANK', lessonId: 'row-number-rank' },
        { title: 'LAG and LEAD', lessonId: 'lag-lead' },
        { title: 'Common Table Expressions (CTEs)', lessonId: 'ctes' },
        { title: 'Recursive Queries', lessonId: 'recursive-queries' },
        { title: 'Pivot and Unpivot Operations', lessonId: 'pivot-unpivot' },
        { title: 'Dynamic SQL', lessonId: 'dynamic-sql' },
      ],
      resources: [
        {
          title: 'SQL Window Functions',
          url: 'https://mode.com/sql-tutorial/sql-window-functions/',
          type: 'documentation',
          description: 'Guide to window functions',
        },
        {
          title: 'Common Table Expressions',
          url: 'https://www.sqlservertutorial.net/sql-server-basics/sql-server-cte/',
          type: 'documentation',
          description: 'Working with CTEs',
        },
      ],
      estimatedMinutes: 240,
      difficulty: 7,
      skillCluster: 'backend',
      tags: ['sql', 'advanced', 'window-functions', 'cte', 'recursive'],
    },
  ],

  edges: [
    // Main vertical flow
    { id: 'e1', source: 'learn-basics', target: 'basic-sql-syntax', type: 'sequential' },

    // Split to DML and DDL
    { id: 'e2', source: 'basic-sql-syntax', target: 'dml', type: 'sequential' },
    { id: 'e3', source: 'basic-sql-syntax', target: 'ddl', type: 'sequential' },

    // DML to aggregate queries
    { id: 'e4', source: 'dml', target: 'aggregate-queries', type: 'sequential' },

    // DDL to data constraints
    { id: 'e5', source: 'ddl', target: 'data-constraints', type: 'sequential' },

    // Aggregate to subqueries
    { id: 'e6', source: 'aggregate-queries', target: 'subqueries', type: 'sequential' },

    // Constraints to joins
    { id: 'e7', source: 'data-constraints', target: 'join-queries', type: 'sequential' },

    // Subqueries to advanced functions
    { id: 'e8', source: 'subqueries', target: 'advanced-functions', type: 'recommended' },
    { id: 'e9', source: 'subqueries', target: 'join-queries', type: 'recommended' },

    // Functions row
    { id: 'e10', source: 'advanced-functions', target: 'string-functions', type: 'recommended' },
    { id: 'e11', source: 'string-functions', target: 'date-time', type: 'recommended' },
    { id: 'e12', source: 'join-queries', target: 'date-time', type: 'recommended' },

    // Views and indexes
    { id: 'e13', source: 'advanced-functions', target: 'views', type: 'recommended' },
    { id: 'e14', source: 'date-time', target: 'indexes', type: 'recommended' },

    // Converge to transactions
    { id: 'e15', source: 'views', target: 'transactions', type: 'recommended' },
    { id: 'e16', source: 'indexes', target: 'transactions', type: 'sequential' },

    // Security and stored procedures
    { id: 'e17', source: 'transactions', target: 'data-integrity-security', type: 'sequential' },
    { id: 'e18', source: 'transactions', target: 'stored-procedures', type: 'optional' },

    // Performance optimization
    { id: 'e19', source: 'data-integrity-security', target: 'performance-optimization', type: 'recommended' },
    { id: 'e20', source: 'stored-procedures', target: 'performance-optimization', type: 'optional' },

    // Advanced SQL
    { id: 'e21', source: 'performance-optimization', target: 'advanced-sql', type: 'optional' },
  ],
};

