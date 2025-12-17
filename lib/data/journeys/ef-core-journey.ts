import type { CreateJourney } from '@/lib/db/schemas/journey';

/**
 * Entity Framework Core Sub-journey
 * Comprehensive learning path for mastering Entity Framework Core
 *
 * Parent journey: .NET Developer (dotnet)
 * Parent Node: entity-framework-core
 *
 * Layout: Vertical flow with horizontal branching for parallel topics
 * Node positions are on a grid: x in steps of 200, y in steps of 120
 */
export const efCoreJourney: CreateJourney = {
  slug: 'ef-core',
  title: 'Entity Framework Core',
  description:
    'Master Entity Framework Core - Microsoft\'s modern object-relational mapper for .NET. Learn from basic concepts to advanced patterns, performance optimization, and testing strategies.',
  category: 'dotnet',
  version: '2025.1',
  parentJourneySlug: 'dotnet',
  parentNodeId: 'entity-framework-core',
  showInListing: true,
  estimatedHours: 38,
  difficulty: 6,
  prerequisites: ['csharp-basics', 'databases'],
  isActive: true,
  nodes: [
    // === ROW 0: EF CORE INTRODUCTION ===
    {
      id: 'ef-core-introduction',
      title: 'EF Core Introduction',
      description:
        'Learn what Entity Framework Core is, understand ORM concepts, and master the fundamentals of working with data in EF Core.',
      type: 'milestone',
      position: { x: 400, y: 0 },
      learningObjectives: [
        { title: 'What is EF Core and ORM Concepts', lessonId: 'ef-core-overview' },
        { title: 'DbSet Fundamentals', lessonId: 'dbset-fundamentals' },
        { title: 'Change Tracking', lessonId: 'change-tracking' },
        { title: 'Entity Relationships', lessonId: 'ef-relationships' },
        { title: 'Querying with LINQ', lessonId: 'querying-with-linq' },
        { title: 'Code-First Migrations', lessonId: 'code-first-migrations' },
      ],
      resources: [
        {
          title: 'Entity Framework Core Documentation',
          url: 'https://learn.microsoft.com/en-us/ef/core/',
          type: 'documentation',
          description: 'Official Microsoft EF Core documentation - comprehensive reference for all EF Core features',
        },
        {
          title: 'Getting Started with EF Core',
          url: 'https://learn.microsoft.com/en-us/ef/core/get-started/overview/first-app',
          type: 'documentation',
          description: 'Step-by-step tutorial to create your first EF Core application',
        },
        {
          title: 'EF Core Tutorial for Beginners',
          url: 'https://learn.microsoft.com/en-us/training/modules/persist-data-ef-core/',
          type: 'course',
          description: 'Microsoft Learn module covering EF Core fundamentals with hands-on exercises',
        },
        {
          title: 'EF Core vs EF6 Feature Comparison',
          url: 'https://learn.microsoft.com/en-us/ef/efcore-and-ef6/',
          type: 'article',
          description: 'Detailed comparison between Entity Framework Core and Entity Framework 6',
        },
      ],
      estimatedMinutes: 90,
      difficulty: 3,
      skillCluster: 'backend',
      tags: ['ef-core', 'orm', 'introduction', 'setup'],
    },

    // === ROW 1: DBCONTEXT AND DBSET ===
    {
      id: 'dbcontext-dbset',
      title: 'DbContext and DbSet',
      description:
        'Master the DbContext class - the primary interface for interacting with the database in EF Core.',
      type: 'milestone',
      position: { x: 400, y: 120 },
      learningObjectives: [
        { title: 'DbContext Lifecycle', lessonId: 'dbcontext-dbset' },
        { title: 'DbSet Fundamentals', lessonId: 'dbset-fundamentals' },
        { title: 'Connection Strings and Configuration', lessonId: 'ef-connection-config' },
        { title: 'Database Providers Overview', lessonId: 'database-providers-overview' },
      ],
      resources: [
        {
          title: 'DbContext Lifetime, Configuration, and Initialization',
          url: 'https://learn.microsoft.com/en-us/ef/core/dbcontext-configuration/',
          type: 'documentation',
          description: 'Official guide on DbContext lifecycle management and configuration options',
        },
        {
          title: 'Creating and Configuring a Model',
          url: 'https://learn.microsoft.com/en-us/ef/core/modeling/',
          type: 'documentation',
          description: 'Comprehensive guide to model configuration in EF Core',
        },
        {
          title: 'Connection Strings',
          url: 'https://learn.microsoft.com/en-us/ef/core/miscellaneous/connection-strings',
          type: 'documentation',
          description: 'Guide to configuring connection strings for different database providers',
        },
        {
          title: 'DbContext Pooling',
          url: 'https://learn.microsoft.com/en-us/ef/core/performance/advanced-performance-topics#dbcontext-pooling',
          type: 'article',
          description: 'Learn about DbContext pooling for improved performance in high-throughput scenarios',
        },
      ],
      estimatedMinutes: 120,
      difficulty: 4,
      skillCluster: 'backend',
      tags: ['dbcontext', 'dbset', 'configuration', 'ef-core'],
    },

    // === ROW 2: ENTITY CONFIGURATION ===
    {
      id: 'entity-configuration',
      title: 'Entity Configuration',
      description:
        'Learn how to configure entity classes using conventions, data annotations, and Fluent API.',
      type: 'milestone',
      position: { x: 400, y: 240 },
      learningObjectives: [
        { title: 'Entity Classes and Conventions', lessonId: 'entity-conventions' },
        { title: 'Data Annotations', lessonId: 'data-annotations' },
        { title: 'Fluent API Basics', lessonId: 'fluent-api-basics' },
        { title: 'Primary Keys and Indexes', lessonId: 'keys-and-indexes' },
      ],
      resources: [
        {
          title: 'Entity Types',
          url: 'https://learn.microsoft.com/en-us/ef/core/modeling/entity-types',
          type: 'documentation',
          description: 'Comprehensive guide to configuring entity types in EF Core',
        },
        {
          title: 'Keys (Primary)',
          url: 'https://learn.microsoft.com/en-us/ef/core/modeling/keys',
          type: 'documentation',
          description: 'Configuring primary keys and composite keys in EF Core',
        },
        {
          title: 'Indexes',
          url: 'https://learn.microsoft.com/en-us/ef/core/modeling/indexes',
          type: 'documentation',
          description: 'Creating and configuring database indexes for query performance',
        },
        {
          title: 'Data Annotations vs Fluent API',
          url: 'https://learn.microsoft.com/en-us/ef/core/modeling/#use-fluent-api-to-configure-a-model',
          type: 'article',
          description: 'Understanding when to use Data Annotations versus Fluent API for configuration',
        },
      ],
      estimatedMinutes: 150,
      difficulty: 4,
      skillCluster: 'backend',
      tags: ['entity', 'configuration', 'fluent-api', 'data-annotations'],
    },

    // === ROW 3: CRUD OPERATIONS ===
    {
      id: 'crud-operations',
      title: 'CRUD Operations',
      description:
        'Master Create, Read, Update, and Delete operations with EF Core and understand change tracking.',
      type: 'milestone',
      position: { x: 400, y: 360 },
      learningObjectives: [
        { title: 'Creating Entities', lessonId: 'ef-create-entities' },
        { title: 'Reading and Querying', lessonId: 'ef-read-entities' },
        { title: 'Updating Entities', lessonId: 'ef-update-entities' },
        { title: 'Deleting Entities', lessonId: 'ef-delete-entities' },
        { title: 'SaveChanges and Change Tracking', lessonId: 'change-tracking' },
      ],
      resources: [
        {
          title: 'Saving Data',
          url: 'https://learn.microsoft.com/en-us/ef/core/saving/',
          type: 'documentation',
          description: 'Official guide on saving data with EF Core including basic save operations',
        },
        {
          title: 'Change Tracking',
          url: 'https://learn.microsoft.com/en-us/ef/core/change-tracking/',
          type: 'documentation',
          description: 'Deep dive into how EF Core tracks entity changes for database updates',
        },
        {
          title: 'Basic Save Operations',
          url: 'https://learn.microsoft.com/en-us/ef/core/saving/basic',
          type: 'documentation',
          description: 'Learn Add, Update, and Delete operations with SaveChanges',
        },
        {
          title: 'Disconnected Entities',
          url: 'https://learn.microsoft.com/en-us/ef/core/saving/disconnected-entities',
          type: 'article',
          description: 'Working with entities that were not tracked by the current DbContext instance',
        },
      ],
      estimatedMinutes: 180,
      difficulty: 4,
      skillCluster: 'backend',
      tags: ['crud', 'create', 'read', 'update', 'delete', 'change-tracking'],
    },

    // === ROW 4: MIGRATIONS ===
    {
      id: 'migrations',
      title: 'Migrations',
      description:
        'Learn Code-First migrations to evolve your database schema alongside your application code.',
      type: 'milestone',
      position: { x: 400, y: 480 },
      learningObjectives: [
        { title: 'Code-First Migrations', lessonId: 'code-first-migrations' },
        { title: 'Creating and Applying Migrations', lessonId: 'creating-migrations' },
        { title: 'Migration Best Practices', lessonId: 'migration-best-practices' },
        { title: 'Handling Migration Conflicts', lessonId: 'migration-conflicts' },
        { title: 'Reverting Migrations', lessonId: 'reverting-migrations' },
        { title: 'Seeding Data', lessonId: 'data-seeding' },
      ],
      resources: [
        {
          title: 'Migrations Overview',
          url: 'https://learn.microsoft.com/en-us/ef/core/managing-schemas/migrations/',
          type: 'documentation',
          description: 'Official migrations documentation covering the complete migration workflow',
        },
        {
          title: 'Applying Migrations',
          url: 'https://learn.microsoft.com/en-us/ef/core/managing-schemas/migrations/applying',
          type: 'documentation',
          description: 'Guide on applying migrations at runtime and deployment scenarios',
        },
        {
          title: 'Managing Migrations',
          url: 'https://learn.microsoft.com/en-us/ef/core/managing-schemas/migrations/managing',
          type: 'documentation',
          description: 'Best practices for managing migrations in team environments',
        },
        {
          title: 'Data Seeding',
          url: 'https://learn.microsoft.com/en-us/ef/core/modeling/data-seeding',
          type: 'article',
          description: 'Populate your database with initial data using migrations',
        },
      ],
      estimatedMinutes: 150,
      difficulty: 5,
      skillCluster: 'backend',
      tags: ['migrations', 'code-first', 'schema', 'database'],
    },

    // === ROW 5: QUERYING WITH LINQ ===
    {
      id: 'querying-linq',
      title: 'Querying with LINQ',
      description:
        'Master LINQ queries with EF Core for efficient data retrieval and manipulation.',
      type: 'milestone',
      position: { x: 400, y: 600 },
      learningObjectives: [
        { title: 'Basic LINQ Queries', lessonId: 'querying-with-linq' },
        { title: 'Filtering and Sorting', lessonId: 'linq-filtering-sorting' },
        { title: 'Projections and Transformations', lessonId: 'linq-projections' },
        { title: 'Joins and Grouping', lessonId: 'linq-joins-grouping' },
        { title: 'Aggregations', lessonId: 'linq-aggregations' },
        { title: 'Query Performance Considerations', lessonId: 'query-performance-basics' },
      ],
      resources: [
        {
          title: 'Querying Data',
          url: 'https://learn.microsoft.com/en-us/ef/core/querying/',
          type: 'documentation',
          description: 'Official querying documentation covering LINQ fundamentals with EF Core',
        },
        {
          title: 'Complex Query Operators',
          url: 'https://learn.microsoft.com/en-us/ef/core/querying/complex-query-operators',
          type: 'documentation',
          description: 'Advanced query operators including joins, grouping, and subqueries',
        },
        {
          title: 'Client vs Server Evaluation',
          url: 'https://learn.microsoft.com/en-us/ef/core/querying/client-eval',
          type: 'article',
          description: 'Understanding when queries execute on the server vs client side',
        },
        {
          title: 'Raw SQL Queries',
          url: 'https://learn.microsoft.com/en-us/ef/core/querying/raw-sql',
          type: 'documentation',
          description: 'Execute raw SQL queries when LINQ is not sufficient',
        },
      ],
      estimatedMinutes: 180,
      difficulty: 5,
      skillCluster: 'backend',
      tags: ['linq', 'querying', 'filtering', 'joins'],
    },

    // === ROW 6: ENTITY RELATIONSHIPS ===
    {
      id: 'entity-relationships',
      title: 'Entity Relationships',
      description:
        'Learn to model and configure relationships between entities in EF Core.',
      type: 'milestone',
      position: { x: 400, y: 720 },
      learningObjectives: [
        { title: 'One-to-One Relationships', lessonId: 'ef-relationships' },
        { title: 'One-to-Many Relationships', lessonId: 'one-to-many' },
        { title: 'Many-to-Many Relationships', lessonId: 'many-to-many' },
        { title: 'Navigation Properties', lessonId: 'navigation-properties' },
        { title: 'Foreign Keys and Cascading', lessonId: 'foreign-keys-cascading' },
      ],
      resources: [
        {
          title: 'Relationships',
          url: 'https://learn.microsoft.com/en-us/ef/core/modeling/relationships',
          type: 'documentation',
          description: 'Comprehensive guide to configuring entity relationships in EF Core',
        },
        {
          title: 'Cascade Delete',
          url: 'https://learn.microsoft.com/en-us/ef/core/saving/cascade-delete',
          type: 'documentation',
          description: 'Understanding cascade delete behavior and configuring delete actions',
        },
        {
          title: 'Many-to-Many Relationships',
          url: 'https://learn.microsoft.com/en-us/ef/core/modeling/relationships/many-to-many',
          type: 'documentation',
          description: 'Configure many-to-many relationships with and without join entities',
        },
        {
          title: 'Foreign Key and Navigation Properties',
          url: 'https://learn.microsoft.com/en-us/ef/core/modeling/relationships/foreign-and-principal-keys',
          type: 'article',
          description: 'Deep dive into foreign keys and navigation property configuration',
        },
      ],
      estimatedMinutes: 180,
      difficulty: 5,
      skillCluster: 'backend',
      tags: ['relationships', 'one-to-one', 'one-to-many', 'many-to-many'],
    },
    {
      id: 'advanced-relationships',
      title: 'Advanced Relationships',
      description:
        'Explore advanced relationship configurations including self-referencing and alternate keys.',
      type: 'topic',
      position: { x: 600, y: 720 },
      learningObjectives: [
        { title: 'Self-Referencing Relationships', lessonId: 'self-referencing' },
        { title: 'Relationship Configuration with Fluent API', lessonId: 'fluent-api-relationships' },
        { title: 'Alternate Keys', lessonId: 'alternate-keys' },
        { title: 'Owned Entities in Relationships', lessonId: 'owned-entities-relationships' },
      ],
      resources: [
        {
          title: 'Alternate Keys',
          url: 'https://learn.microsoft.com/en-us/ef/core/modeling/keys?tabs=fluent-api#alternate-keys',
          type: 'documentation',
          description: 'Configure alternate keys for unique constraints and relationship targets',
        },
        {
          title: 'Owned Entity Types',
          url: 'https://learn.microsoft.com/en-us/ef/core/modeling/owned-entities',
          type: 'documentation',
          description: 'Model value objects and complex types using owned entities',
        },
        {
          title: 'Self-Referencing Relationships',
          url: 'https://learn.microsoft.com/en-us/ef/core/modeling/relationships/self-referencing',
          type: 'article',
          description: 'Configure hierarchical data structures with self-referencing relationships',
        },
        {
          title: 'Relationship Configuration with Fluent API',
          url: 'https://learn.microsoft.com/en-us/ef/core/modeling/relationships/conventions',
          type: 'documentation',
          description: 'Advanced relationship configuration using Fluent API',
        },
      ],
      estimatedMinutes: 120,
      difficulty: 6,
      skillCluster: 'backend',
      tags: ['relationships', 'advanced', 'fluent-api', 'alternate-keys'],
    },

    // === ROW 7: LOADING STRATEGIES ===
    {
      id: 'loading-strategies',
      title: 'Loading Strategies',
      description:
        'Master eager, lazy, and explicit loading strategies for related data.',
      type: 'milestone',
      position: { x: 400, y: 840 },
      learningObjectives: [
        { title: 'Eager Loading (Include/ThenInclude)', lessonId: 'eager-loading' },
        { title: 'Lazy Loading', lessonId: 'lazy-loading' },
        { title: 'Explicit Loading', lessonId: 'explicit-loading' },
        { title: 'Loading Related Data Patterns', lessonId: 'loading-patterns' },
        { title: 'Performance Considerations', lessonId: 'loading-performance' },
      ],
      resources: [
        {
          title: 'Loading Related Data',
          url: 'https://learn.microsoft.com/en-us/ef/core/querying/related-data/',
          type: 'documentation',
          description: 'Comprehensive guide to eager, lazy, and explicit loading strategies',
        },
        {
          title: 'Eager Loading',
          url: 'https://learn.microsoft.com/en-us/ef/core/querying/related-data/eager',
          type: 'documentation',
          description: 'Use Include and ThenInclude to load related data in a single query',
        },
        {
          title: 'Lazy Loading',
          url: 'https://learn.microsoft.com/en-us/ef/core/querying/related-data/lazy',
          type: 'documentation',
          description: 'Configure lazy loading with proxies or without proxies',
        },
        {
          title: 'Explicit Loading',
          url: 'https://learn.microsoft.com/en-us/ef/core/querying/related-data/explicit',
          type: 'article',
          description: 'Load related data on demand using explicit loading',
        },
      ],
      estimatedMinutes: 150,
      difficulty: 5,
      skillCluster: 'backend',
      tags: ['loading', 'eager', 'lazy', 'explicit', 'include'],
    },

    // === ROW 8: PATTERNS ===
    {
      id: 'repository-pattern',
      title: 'Repository Pattern',
      description:
        'Implement the Repository pattern with EF Core for clean data access abstraction.',
      type: 'topic',
      position: { x: 200, y: 960 },
      learningObjectives: [
        { title: 'Generic Repository Implementation', lessonId: 'generic-repository' },
        { title: 'Repository Interfaces', lessonId: 'repository-interfaces' },
        { title: 'Dependency Injection with Repositories', lessonId: 'di-repositories' },
        { title: 'Specification Pattern', lessonId: 'specification-pattern' },
      ],
      resources: [
        {
          title: 'Repository Pattern',
          url: 'https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/infrastructure-persistence-layer-design',
          type: 'documentation',
          description: 'Repository pattern in .NET architecture for clean data access abstraction',
        },
        {
          title: 'Specification Pattern',
          url: 'https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/infrastructure-persistence-layer-design#the-specification-pattern',
          type: 'documentation',
          description: 'Implementing the Specification pattern for reusable query logic',
        },
        {
          title: 'Generic Repository Implementation',
          url: 'https://learn.microsoft.com/en-us/aspnet/mvc/overview/older-versions/getting-started-with-ef-5-using-mvc-4/implementing-the-repository-and-unit-of-work-patterns-in-an-asp-net-mvc-application',
          type: 'article',
          description: 'Step-by-step guide to implementing generic repository with EF Core',
        },
        {
          title: 'Dependency Injection in ASP.NET Core',
          url: 'https://learn.microsoft.com/en-us/aspnet/core/fundamentals/dependency-injection',
          type: 'documentation',
          description: 'Register and inject repositories using ASP.NET Core DI container',
        },
      ],
      estimatedMinutes: 120,
      difficulty: 5,
      skillCluster: 'backend',
      tags: ['repository', 'pattern', 'abstraction', 'di', 'specification'],
    },
    {
      id: 'unit-of-work',
      title: 'Unit of Work Pattern',
      description:
        'Learn the Unit of Work pattern for coordinating multiple repositories and transactions.',
      type: 'topic',
      position: { x: 600, y: 960 },
      learningObjectives: [
        { title: 'Unit of Work Concept', lessonId: 'unit-of-work-concept' },
        { title: 'Transaction Management', lessonId: 'transaction-management' },
        { title: 'Coordinating Multiple Repositories', lessonId: 'coordinating-repositories' },
      ],
      resources: [
        {
          title: 'Unit of Work Pattern',
          url: 'https://learn.microsoft.com/en-us/aspnet/mvc/overview/older-versions/getting-started-with-ef-5-using-mvc-4/implementing-the-repository-and-unit-of-work-patterns-in-an-asp-net-mvc-application',
          type: 'documentation',
          description: 'Implementing Unit of Work pattern for coordinating multiple repositories',
        },
        {
          title: 'Transactions in EF Core',
          url: 'https://learn.microsoft.com/en-us/ef/core/saving/transactions',
          type: 'documentation',
          description: 'Managing database transactions with EF Core',
        },
        {
          title: 'Connection Resiliency',
          url: 'https://learn.microsoft.com/en-us/ef/core/miscellaneous/connection-resiliency',
          type: 'article',
          description: 'Handle transient failures with execution strategies',
        },
        {
          title: 'DbContext as Unit of Work',
          url: 'https://learn.microsoft.com/en-us/ef/core/dbcontext-configuration/#the-dbcontext-lifetime',
          type: 'article',
          description: 'Understanding how DbContext naturally implements Unit of Work',
        },
      ],
      estimatedMinutes: 90,
      difficulty: 6,
      skillCluster: 'backend',
      tags: ['unit-of-work', 'pattern', 'transactions'],
    },

    // === ROW 9: PERFORMANCE OPTIMIZATION ===
    {
      id: 'performance-optimization',
      title: 'Performance Optimization',
      description:
        'Optimize EF Core applications for high performance with query analysis and best practices.',
      type: 'milestone',
      position: { x: 400, y: 1080 },
      learningObjectives: [
        { title: 'Query Performance Analysis', lessonId: 'ef-performance' },
        { title: 'AsNoTracking Queries', lessonId: 'asnotracking' },
        { title: 'Compiled Queries', lessonId: 'compiled-queries' },
        { title: 'Avoiding N+1 Problems', lessonId: 'n-plus-one' },
        { title: 'Batch Operations and Bulk Updates', lessonId: 'batch-operations' },
        { title: 'Connection Pooling', lessonId: 'connection-pooling' },
      ],
      resources: [
        {
          title: 'Performance',
          url: 'https://learn.microsoft.com/en-us/ef/core/performance/',
          type: 'documentation',
          description: 'Comprehensive guide to EF Core performance optimization techniques',
        },
        {
          title: 'Efficient Querying',
          url: 'https://learn.microsoft.com/en-us/ef/core/performance/efficient-querying',
          type: 'documentation',
          description: 'Best practices for writing efficient queries with EF Core',
        },
        {
          title: 'Efficient Updating',
          url: 'https://learn.microsoft.com/en-us/ef/core/performance/efficient-updating',
          type: 'documentation',
          description: 'Optimize update operations and batch processing',
        },
        {
          title: 'Advanced Performance Topics',
          url: 'https://learn.microsoft.com/en-us/ef/core/performance/advanced-performance-topics',
          type: 'article',
          description: 'Compiled queries, pooling, and other advanced performance techniques',
        },
      ],
      estimatedMinutes: 180,
      difficulty: 6,
      skillCluster: 'performance',
      tags: ['performance', 'optimization', 'asnotracking', 'compiled-queries'],
    },

    // === ROW 10: ADVANCED FEATURES ===
    {
      id: 'advanced-features',
      title: 'Advanced Features',
      description:
        'Explore advanced EF Core features including global filters, shadow properties, and value conversions.',
      type: 'milestone',
      position: { x: 400, y: 1200 },
      learningObjectives: [
        { title: 'Global Query Filters', lessonId: 'global-query-filters' },
        { title: 'Shadow Properties', lessonId: 'shadow-properties' },
        { title: 'Backing Fields', lessonId: 'backing-fields' },
        { title: 'Value Conversions', lessonId: 'value-conversions' },
        { title: 'Table Splitting', lessonId: 'table-splitting' },
      ],
      resources: [
        {
          title: 'Global Query Filters',
          url: 'https://learn.microsoft.com/en-us/ef/core/querying/filters',
          type: 'documentation',
          description: 'Apply automatic filtering to all queries for soft delete and multi-tenancy',
        },
        {
          title: 'Shadow and Indexer Properties',
          url: 'https://learn.microsoft.com/en-us/ef/core/modeling/shadow-properties',
          type: 'documentation',
          description: 'Store data in the database without exposing it in entity classes',
        },
        {
          title: 'Value Conversions',
          url: 'https://learn.microsoft.com/en-us/ef/core/modeling/value-conversions',
          type: 'documentation',
          description: 'Convert property values when reading from and writing to the database',
        },
        {
          title: 'Backing Fields',
          url: 'https://learn.microsoft.com/en-us/ef/core/modeling/backing-field',
          type: 'article',
          description: 'Configure EF Core to read/write to backing fields instead of properties',
        },
      ],
      estimatedMinutes: 150,
      difficulty: 6,
      skillCluster: 'backend',
      tags: ['advanced', 'filters', 'shadow-properties', 'value-conversions'],
    },
    {
      id: 'temporal-tables',
      title: 'Temporal Tables',
      description:
        'Learn to use temporal tables in EF Core 6+ for tracking historical data changes.',
      type: 'topic',
      position: { x: 600, y: 1200 },
      learningObjectives: [
        { title: 'Temporal Tables in EF Core 6+', lessonId: 'temporal-tables-intro' },
        { title: 'Querying Historical Data', lessonId: 'querying-historical-data' },
        { title: 'Temporal Table Configuration', lessonId: 'temporal-configuration' },
      ],
      resources: [
        {
          title: 'SQL Server Temporal Tables',
          url: 'https://learn.microsoft.com/en-us/ef/core/providers/sql-server/temporal-tables',
          type: 'documentation',
          description: 'Configure and query temporal tables with SQL Server provider',
        },
        {
          title: 'Querying Historical Data',
          url: 'https://learn.microsoft.com/en-us/ef/core/providers/sql-server/temporal-tables#querying-historical-data',
          type: 'documentation',
          description: 'Query point-in-time and range-based historical data',
        },
        {
          title: 'Temporal Tables in SQL Server',
          url: 'https://learn.microsoft.com/en-us/sql/relational-databases/tables/temporal-tables',
          type: 'article',
          description: 'SQL Server documentation on temporal tables fundamentals',
        },
        {
          title: 'EF Core 6 Temporal Tables Feature',
          url: 'https://devblogs.microsoft.com/dotnet/announcing-entity-framework-core-6-0-preview-4-performance-edition/#temporal-tables',
          type: 'article',
          description: 'Introduction to temporal tables support in EF Core 6',
        },
      ],
      estimatedMinutes: 90,
      difficulty: 6,
      skillCluster: 'backend',
      tags: ['temporal', 'history', 'audit', 'ef-core-6'],
    },

    // === ROW 11: TESTING AND DATABASE-FIRST ===
    {
      id: 'testing-ef-core',
      title: 'Testing with EF Core',
      description:
        'Learn testing strategies for EF Core applications including in-memory and SQLite providers.',
      type: 'milestone',
      position: { x: 200, y: 1320 },
      learningObjectives: [
        { title: 'InMemory Provider for Testing', lessonId: 'inmemory-testing' },
        { title: 'SQLite for Testing', lessonId: 'sqlite-testing' },
        { title: 'Repository Pattern Testing', lessonId: 'repository-testing' },
        { title: 'Integration Testing with Real Databases', lessonId: 'integration-testing-ef' },
      ],
      resources: [
        {
          title: 'Testing EF Core Applications',
          url: 'https://learn.microsoft.com/en-us/ef/core/testing/',
          type: 'documentation',
          description: 'Comprehensive guide to testing strategies for EF Core applications',
        },
        {
          title: 'Testing with the InMemory Provider',
          url: 'https://learn.microsoft.com/en-us/ef/core/testing/testing-without-the-database',
          type: 'documentation',
          description: 'Fast unit testing without a real database using InMemory provider',
        },
        {
          title: 'Testing with SQLite',
          url: 'https://learn.microsoft.com/en-us/ef/core/testing/testing-with-the-database',
          type: 'documentation',
          description: 'Use SQLite in-memory mode for more realistic testing',
        },
        {
          title: 'Integration Testing in ASP.NET Core',
          url: 'https://learn.microsoft.com/en-us/aspnet/core/test/integration-tests',
          type: 'article',
          description: 'End-to-end integration testing with real database connections',
        },
      ],
      estimatedMinutes: 150,
      difficulty: 5,
      skillCluster: 'testing',
      tags: ['testing', 'inmemory', 'sqlite', 'integration'],
    },
    {
      id: 'database-first',
      title: 'Database-First Approach',
      description:
        'Learn to scaffold EF Core models from existing databases for legacy application integration.',
      type: 'optional',
      position: { x: 400, y: 1320 },
      learningObjectives: [
        { title: 'Scaffolding from Existing Databases', lessonId: 'scaffolding' },
        { title: 'Reverse Engineering Database Schemas', lessonId: 'reverse-engineering' },
        { title: 'Maintaining Scaffolded Code', lessonId: 'maintaining-scaffolded' },
        { title: 'When to Use Database-First', lessonId: 'database-first-use-cases' },
      ],
      resources: [
        {
          title: 'Reverse Engineering',
          url: 'https://learn.microsoft.com/en-us/ef/core/managing-schemas/scaffolding/',
          type: 'documentation',
          description: 'Generate entity classes and DbContext from an existing database',
        },
        {
          title: 'Customizing Scaffolding',
          url: 'https://learn.microsoft.com/en-us/ef/core/managing-schemas/scaffolding/templates',
          type: 'documentation',
          description: 'Customize the generated code using T4 templates',
        },
        {
          title: 'Database-First vs Code-First',
          url: 'https://learn.microsoft.com/en-us/ef/core/managing-schemas/',
          type: 'article',
          description: 'Compare approaches and choose the right one for your project',
        },
        {
          title: 'Maintaining Scaffolded Code',
          url: 'https://learn.microsoft.com/en-us/ef/core/managing-schemas/scaffolding/#updating-the-model',
          type: 'article',
          description: 'Best practices for updating scaffolded code when the database changes',
        },
      ],
      estimatedMinutes: 90,
      difficulty: 5,
      skillCluster: 'backend',
      tags: ['database-first', 'scaffolding', 'reverse-engineering', 'legacy'],
    },
    {
      id: 'database-providers',
      title: 'Database Providers',
      description:
        'Understand different database providers and their specific features and limitations.',
      type: 'topic',
      position: { x: 600, y: 1320 },
      learningObjectives: [
        { title: 'SQL Server Provider', lessonId: 'sql-server-provider' },
        { title: 'PostgreSQL Provider', lessonId: 'postgresql-provider' },
        { title: 'SQLite Provider', lessonId: 'sqlite-provider' },
        { title: 'Provider-Specific Features', lessonId: 'provider-features' },
      ],
      resources: [
        {
          title: 'Database Providers',
          url: 'https://learn.microsoft.com/en-us/ef/core/providers/',
          type: 'documentation',
          description: 'Overview of all available EF Core database providers',
        },
        {
          title: 'SQL Server Provider',
          url: 'https://learn.microsoft.com/en-us/ef/core/providers/sql-server/',
          type: 'documentation',
          description: 'SQL Server and Azure SQL specific features and configuration',
        },
        {
          title: 'Npgsql EF Core Provider',
          url: 'https://www.npgsql.org/efcore/',
          type: 'documentation',
          description: 'PostgreSQL provider with full feature documentation',
        },
        {
          title: 'SQLite Provider',
          url: 'https://learn.microsoft.com/en-us/ef/core/providers/sqlite/',
          type: 'documentation',
          description: 'SQLite provider features and limitations',
        },
      ],
      estimatedMinutes: 90,
      difficulty: 4,
      skillCluster: 'backend',
      tags: ['providers', 'sql-server', 'postgresql', 'sqlite'],
    },
  ],

  edges: [
    // Main vertical flow - Foundation
    { id: 'e1', source: 'ef-core-introduction', target: 'dbcontext-dbset', type: 'sequential' },
    { id: 'e2', source: 'dbcontext-dbset', target: 'entity-configuration', type: 'sequential' },
    { id: 'e3', source: 'entity-configuration', target: 'crud-operations', type: 'sequential' },
    { id: 'e4', source: 'crud-operations', target: 'migrations', type: 'sequential' },
    { id: 'e5', source: 'migrations', target: 'querying-linq', type: 'sequential' },
    { id: 'e6', source: 'querying-linq', target: 'entity-relationships', type: 'sequential' },

    // Relationships branch
    { id: 'e7', source: 'entity-relationships', target: 'advanced-relationships', type: 'recommended' },

    // Loading strategies
    { id: 'e8', source: 'entity-relationships', target: 'loading-strategies', type: 'sequential' },

    // Patterns branch from CRUD
    { id: 'e9', source: 'crud-operations', target: 'repository-pattern', type: 'recommended' },
    { id: 'e10', source: 'repository-pattern', target: 'unit-of-work', type: 'recommended' },

    // Performance optimization
    { id: 'e11', source: 'loading-strategies', target: 'performance-optimization', type: 'sequential' },

    // Advanced features
    { id: 'e12', source: 'performance-optimization', target: 'advanced-features', type: 'sequential' },
    { id: 'e13', source: 'advanced-features', target: 'temporal-tables', type: 'optional' },

    // Testing
    { id: 'e14', source: 'performance-optimization', target: 'testing-ef-core', type: 'sequential' },

    // Database-first and providers
    { id: 'e15', source: 'testing-ef-core', target: 'database-first', type: 'optional' },
    { id: 'e16', source: 'dbcontext-dbset', target: 'database-providers', type: 'recommended' },
  ],
};

