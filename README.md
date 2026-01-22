# ViewPro Widget

A React-based embeddable widget for the ViewPro video calling and collaboration platform, featuring real-time communication via LiveKit and seamless integration into any web application.

## Project Overview

ViewPro Widget is a standalone, embeddable React component that provides video calling functionality. It integrates with LiveKit for WebRTC infrastructure and can be easily embedded into any website or web application as a widget.

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- LiveKit server instance
- ViewPro backend API endpoint

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd viewpro-widget
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   - Create a `.env` file in the root directory
   - Add required environment variables:
     ```
     REACT_APP_API_URL=<your-backend-api-url>
     REACT_APP_LIVEKIT_URL=<your-livekit-server-url>
     ```

4. **Build the widget**
   ```bash
   npm run build:webpack
   ```
   This will generate the widget bundle in the `dist` folder.

## Running the Application

### Development Mode

```bash
npm start
```

Runs the app in development mode. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### Production Build

```bash
npm run build
```

Builds the app for production using Create React App, optimized for the best performance.

### Webpack Build (Widget Bundle)

```bash
npm run build:webpack
```

Builds the widget as a standalone UMD bundle (`viewpro-widget.js`) in the `dist` folder that can be embedded in any website.

## Usage

### Embedding the Widget

1. Include the built widget script in your HTML:
   ```html
   <script src="path/to/viewpro-widget.js"></script>
   ```

2. The widget will automatically initialize and render when the page loads.

## Git Workflow & Commit Guidelines

### Commit Message Format

Follow the Conventional Commits specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, missing semicolons, etc.)
- `refactor:` - Code refactoring without feature changes
- `test:` - Adding or updating tests
- `chore:` - Build process, dependencies, tooling
- `perf:` - Performance improvements

**Examples:**

```bash
# Feature commit
git commit -m "feat(video): add screen sharing functionality"

# Bug fix commit
git commit -m "fix(connection): resolve LiveKit connection timeout issue

- Increased timeout threshold from 10s to 30s
- Added retry logic for failed connections"

# Documentation update
git commit -m "docs(readme): add installation instructions"

# Breaking change
git commit -m "feat(api)!: change widget initialization API

BREAKING CHANGE: Widget now requires container ID parameter"
```

### Commit Best Practices

1. **Make atomic commits** - One feature or fix per commit
2. **Write descriptive messages** - Explain what and why, not how
3. **Keep commits small** - Easier to review and debug
4. **Test before committing** - Ensure code works
5. **Don't commit sensitive data** - Use `.gitignore` for credentials
6. **Reference issues** - Use `Fixes #123` or `Closes #456` in commit body

### Standard Git Workflow

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "feat(scope): description"

# Keep branch updated
git pull origin develop

# Push to remote
git push origin feature/new-feature

# Create Pull Request and wait for review

# Merge to develop after approval
git checkout develop
git merge --no-ff feature/new-feature
git push origin develop

# Merge to main for releases
git checkout main
git merge --no-ff develop
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin main --tags
```

## Deployment

### Building for Production

1. **Build the widget bundle**
   ```bash
   npm run build:webpack
   ```

2. **Deploy the `dist/viewpro-widget.js` file** to your CDN or static hosting service.

3. **Update your HTML** to reference the deployed widget script.

### Environment Setup

Ensure production environment variables are properly configured before building. The widget bundle will include the environment variables at build time.

## Troubleshooting

### Common Issues

- **Widget not rendering** - Verify the container element with id `viewpro-widget` exists in the DOM
- **LiveKit connection fails** - Check `REACT_APP_LIVEKIT_URL` environment variable
- **API calls failing** - Verify `REACT_APP_API_URL` is correctly set and accessible
- **Build errors** - Ensure all dependencies are installed with `npm install`
- **Cross-origin issues** - Check CORS settings on the backend API

## Contributing

1. Follow the Git Workflow section above
2. Ensure code follows project standards
3. Write descriptive commit messages
4. Test thoroughly before creating PR
5. Request code review from team members

## Support

For issues or questions, please create an issue in the repository or contact the development team.
