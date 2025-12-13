# CssComparison Component Examples

## Basic Usage - Flexbox vs Grid

```jsx
<CssComparison
  approaches={[
    {
      title: 'Flexbox Approach',
      description: 'Using flexbox for layout',
      css: `
        .container {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
        }
        .item {
          flex: 1 1 200px;
          padding: 20px;
          background: #e0e7ff;
          border-radius: 8px;
        }
      `,
    },
    {
      title: 'Grid Approach',
      description: 'Using CSS Grid for layout',
      css: `
        .container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }
        .item {
          padding: 20px;
          background: #e0e7ff;
          border-radius: 8px;
        }
      `,
    },
  ]}
  sharedHtml={`
    <div class="container">
      <div class="item">Item 1</div>
      <div class="item">Item 2</div>
      <div class="item">Item 3</div>
      <div class="item">Item 4</div>
    </div>
  `}
/>
```

## Centering Techniques Comparison

```jsx
<CssComparison
  approaches={[
    {
      title: 'Flexbox Centering',
      css: `
        .container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 300px;
          background: #f3f4f6;
        }
        .box {
          width: 100px;
          height: 100px;
          background: #3b82f6;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
        }
      `,
    },
    {
      title: 'Grid Centering',
      css: `
        .container {
          display: grid;
          place-items: center;
          height: 300px;
          background: #f3f4f6;
        }
        .box {
          width: 100px;
          height: 100px;
          background: #3b82f6;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
        }
      `,
    },
    {
      title: 'Absolute Positioning',
      css: `
        .container {
          position: relative;
          height: 300px;
          background: #f3f4f6;
        }
        .box {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100px;
          height: 100px;
          background: #3b82f6;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
        }
      `,
    },
  ]}
  sharedHtml={`
    <div class="container">
      <div class="box">Centered</div>
    </div>
  `}
  height={350}
/>
```

## Selector Specificity Comparison

```jsx
<CssComparison
  approaches={[
    {
      title: 'Element Selector',
      description: 'Specificity: 0-0-1',
      css: `
        p {
          color: blue;
          font-size: 16px;
        }
      `,
    },
    {
      title: 'Class Selector',
      description: 'Specificity: 0-1-0',
      css: `
        .text {
          color: green;
          font-size: 16px;
        }
      `,
    },
    {
      title: 'ID Selector',
      description: 'Specificity: 1-0-0',
      css: `
        #main-text {
          color: red;
          font-size: 16px;
        }
      `,
    },
  ]}
  sharedHtml={`
    <p id="main-text" class="text">
      This text will be red because ID selector has highest specificity
    </p>
  `}
  height={200}
/>
```

## Responsive Design Approaches

```jsx
<CssComparison
  approaches={[
    {
      title: 'Media Queries',
      description: 'Traditional responsive approach',
      css: `
        .container {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        @media (max-width: 768px) {
          .container {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 480px) {
          .container {
            grid-template-columns: 1fr;
          }
        }
        .item {
          padding: 20px;
          background: #dbeafe;
          border-radius: 8px;
        }
      `,
    },
    {
      title: 'Auto-fit Grid',
      description: 'Intrinsic responsive design',
      css: `
        .container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 20px;
        }
        .item {
          padding: 20px;
          background: #dbeafe;
          border-radius: 8px;
        }
      `,
    },
  ]}
  sharedHtml={`
    <div class="container">
      <div class="item">Item 1</div>
      <div class="item">Item 2</div>
      <div class="item">Item 3</div>
      <div class="item">Item 4</div>
      <div class="item">Item 5</div>
      <div class="item">Item 6</div>
    </div>
  `}
  height={400}
/>
```

## Animation Approaches

```jsx
<CssComparison
  approaches={[
    {
      title: 'Transition',
      description: 'Simple state change animation',
      css: `
        .box {
          width: 100px;
          height: 100px;
          background: #3b82f6;
          transition: all 0.3s ease;
          cursor: pointer;
        }
        .box:hover {
          transform: scale(1.2);
          background: #ef4444;
        }
      `,
    },
    {
      title: 'Keyframe Animation',
      description: 'Complex multi-step animation',
      css: `
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            background: #3b82f6;
          }
          50% {
            transform: scale(1.2);
            background: #ef4444;
          }
        }
        .box {
          width: 100px;
          height: 100px;
          animation: pulse 2s infinite;
        }
      `,
    },
  ]}
  sharedHtml={`
    <div class="box"></div>
  `}
  height={200}
  syncInteractions={false}
/>
```

## Props

- `approaches`: Array of CSS approaches to compare
  - `title`: Name of the approach
  - `description`: Optional description
  - `css`: CSS code for this approach
  - `html`: Optional HTML (overrides sharedHtml for this approach)
- `sharedHtml`: HTML content used for all approaches (unless overridden)
- `syncInteractions`: Whether to synchronize scroll and hover across previews (default: true)
- `showCode`: Whether to show code view toggle (default: true)
- `height`: Height of preview area in pixels (default: 400)
