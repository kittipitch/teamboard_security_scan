# TeamBoard - Security Scan Edition

> **Workshop exercise repo** — deliberately insecure. Do NOT use in production.

A stripped-down TeamBoard server with **9 planted security vulnerabilities** for AI-assisted code audit practice (S4 Security Verification).

---

## Quick Start

```bash
bun install
bun server.js
# → http://localhost:3000
```

Test it's running:
```bash
curl http://localhost:3000/health
curl http://localhost:3000/boards
```

---

## Your Mission

This app runs — but it's dangerous. Use Claude Code to find, classify, and fix all 9 vulnerabilities.

### The 9 Planted Vulnerabilities

| # | Severity | Type | Where |
|:--|:---------|:-----|:------|
| 1 | 🔴 Critical | SQL Injection — string concatenation in login | `server.js` line 75 |
| 2 | 🔴 High | Hardcoded secret in source code | `server.js` line 8 |
| 3 | 🔴 High | No input validation on POST /cards | `server.js` line 39 |
| 4 | 🔴 Critical | XSS — raw user input stored & returned | `server.js` line 43 |
| 5 | 🟡 Medium | No enum validation on `category` field | `server.js` line 44 |
| 6 | 🟡 Medium | Regex injection via query param | `server.js` line 58 |
| 7 | 🟡 Medium | Error response leaks server internals | `server.js` line 69-74 |
| 8 | 🔴 High | No authentication on DELETE endpoint | `server.js` line 79 |
| 9 | 🔴 Critical | `/debug` endpoint exposes env + secrets | `server.js` line 95 |

---

## Exercise Workflow

**Step 1 — Run Security Audit**
```
/security-review
```

**Step 2 — Review Findings**
Claude will identify all 9 vulnerabilities with location, severity, and fix suggestions.

**Step 3 — Fix One by One**
Apply fixes surgically, test after each change, then commit.

---

## Endpoints

| Method | Path | Notes |
|:-------|:-----|:------|
| GET | `/health` | Status check |
| GET | `/boards` | List boards |
| POST | `/cards` | Create card (vulnerable) |
| GET | `/cards` | List cards (vulnerable filter) |
| GET | `/cards/:id` | Get card (leaks info on 404) |
| DELETE | `/cards/:id` | Delete card (no auth) |
| POST | `/cards/:id/vote` | Vote on card |
| POST | `/login` | **Critical** — SQL injection |
| GET | `/debug` | **Critical** — exposes everything |

---

*Part of the AI-Accelerated Software Development Workshop*
