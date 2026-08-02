# 🤝 Contributing to Kas Dolan Bareng

Terima kasih atas minat Anda untuk berkontribusi! Dokumen ini berisi panduan untuk berkontribusi ke proyek.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Coding Guidelines](#coding-guidelines)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)

---

## 📜 Code of Conduct

### Our Pledge

Kami berkomitmen untuk menjaga lingkungan yang ramah dan inklusif untuk semua kontributor.

### Expected Behavior

- ✅ Gunakan bahasa yang sopan dan profesional
- ✅ Hormati perbedaan pendapat
- ✅ Terima kritik konstruktif dengan lapang dada
- ✅ Fokus pada apa yang terbaik untuk komunitas

### Unacceptable Behavior

- ❌ Harassment atau diskriminasi
- ❌ Komentar ofensif atau trolling
- ❌ Personal attacks
- ❌ Publishing private information

---

## 💡 How Can I Contribute?

### 🐛 Reporting Bugs

Sebelum membuat bug report:
1. Cek apakah bug sudah dilaporkan di [Issues](../../issues)
2. Pastikan menggunakan versi terbaru

**Format Bug Report:**
```markdown
**Describe the bug**
Deskripsi jelas dan ringkas tentang bug

**To Reproduce**
1. Go to '...'
2. Click on '....'
3. See error

**Expected behavior**
Apa yang seharusnya terjadi

**Screenshots**
Jika applicable, tambahkan screenshots

**Environment:**
- OS: [e.g. macOS, Windows, Linux]
- Browser: [e.g. Chrome, Safari]
- Version: [e.g. 1.0.0]
```

### ✨ Suggesting Features

**Format Feature Request:**
```markdown
**Is your feature request related to a problem?**
Deskripsi masalah yang ingin dipecahkan

**Describe the solution you'd like**
Deskripsi solusi yang diinginkan

**Describe alternatives you've considered**
Alternatif solusi lain

**Additional context**
Context tambahan atau screenshots
```

### 🔧 Contributing Code

1. **Fork** repository
2. **Clone** fork Anda
3. **Create branch** untuk feature/fix
4. **Make changes** dan test
5. **Commit** dengan message yang jelas
6. **Push** ke fork Anda
7. **Open Pull Request**

---

## 🛠️ Development Setup

### Prerequisites

- Node.js v18+
- PostgreSQL v14+
- Git

### Setup Local Development

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/kas-dolan-bareng.git
cd kas-dolan-bareng

# Add upstream remote
git remote add upstream https://github.com/ORIGINAL_OWNER/kas-dolan-bareng.git

# Install dependencies
npm run install:all

# Setup database
createdb kas_dolan_bareng_dev
psql kas_dolan_bareng_dev < backend/database/schema.sql

# Setup environment
cd backend
cp .env.example .env
# Edit .env dengan konfigurasi local

cd ../frontend
cp .env.example .env

# Run development servers
cd ..
npm run dev
```

### Project Structure

Lihat [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) untuk detail lengkap.

---

## 📝 Coding Guidelines

### JavaScript/JSX Style

#### General Rules
- Gunakan ES6+ features
- Gunakan `const` dan `let`, hindari `var`
- Gunakan arrow functions
- Destructuring untuk cleaner code
- Async/await daripada .then()

#### Naming Conventions
```javascript
// Variables & functions: camelCase
const userName = 'John'
const getUserData = () => {}

// Components: PascalCase
const UserProfile = () => {}

// Constants: UPPER_SNAKE_CASE
const API_BASE_URL = 'https://api.example.com'

// File names:
// - Components: PascalCase.jsx
// - Utilities: camelCase.js
// - Routes: camelCase.js
```

#### React Best Practices
```jsx
// ✅ Good
import { useState, useEffect } from 'react'

export default function UserProfile({ userId }) {
  const [user, setUser] = useState(null)
  
  useEffect(() => {
    loadUser(userId)
  }, [userId])
  
  if (!user) return <Loading />
  
  return (
    <div className="user-profile">
      <h1>{user.name}</h1>
    </div>
  )
}

// ❌ Bad
import React from 'react'

export default function UserProfile(props) {
  const [user, setUser] = React.useState(null)
  
  // No dependency array
  React.useEffect(() => {
    loadUser(props.userId)
  })
  
  if (!user) {
    return <div>Loading...</div>
  }
  
  return <div><h1>{user.name}</h1></div>
}
```

### Backend Code Style

```javascript
// ✅ Good - Express routes
router.get('/users/:id', auth, async (req, res) => {
  try {
    const user = await getUserById(req.params.id)
    
    if (!user) {
      return res.status(404).json({ 
        message: 'User not found' 
      })
    }
    
    res.json(user)
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({ 
      message: 'Server error' 
    })
  }
})

// ❌ Bad
router.get('/users/:id', function(req, res) {
  getUserById(req.params.id).then(function(user) {
    if (!user) {
      res.status(404).json({ message: 'User not found' })
    } else {
      res.json(user)
    }
  }).catch(function(error) {
    console.log(error)
    res.status(500).json({ message: 'Error' })
  })
})
```

### CSS/Tailwind Guidelines

```jsx
// ✅ Good - Organized Tailwind classes
<div className="
  flex items-center justify-between
  p-4 rounded-lg
  bg-white dark:bg-gray-800
  hover:shadow-lg transition-shadow
">

// ❌ Bad - Unorganized
<div className="p-4 bg-white hover:shadow-lg flex dark:bg-gray-800 items-center rounded-lg justify-between transition-shadow">

// Use custom classes for repeated patterns
// frontend/src/index.css
.btn-primary {
  @apply bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg;
}
```

### Database Queries

```javascript
// ✅ Good - Parameterized queries
const result = await pool.query(
  'SELECT * FROM users WHERE email = $1',
  [email]
)

// ❌ Bad - SQL injection vulnerable
const result = await pool.query(
  `SELECT * FROM users WHERE email = '${email}'`
)
```

---

## 📦 Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc)
- **refactor**: Code refactoring
- **perf**: Performance improvements
- **test**: Adding/updating tests
- **chore**: Maintenance tasks

### Examples

```bash
# Good commit messages
feat(payment): add QRIS payment integration
fix(auth): resolve token expiration issue
docs(api): update endpoints documentation
style(dashboard): improve mobile responsiveness
refactor(database): optimize query performance

# Bad commit messages
update
fix bug
changes
WIP
asdfasdf
```

### Detailed Example

```
feat(payment): add Midtrans payment integration

- Integrate Midtrans Snap payment
- Add payment callback handler
- Update payment status in database
- Add unit tests for payment flow

Closes #123
```

---

## 🔄 Pull Request Process

### Before Submitting PR

1. ✅ Test your changes thoroughly
2. ✅ Update documentation if needed
3. ✅ Follow coding guidelines
4. ✅ Write clear commit messages
5. ✅ Resolve any merge conflicts

### PR Title Format

```
[Type] Brief description

Examples:
[Feature] Add email notification system
[Fix] Resolve login redirect issue
[Docs] Update API documentation
```

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
Describe testing done:
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings
```

### Review Process

1. Maintainer will review your PR
2. Address any requested changes
3. Once approved, maintainer will merge
4. Delete your branch after merge

### After PR Merged

```bash
# Update your fork
git checkout main
git pull upstream main
git push origin main

# Delete feature branch
git branch -d feature/your-feature
```

---

## 🧪 Testing

### Running Tests

```bash
# Frontend tests
cd frontend
npm test

# Backend tests
cd backend
npm test

# E2E tests (if available)
npm run test:e2e
```

### Writing Tests

```javascript
// Example frontend test
import { render, screen } from '@testing-library/react'
import Dashboard from './Dashboard'

describe('Dashboard', () => {
  it('renders dashboard title', () => {
    render(<Dashboard />)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })
})

// Example backend test
describe('Auth Routes', () => {
  it('should register new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      })
    
    expect(res.statusCode).toBe(201)
    expect(res.body).toHaveProperty('user')
  })
})
```

---

## 📚 Resources

- [React Documentation](https://react.dev/)
- [Express.js Guide](https://expressjs.com/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

## ❓ Questions?

Jika ada pertanyaan:
- Open an issue dengan label `question`
- Email: support@kasdolanbareng.com

---

## 🎉 Thank You!

Kontribusi Anda sangat berarti untuk proyek ini. Thank you for making Kas Dolan Bareng better! 🙏

---

**Happy Contributing! 💻**
