# TypeScript Template

A minimal and practical template for TypeScript development, with ESLint and Prettier pre-configured.

## Project Structure
```
project-root/
├ src/
│ └ index.ts # Entry point of your TypeScript code
├ .eslintrc.js # ESLint configuration (legacy-style)
├ .gitignore # Files and directories to be excluded from Git (e.g., node_modules)
├ .prettierrc # Prettier configuration file
├ eslint.config.mjs # ESLint configuration (modern flat config, optional if using .eslintrc.js)
├ package-lock.json # Auto-generated lock file for exact versions of installed dependencies
├ package.json # Project metadata, dependency list, and npm scripts
├ README.md # Project description and usage instructions
└ tsconfig.json # TypeScript compiler options and file inclusion rules
```

## Usage

### 1. Clone the Template

You can use this template repository to start a new project:

```bash
git clone this-template-repository.git new-project
cd new-project
```

### 2. Install Dependencies

Since node_modules is excluded, install all dependencies using:
```bash
npm install
```

### 3. Start Coding

Create your TypeScript source files in the src/ directory.
```bash
# Example: src/index.ts
console.log("Hello, TypeScript!");
```

You can run the TypeScript compiler manually if needed:
```bash
npx tsc
```

Or use the watch mode:
```bash
npx tsc --watch
```

This will generate JavaScript files in the dist directory (as defined in tsconfig.json).
To run the compiled code using Node.js:
```bash
node dist/index.js
```

### 4. Format and Lint Your Code

Format with Prettier:
```bash
npm run format
```

Lint with ESLint:
```bash
npm run lint
```

These scripts are already defined in package.json.

## Scripts in package.json

```json
"scripts": {
  "format": "prettier --write 'src/**/*.{ts,tsx,js,jsx}'",
  "lint": "eslint 'src/**/*.{ts,tsx}'"
}
```

## Notes

- All source code should be placed under the src/ directory.
- The node_modules directory is not included in this template and should be generated via npm install.
- Adjust tsconfig.json and .eslintrc.js if your project structure differs.