# CSS Lessons

This directory contains interactive CSS lessons.

## Structure

Each CSS lesson follows this structure:

```
css/{topic}/
├── metadata.json       # Lesson metadata (title, sections, XP rewards, etc.)
├── beginner.mdx       # Beginner-level content
├── intermediate.mdx   # Intermediate-level content
└── advanced.mdx       # Advanced-level content
```

## Available Lessons

1. **Selectors** - CSS selectors, specificity, and cascade
2. **Box Model** - Content, padding, border, and margin
3. **Positioning** - Static, relative, absolute, fixed, and sticky positioning
4. **Flexbox** - One-dimensional layout system
5. **Grid** - Two-dimensional layout system
6. **Typography** - Fonts, text styling, and web fonts
7. **Colors** - Color models, gradients, and color theory
8. **Responsive Design** - Media queries and mobile-first approach
9. **Animations** - Keyframes, timing functions, and transitions
10. **Transforms** - 2D and 3D transforms

## Metadata Schema

Each `metadata.json` file contains:

- `id`: Unique lesson identifier
- `title`: Display title
- `description`: Brief description
- `milestone`: Always "css"
- `order`: Lesson ordering number
- `sections`: Array of section IDs (must match ProgressCheckpoint sections in MDX)
- `levels`: XP rewards and estimated time for each experience level
- `prerequisites`: Array of prerequisite lesson IDs
- `tags`: Array of tags for search and categorization
- `cssProperties`: Array of CSS properties covered in the lesson

## Interactive Components

CSS lessons use specialized interactive components located in:
`components/learn/interactive/css/`

These components are registered in `mdx-components.tsx` and can be used directly in MDX content.

## Progress Tracking

Each lesson uses `<ProgressCheckpoint>` components to track user progress:

```mdx
<ProgressCheckpoint section="section-id" xpReward={10} />
```

The `section` prop must match one of the section IDs defined in `metadata.json`.

## Experience Levels

Each lesson has three experience levels:

- **Beginner**: Simple analogies, basic concepts (50 XP)
- **Intermediate**: Practical use cases, deeper understanding (100 XP)
- **Advanced**: Edge cases, performance, advanced patterns (200 XP)

## Development

When creating new lesson content:

1. Create the lesson directory under `content/lessons/css/`
2. Add `metadata.json` with all required fields
3. Create `beginner.mdx`, `intermediate.mdx`, and `advanced.mdx` files
4. Ensure section IDs in MDX match those in metadata
5. Use interactive components to enhance learning
6. Test progress tracking and XP rewards
