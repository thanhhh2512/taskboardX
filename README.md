# TaskBoardX

<div align="center">
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/Zustand-000000?style=for-the-badge&logo=zustand&logoColor=white" alt="Zustand" />
  <img src="https://img.shields.io/badge/Shadcn/UI-000000?style=for-the-badge&logo=shadcnui&logoColor=white" alt="Shadcn/UI" />
</div>

<div align="center">
  <h3>A powerful, modern project management application with a focus on user experience</h3>
</div>

![TaskBoardX Screenshot](https://via.placeholder.com/800x400?text=TaskBoardX+Screenshot)

## ✨ Features

- **Project Management**: Create, edit, and organize projects
- **Task Tracking**: Manage tasks with status updates (Todo, In Progress, Done)
- **Team Collaboration**: Add team members to projects for better collaboration
- **Assignee Management**: Assign tasks to project members
- **Modern UI**: Beautiful and responsive design with dark mode support
- **Real-time Updates**: Stay synchronized with your team's progress

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or later)
- pnpm (v8 or later)

### Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/taskboardx.git
cd taskboardx
```

2. Install dependencies

```bash
pnpm install
```

3. Start the development server

```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🧩 Project Structure

TaskBoardX uses a monorepo structure with:

```
├── apps/
│   └── web/            # Next.js web application
├── packages/
│   ├── ui/             # Shared UI components using shadcn/ui
│   └── types/          # Shared TypeScript types
```

## 🔧 Using Components

TaskBoardX uses shadcn/ui components. To add components to your app:

```bash
pnpm dlx shadcn@latest add <component-name> -c apps/web
```

Example:

```bash
pnpm dlx shadcn@latest add button -c apps/web
```

Import components in your app:

```tsx
import { Button } from "@workspace/ui/components/button";
```

## 🔄 Data Flow

TaskBoardX implements a synchronized data flow between projects and tasks:

1. **Project Creation**: Create projects to organize your work
2. **Team Management**: Add users to projects to make them available as assignees
3. **Task Assignment**: Assign tasks to project members
4. **Progress Tracking**: Update task status and track progress

## 🌙 Dark Mode

TaskBoardX supports both light and dark modes. Use the toggle in the navigation bar to switch between them.

## 🧪 Testing

Run the test suite:

```bash
pnpm test
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

<div align="center">
  <p>Made with ❤️ by Your Team</p>
</div>
