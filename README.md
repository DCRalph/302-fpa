# 302 FPA


A modern conference registration and management platform built with Next.js, featuring authentication, payment processing, and comprehensive admin tools for managing registrations, tickets, and attendees.

## Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) with App Router
- **Language:** TypeScript
- **Database:** PostgreSQL with [Prisma ORM](https://www.prisma.io/)
- **Authentication:** [Stack Auth](https://stack-auth.com/)
- **API:** [tRPC](https://trpc.io/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [Radix UI](https://www.radix-ui.com/)
- **Package Manager:** [Bun](https://bun.sh/)
- **State Management:** [TanStack Query](https://tanstack.com/query)

## Features

- Secure authentication with Stack Auth
- User onboarding flow
- Conference registration system
- Ticket management (early-bird, standard, student)
- Admin dashboard for managing registrations
- Member dashboard for attendees
- Blog system with categories and tags
- Comment system
- Newsletter subscription
- Contact form management
- Dark/Light theme support
- Fully responsive design

## Prerequisites

Before you begin, ensure you have the following installed:

- [Bun](https://bun.sh/) (v1.2.20 or higher)
- [PostgreSQL](https://www.postgresql.org/) (v14 or higher)
- [Node.js](https://nodejs.org/) (v20 or higher) - Required for some dependencies
- A [Stack Auth](https://stack-auth.com/) account

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/fpa302?schema=public"

# Stack Auth Configuration
# Get these from your Stack Auth dashboard: https://app.stack-auth.com/
NEXT_PUBLIC_STACK_API_URL="https://api.stack-auth.com"
NEXT_PUBLIC_STACK_PROJECT_ID="your-stack-project-id"
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY="your-publishable-client-key"
STACK_SECRET_SERVER_KEY="your-secret-server-key"
```

### Environment Variable Descriptions

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL database connection string | Yes |
| `NEXT_PUBLIC_STACK_API_URL` | Stack Auth API endpoint URL | Yes |
| `NEXT_PUBLIC_STACK_PROJECT_ID` | Your Stack Auth project identifier | Yes |
| `NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY` | Stack Auth client-side publishable key | Yes |
| `STACK_SECRET_SERVER_KEY` | Stack Auth server-side secret key (keep secure!) | Yes |

> **Note:** Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. Never put sensitive secrets in these variables.

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/302-fpa.git
   cd 302-fpa
   ```

2. **Install dependencies:**
   ```bash
   bun install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` with your actual values.

4. **Set up the database:**

   First, create a PostgreSQL database

   Then run Prisma migrations:
   ```bash
   bun run db:generate
   ```

   Or push the schema directly to the database:
   ```bash
   bun run db:push
   ```

5. **Set up Stack Auth:**
   - Sign up at [Stack Auth](https://stack-auth.com/)
   - Create a new project
   - Copy your project credentials to your `.env` file
   - Configure your callback URLs in Stack Auth dashboard:
     - Development: `http://localhost:3000/handler`
     - Production: `https://yourdomain.com/handler`

## Development

Start the development server:

```bash
bun run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

### Useful Development Commands

| Command | Description |
|---------|-------------|
| `bun run dev` | Start development server |
| `bun run build` | Build for production |
| `bun run start` | Start production server |
| `bun run lint` | Run ESLint |
| `bun run lint:fix` | Fix ESLint errors |
| `bun run format:check` | Check code formatting |
| `bun run format:write` | Format code with Prettier |
| `bun run typecheck` | Run TypeScript type checking |
| `bun run check` | Run linting and type checking |
| `bun run db:studio` | Open Prisma Studio (database GUI) |
| `bun run db:generate` | Generate Prisma client and run migrations |
| `bun run db:migrate` | Deploy migrations to production |
| `bun run db:push` | Push schema changes to database (dev only) |

## Database Management

### View Database with Prisma Studio

```bash
bun run db:studio
```

This opens a GUI at [http://localhost:5555](http://localhost:5555) to view and edit your database.

### Creating Migrations

After modifying `prisma/schema.prisma`:

```bash
bun run db:generate
```

### Reset Database (Development Only)

```bash
bunx prisma migrate reset
```

> **⚠️ Warning:** This will delete all data in your database.

## Building for Production

1. **Build the application:**
   ```bash
   bun run build
   ```

2. **Test the production build locally:**
   ```bash
   bun run preview
   ```

## Deployment

### Deploy to Vercel (Recommended)

1. **Install Vercel CLI:**
   ```bash
   bun add -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

3. **Set environment variables in Vercel:**
   - Go to your project settings in Vercel dashboard
   - Navigate to "Environment Variables"
   - Add all variables from your `.env` file

4. **Configure Vercel project:**
   - Build Command: `bun run build`
   - Output Directory: `.next`
   - Install Command: `bun install`

### Deploy to Other Platforms

This is a standard Next.js application and can be deployed to:
- [Netlify](https://www.netlify.com/)
- [Railway](https://railway.app/)
- [DigitalOcean App Platform](https://www.digitalocean.com/products/app-platform)
- Self-hosted with Docker

### Database Deployment

For production, you'll need a PostgreSQL database. Options include:
- [Vercel Postgres](https://vercel.com/storage/postgres)
- [Supabase](https://supabase.com/)
- [Railway](https://railway.app/)
- [Neon](https://neon.tech/)
- [PlanetScale](https://planetscale.com/) (with MySQL adapter)

Remember to run migrations after deploying:

```bash
bun run db:migrate
```

## Project Structure

```
302-fpa/
├── prisma/
│   └── schema.prisma          # Database schema
├── public/                    # Static assets
├── src/
│   ├── app/                   # Next.js App Router pages
│   │   ├── admin-dashboard/   # Admin interface
│   │   ├── member-dashboard/  # User interface
│   │   ├── onboarding/        # User onboarding flow
│   │   └── api/               # API routes
│   ├── components/            # React components
│   │   ├── ui/                # UI primitives
│   │   └── landing/           # Landing page sections
│   ├── lib/                   # Utility functions
│   ├── server/                # Server-side code
│   │   └── api/               # tRPC routers
│   └── styles/                # Global styles
└── .env                       # Environment variables
```

## Authentication Flow

This application uses Stack Auth for authentication:

1. Users sign up/sign in via Stack Auth
2. Stack Auth handles OAuth, email verification, etc.
3. User data syncs to local database via webhook
4. Onboarding flow captures additional information
5. Users are redirected to appropriate dashboard

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Submit a pull request

## Troubleshooting

### Database Connection Issues

If you encounter database connection errors:
1. Verify PostgreSQL is running: `psql -U postgres`
2. Check your `DATABASE_URL` format
3. Ensure the database exists: `createdb fpa302`
4. Try running: `bun run db:push`

### Prisma Client Not Found

Run:
```bash
bun run postinstall
```

### Stack Auth Issues

1. Verify all Stack Auth environment variables are set correctly
2. Check callback URLs in Stack Auth dashboard match your domain
3. Ensure `STACK_SECRET_SERVER_KEY` is kept secret and never committed

### Port Already in Use

If port 3000 is in use, start the dev server on a different port:
```bash
PORT=3001 bun run dev
```

## License

[Add your license here]


## Acknowledgments

- Built with [Create T3 App](https://create.t3.gg/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)

.
