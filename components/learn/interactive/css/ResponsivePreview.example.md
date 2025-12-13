# ResponsivePreview Component Examples

## Basic Usage

```tsx
<ResponsivePreview
  html={`
    <div class="container">
      <header class="header">
        <h1>Responsive Website</h1>
        <nav class="nav">
          <a href="#">Home</a>
          <a href="#">About</a>
          <a href="#">Contact</a>
        </nav>
      </header>
      <main class="content">
        <h2>Welcome</h2>
        <p>This is a responsive layout example.</p>
      </main>
    </div>
  `}
  css={`
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1rem;
    }
    
    .header h1 {
      margin: 0 0 1rem 0;
      font-size: 1.5rem;
    }
    
    .nav {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }
    
    .nav a {
      color: white;
      text-decoration: none;
      padding: 0.5rem 1rem;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 4px;
      transition: background 0.3s;
    }
    
    .nav a:hover {
      background: rgba(255, 255, 255, 0.3);
    }
    
    .content {
      padding: 1rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    
    /* Mobile styles */
    @media (max-width: 768px) {
      .header h1 {
        font-size: 1.25rem;
      }
      
      .nav {
        flex-direction: column;
      }
      
      .nav a {
        text-align: center;
      }
    }
  `}
/>
```

## With Custom Viewports

```tsx
<ResponsivePreview
  html={`
    <div class="grid">
      <div class="card">Card 1</div>
      <div class="card">Card 2</div>
      <div class="card">Card 3</div>
      <div class="card">Card 4</div>
    </div>
  `}
  css={`
    .grid {
      display: grid;
      gap: 1rem;
      padding: 1rem;
    }
    
    .card {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
      padding: 2rem;
      border-radius: 8px;
      text-align: center;
      font-weight: bold;
    }
    
    /* Mobile: 1 column */
    @media (max-width: 640px) {
      .grid {
        grid-template-columns: 1fr;
      }
    }
    
    /* Tablet: 2 columns */
    @media (min-width: 641px) and (max-width: 1024px) {
      .grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    
    /* Desktop: 4 columns */
    @media (min-width: 1025px) {
      .grid {
        grid-template-columns: repeat(4, 1fr);
      }
    }
  `}
  viewports={[
    { name: 'Mobile', width: 375, height: 667 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Desktop', width: 1440, height: 900 },
    { name: 'Wide', width: 1920, height: 1080 },
  ]}
/>
```

## Media Query Example

```tsx
<ResponsivePreview
  html={`
    <div class="hero">
      <h1>Responsive Typography</h1>
      <p>Watch how the text size adapts to different screen sizes.</p>
      <button class="cta">Get Started</button>
    </div>
  `}
  css={`
    .hero {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 2rem;
      text-align: center;
      border-radius: 8px;
    }
    
    .hero h1 {
      font-size: clamp(1.5rem, 5vw, 3rem);
      margin: 0 0 1rem 0;
    }
    
    .hero p {
      font-size: clamp(0.875rem, 2vw, 1.25rem);
      margin: 0 0 2rem 0;
      opacity: 0.9;
    }
    
    .cta {
      background: white;
      color: #667eea;
      border: none;
      padding: 0.75rem 2rem;
      font-size: 1rem;
      font-weight: bold;
      border-radius: 4px;
      cursor: pointer;
      transition: transform 0.2s;
    }
    
    .cta:hover {
      transform: scale(1.05);
    }
    
    @media (max-width: 768px) {
      .hero {
        padding: 1.5rem;
      }
      
      .cta {
        width: 100%;
      }
    }
  `}
  initialViewport="Mobile"
/>
```

## Flexbox Responsive Layout

```tsx
<ResponsivePreview
  html={`
    <div class="layout">
      <aside class="sidebar">
        <h3>Sidebar</h3>
        <ul>
          <li>Link 1</li>
          <li>Link 2</li>
          <li>Link 3</li>
        </ul>
      </aside>
      <main class="main">
        <h2>Main Content</h2>
        <p>This layout switches from side-by-side to stacked on mobile.</p>
      </main>
    </div>
  `}
  css={`
    .layout {
      display: flex;
      gap: 1rem;
      padding: 1rem;
    }
    
    .sidebar {
      background: #f3f4f6;
      padding: 1rem;
      border-radius: 8px;
      flex: 0 0 200px;
    }
    
    .sidebar h3 {
      margin: 0 0 1rem 0;
      color: #374151;
    }
    
    .sidebar ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    
    .sidebar li {
      padding: 0.5rem;
      margin-bottom: 0.5rem;
      background: white;
      border-radius: 4px;
      cursor: pointer;
    }
    
    .main {
      flex: 1;
      background: white;
      padding: 1rem;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    
    .main h2 {
      margin: 0 0 1rem 0;
      color: #111827;
    }
    
    /* Stack on mobile */
    @media (max-width: 768px) {
      .layout {
        flex-direction: column;
      }
      
      .sidebar {
        flex: 1;
      }
    }
  `}
/>
```

## Features

- **Multi-viewport preview**: Test mobile, tablet, and desktop layouts
- **Custom viewport sizes**: Enter custom dimensions for specific testing
- **Orientation toggle**: Switch between portrait and landscape
- **Comparison mode**: View multiple viewports side-by-side
- **Device frames**: Visual device bezels for realistic preview
- **Automatic scaling**: Content scales to fit preview area
- **Live updates**: Changes to HTML/CSS reflect immediately
