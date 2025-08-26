# Playmats Ecuador

E-commerce web application for customizable gaming playmats in Ecuador.

![Playmats Ecuador Logo](./public/images/Playmats-EC-Logo.png)

## 🚀 Project Description

Playmats Ecuador is an e-commerce platform built with Astro and React that allows users to:
- Browse a catalog of gaming playmats
- Customize their own playmats with a fabric canvas editor
- Add products to cart and complete the purchase process
- Track their orders
- Interact with a chatbot for support

The platform also includes an admin dashboard for managing products, categories, orders and resources.

## 🚀 Project Structure

```text
/
├── public/
│   ├── favicon.svg
│   ├── fonts/
│   └── images/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── Admin/
│   │   ├── Customization/
│   │   ├── Landing/
│   │   ├── Payment/
│   │   ├── ui/
│   │   └── ...
│   ├── hooks/
│   ├── layouts/
│   ├── lib/
│   ├── pages/
│   │   ├── admin/
│   │   ├── playmats/
│   │   └── ...
│   ├── services/
│   ├── stores/
│   ├── styles/
│   ├── tests/
│   └── types/
└── package.json
```

## 🛠️ Technologies Used

- **Framework**: [Astro](https://astro.build/) with [React](https://reactjs.org/) islands
- **Authentication**: [Clerk](https://clerk.dev/)
- **Styling**: [TailwindCSS](https://tailwindcss.com/)
- **UI Components**: Custom components built with [Radix UI](https://www.radix-ui.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Forms**: [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/) validation
- **Canvas Editing**: [Fabric.js](http://fabricjs.com/)
- **Deployment**: [Vercel](https://vercel.com/)
- **Testing**: [Vitest](https://vitest.dev/)

## 🧞 Commands

All commands are run from the root of the project using pnpm:

| Command                  | Action                                           |
| :----------------------- | :----------------------------------------------- |
| `pnpm install`           | Installs dependencies                            |
| `pnpm dev`               | Starts local dev server at `localhost:4321`      |
| `pnpm build`             | Build your production site to `./dist/`          |
| `pnpm preview`           | Preview your build locally, before deploying     |
| `pnpm test`              | Run tests using Vitest                           |
| `pnpm test:coverage`     | Run tests with coverage report                   |
| `pnpm astro ...`         | Run CLI commands like `astro add`, `astro check` |

## 🔒 Environment Variables

To run this project, you will need to add the following environment variables to your `.env` file:

```
PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=
```

## 👨‍� Development

1. Clone the repository
2. Install dependencies with `pnpm install`
3. Create a `.env` file with the required environment variables
4. Run the development server with `pnpm dev`

## 🚀 Deployment

This project is deployed on Vercel. Each commit to the main branch triggers an automatic deployment.
