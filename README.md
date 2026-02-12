# Singapore Airlines Roblox - Staff Portal

A comprehensive staff and server management portal built with Next.js, TypeScript, and Tailwind CSS for Singapore Airlines Roblox operations.

## Features

- 🔐 **Authentication** - Secure staff login with session management
- 👥 **Staff Directory** - Searchable staff profiles with departments and status
- 🖥️ **Server Dashboard** - Real-time server monitoring and performance metrics
- 📢 **Announcements** - Staff communications and important updates
- 📚 **Documentation** - Comprehensive guides and operational procedures
- 🎨 **Singapore Airlines Branding** - Official color scheme (Dark Blue #003D82 and Gold #D4AF37)

## Tech Stack

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom React components
- **Server Runtime**: Node.js

## Project Structure

```
src/
├── app/
│   ├── page.tsx                 # Dashboard & login
│   ├── layout.tsx               # Root layout
│   ├── globals.css              # Global styles
│   ├── staff/
│   │   └── page.tsx             # Staff directory
│   ├── servers/
│   │   └── page.tsx             # Server status
│   ├── announcements/
│   │   └── page.tsx             # Announcements
│   └── docs/
│       └── page.tsx             # Documentation
├── components/                  # Reusable components
└── lib/                         # Utilities & helpers

tailwind.config.ts              # Tailwind customization
tsconfig.json                   # TypeScript config
```

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env.local` file (if needed):
   ```
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Login
- Demo credentials: Use any username and password combination
- The portal will authenticate on the client side for demo purposes

### Navigation
- **Dashboard**: Overview of all systems and quick access
- **Staff Directory**: Search and filter staff by name, role, or department
- **Server Status**: Monitor CPU, memory, network, and player counts
- **Announcements**: Read important updates and operational changes
- **Documentation**: Access guides and procedural information

## Color Scheme

Singapore Airlines official colors:
- **Primary**: Dark Blue (#003D82)
- **Accent**: Gold (#D4AF37)
- **Light**: #F0F0F0

## Development

### Running in Development Mode
```bash
npm run dev
```

### Building for Production
```bash
npm run build
npm run start
```

### Linting
```bash
npm run lint
```

## Features to Add

- Real database integration
- Advanced authentication system
- Real-time server monitoring with WebSockets
- Staff management API
- File upload capabilities
- Dark mode toggle
- Mobile app version
- Email notifications

## License

Private - Singapore Airlines Roblox Operations

## Support

For issues or questions, contact the IT department.
