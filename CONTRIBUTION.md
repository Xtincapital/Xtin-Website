# Contribution Guidelines

Welcome to the Xtin Capital repository!  
This document defines the Git branching strategy, commit conventions, and pull request process. Please follow these rules strictly to ensure smooth collaboration, minimize conflicts, and keep our codebase stable.

---

## 🔹 Branch Structure
We use a tiered branching model:

- **main** → Production branch.  
  - Always stable and deployment-ready.  
  - Only merged after full testing and approval.  
  - Never commit directly.

- **dev** → Development branch.  
  - Integration branch for all tested features.  
  - Reflects the latest working version under development.  
  - No direct commits allowed — only PRs from personal branches.

- **[developer-name]** → Personal developer branch.  
  - Each developer has their own branch (e.g., `alice`, `john`).  
  - All work should flow through your personal branch.  
  - Keep it regularly updated with `dev`.

---

## 🔹 Workflow

### 1. Setting Up Your Branch
- Clone the repository:
  - `git clone <repo-url>`
- Checkout your personal branch (created by admin/CTO initially):
  - `git checkout -b your-name origin/dev`
- Always keep your branch in sync with `dev`:
  - `git pull origin dev`

### 2. Creating a Feature Branch
- For every new feature, bug fix, or hotfix:
  - Create a branch from **your named branch**:
    - `git checkout your-name`
    - `git pull origin dev`
    - `git checkout -b feature/<short-description>`
- Branch naming convention:
  - `feature/<short-description>` → For new features
  - `bugfix/<short-description>` → For bug fixes
  - `hotfix/<short-description>` → For urgent fixes
- Examples:
  - `feature/login-api`
  - `bugfix/cart-crash`
  - `hotfix/payment-gateway`

### 3. Development Process
1. Write clean, modular, and tested code.  
2. Commit changes frequently with clear messages.  
3. Push your branch to remote:  
   - `git push origin feature/login-api`  
4. Create a **Pull Request (PR) → your named branch**.  
5. Get the PR reviewed and merged.  
6. Delete the feature branch after merge.  

### 4. Keeping Your Branch Updated
- Frequently merge updates from `dev` into your named branch:  
  - `git checkout your-name`
  - `git pull origin dev`
- Resolve conflicts locally before pushing.

### 5. Merging to Dev
- Once your named branch is stable and reviewed:
  - Create a **PR from your named branch → dev**.  
  - Only the **CTO** has permission to merge into `dev`.  
- This ensures `dev` always contains stable, reviewed code.

---

## 🔹 Commit Message Guidelines
Follow the [Conventional Commits](https://www.conventionalcommits.org/) style:

- **Format**:  
  `<type>: <short-description>`  
- **Types**:
  - `feat`: New feature  
  - `fix`: Bug fix  
  - `refactor`: Code change that improves readability/performance without adding features  
  - `docs`: Documentation only changes  
  - `test`: Adding or updating tests  
  - `chore`: Maintenance tasks, configs, CI/CD, etc.  

**Examples**:
- `feat: add login API`
- `fix: resolve checkout crash on mobile`
- `refactor: optimize database query in order service`
- `docs: update contribution guidelines`

---

## 🔹 Pull Request Guidelines
- PRs should have **clear title and description**.  
- Link related issues if applicable.  
- PRs should be **small and focused** (one feature/fix at a time).  
- At least **one peer review** is required before merge into personal branch.  
- No WIP (Work In Progress) PRs should be merged.  

---

## 🔹 Code Review Rules
- Be respectful and constructive in reviews.  
- Check for:
  - Code correctness and functionality  
  - Readability and maintainability  
  - Proper error handling and edge cases  
  - Security best practices  
- Approve only if the code meets team standards.

---

## 🔹 Do’s and Don’ts
✅ Do:
- Pull from `dev` regularly.  
- Write descriptive commits.  
- Keep PRs small and focused.  
- Delete feature branches after merging.  

❌ Don’t:
- Commit directly to `main` or `dev`.  
- Push broken or untested code.  
- Create long-living feature branches.  
- Merge your own PRs into `dev`.  

---

## ✅ Summary
- **main** → Production (only stable releases).  
- **dev** → Development integration (only CTO merges).  
- **[your-name]** → Personal branch (sync with `dev`).  
- **feature/**, **bugfix/**, **hotfix/** → Temporary branches (merge → your branch, then delete).  
- Commit messages follow conventional commits.  
- PRs must be reviewed before merging.  

By following this process, we ensure:
- Clean and conflict-free development  
- Stable `dev` and `main` branches  
- Easier collaboration and onboarding  

---
