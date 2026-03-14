---
description: Browse, search and use installed awesome-skills
---

# Skills Browser

When the user runs `/skills`, follow these steps:

## 1. If user provides a keyword (e.g. `/skills react`, `/skills seo`):
// turbo
Search for matching skills:
```
cmd /c "dir /b C:\Users\xviri\.gemini\antigravity\skills\antigravity-awesome-skills\skills | findstr /i <keyword>"
```
Then show the matching skill names in a clean table format with a brief description (read the first few lines of each matching SKILL.md).

## 2. If user just runs `/skills` with no keyword:
Show this categorized quick reference of the most popular skills:

### 🎨 Design & UI
| Skill | Use for |
|-------|---------|
| `frontend-design` | Thiết kế giao diện web đẹp |
| `ui-ux-pro-max` | UI/UX chuyên sâu |
| `canvas-design` | Thiết kế đồ họa |
| `mobile-design` | Thiết kế mobile app |
| `tailwind-design-system` | Design system với Tailwind |
| `theme-factory` | Tạo theme/skin |
| `scroll-experience` | Scroll animations |

### ⚛️ Frontend Development
| Skill | Use for |
|-------|---------|
| `react-best-practices` | React patterns & best practices |
| `nextjs-best-practices` | Next.js App Router |
| `angular-best-practices` | Angular |
| `vue3-composition` | Vue 3 |
| `typescript-pro` | TypeScript nâng cao |
| `javascript-pro` | JavaScript thuần |

### 🔧 Backend & Database
| Skill | Use for |
|-------|---------|
| `backend-architect` | Kiến trúc backend |
| `fastapi-pro` | FastAPI Python |
| `nodejs-best-practices` | Node.js |
| `database-design` | Thiết kế database |
| `postgresql-optimization` | Tối ưu PostgreSQL |
| `prisma-expert` | Prisma ORM |

### 🤖 AI & Agents
| Skill | Use for |
|-------|---------|
| `rag-engineer` | RAG pipeline |
| `prompt-engineering` | Prompt engineering |
| `langgraph` | LangGraph agents |
| `ai-engineer` | AI/ML development |
| `voice-agents` | Voice AI |

### 🔒 Security
| Skill | Use for |
|-------|---------|
| `security-audit` | Audit bảo mật |
| `ethical-hacking-methodology` | Pentest methodology |
| `web-security-testing` | Test bảo mật web |

### 📈 Marketing & SEO
| Skill | Use for |
|-------|---------|
| `seo-audit` | Kiểm tra SEO |
| `copywriting` | Viết copy |
| `page-cro` | Tối ưu conversion |
| `content-marketer` | Content marketing |

### 🔌 Integrations
| Skill | Use for |
|-------|---------|
| `stripe-integration` | Thanh toán Stripe |
| `firebase` | Firebase |
| `clerk-auth` | Authentication |
| `supabase-automation` | Supabase |
| `telegram-bot-builder` | Telegram bot |
| `discord-bot-architect` | Discord bot |

### 📄 Documents
| Skill | Use for |
|-------|---------|
| `docx-official` | Tạo/đọc Word |
| `xlsx-official` | Tạo/đọc Excel |
| `pdf-official` | Tạo/đọc PDF |
| `pptx-official` | Tạo/đọc PowerPoint |

### 🛠️ DevOps & Deployment
| Skill | Use for |
|-------|---------|
| `docker-expert` | Docker |
| `kubernetes-architect` | Kubernetes |
| `terraform-specialist` | Terraform IaC |
| `github-actions-templates` | CI/CD GitHub Actions |

### 💡 Productivity
| Skill | Use for |
|-------|---------|
| `brainstorming` | Brainstorm ý tưởng |
| `systematic-debugging` | Debug có hệ thống |
| `test-driven-development` | TDD workflow |
| `code-reviewer` | Review code |
| `skill-creator` | Tạo skill mới |

## 3. When user picks a skill:
Read the SKILL.md file from `C:\Users\xviri\.gemini\antigravity\skills\antigravity-awesome-skills\skills\<skill-name>\SKILL.md` and follow its instructions to help the user.

## 4. Tips to tell the user:
- Gõ `/skills <keyword>` để tìm skill (ví dụ: `/skills react`, `/skills seo`, `/skills telegram`)
- Gõ tên skill trực tiếp trong chat: "dùng skill brainstorming" hoặc "dùng skill frontend-design"
- Tổng cộng có **989 skills** sẵn dùng
