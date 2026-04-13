# How to Update the DRF Report Generator

## 🔄 Quick Update Process

When you make changes to the code and want to deploy to clients:

### 1. Make Your Changes
Edit any files as needed (drf-pdf-generator.js, etc.)

### 2. Test Locally
Open the HTML files in your browser to test changes

### 3. Update Version Info
Edit these files:
- `CHANGELOG.md` - Add new entry with changes
- `README.md` - Update version number
- `version.json` - Update version and changelog

### 4. Commit and Push to GitHub

```bash
# Check what changed
git status

# Add all changes
git add .

# Commit with descriptive message
git commit -m "Version 1.3.0 - Description of changes"

# Push to GitHub
git push
```

### 5. Wait 1-2 Minutes
GitHub Pages will automatically rebuild and deploy your changes.

### 6. Verify Deployment
Visit: https://iamme96.github.io/drf-report-generator/race-graphics.html

Press Ctrl+Shift+R (hard refresh) to clear cache and see new version.

### 7. Notify Client (Optional)
Send a quick email:
- "New update available"
- "Just refresh your browser to get the latest version"
- List the key changes

---

## 📋 Example Update Workflow

```bash
# 1. Made changes to drf-pdf-generator.js

# 2. Update CHANGELOG.md
echo "## [1.3.0] - 2026-03-15
### Changed
- Updated calculation for XYZ
" >> CHANGELOG.md

# 3. Commit and push
git add .
git commit -m "Version 1.3.0 - Updated XYZ calculation"
git push

# 4. Done! Changes are live in 1-2 minutes
```

---

## 🎯 Your GitHub URLs

- **Repository:** https://github.com/iamme96/drf-report-generator
- **Live Site:** https://iamme96.github.io/drf-report-generator/
- **Settings:** https://github.com/iamme96/drf-report-generator/settings

---

## 🔧 Useful Git Commands

```bash
# See what changed
git status
git diff

# Undo local changes (before commit)
git checkout -- filename.js

# See commit history
git log --oneline

# Create a new branch for testing
git checkout -b feature-test
git checkout main  # switch back

# Tag a release
git tag -a v1.3.0 -m "Version 1.3.0"
git push --tags
```

---

## 🆘 If Something Goes Wrong

### Revert to Previous Version
```bash
# See commit history
git log --oneline

# Revert to specific commit
git revert COMMIT-HASH

# Or reset to previous commit (careful!)
git reset --hard HEAD~1
git push --force
```

### Check GitHub Pages Status
Go to: https://github.com/iamme96/drf-report-generator/actions

This shows deployment status and any errors.

---

## 💡 Best Practices

1. ✅ Always test locally before pushing
2. ✅ Use descriptive commit messages
3. ✅ Update CHANGELOG.md with every release
4. ✅ Increment version numbers consistently
5. ✅ Hard refresh (Ctrl+Shift+R) when testing deployed changes
6. ✅ Keep commits focused (one feature/fix per commit)

---

**That's it! Your updates are now automatically deployed to all clients! 🎉**
