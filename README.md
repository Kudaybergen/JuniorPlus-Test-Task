# Notes Application

A full-stack notes management application with Vue.js frontend, Node.js/Express backend, and PostgreSQL database.

## 🏗️ Architecture

- **Frontend**: Vue.js 3 + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL
- **Containerization**: Docker + Docker Compose

## 🚀 Quick Start with Docker Compose

### Prerequisites

- [Docker](https://www.docker.com/get-started) installed on your system
- [Docker Compose](https://docs.docker.com/compose/install/) (usually included with Docker Desktop)

### Running the Application

1. **Clone the repository** (if not already done):
   ```bash
   git clone <repository-url>
   cd JuniorPlus-Test-Task
   ```

2. **Start all services** with Docker Compose:
   ```bash
   docker-compose up --build
   ```

3. **Access the application**:
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:5000
   - **API Documentation**: http://localhost:5000/api-docs

### 🐳 Docker Services

The application consists of three containerized services:

| Service | Container Name | Port | Description |
|---------|---------------|------|-------------|
| **Frontend** | `testTastFrontend` | 3000 | Vue.js development server with hot reload |
| **Backend** | `testTastBackend` | 5000 | Node.js/Express API server |
| **Database** | `testTastPostgres` | 5432 | PostgreSQL database |

### 📋 Available Commands

#### Start Services
```bash
# Start all services
docker-compose up

# Start services in background
docker-compose up -d

# Rebuild and start services
docker-compose up --build
```

#### Stop Services
```bash
# Stop all services
docker-compose down

# Stop services and remove volumes
docker-compose down -v
```

#### View Logs
```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs frontend
docker-compose logs backend
docker-compose logs postgres

# Follow logs in real-time
docker-compose logs -f frontend
```

#### Development Commands
```bash
# Rebuild specific service
docker-compose up --build frontend

# Execute commands in running container
docker-compose exec frontend npm install
docker-compose exec backend npm run migration:run
```

### 🔧 Development Workflow

1. **Make changes** to your code
2. **Frontend changes** are automatically reflected (hot reload enabled)
3. **Backend changes** require container restart:
   ```bash
   docker-compose restart backend
   ```
4. **Database changes** require migration:
   ```bash
   docker-compose exec backend npm run migration:run
   ```

### 🌐 API Endpoints

The backend provides the following REST API endpoints:

#### Notes
- `GET /notes` - Get all notes
- `GET /notes/:id` - Get note by ID
- `POST /notes` - Create new note
- `PUT /notes/:id` - Update note
- `DELETE /notes/:id` - Delete note
- `GET /notes/category/:categoryId` - Get notes by category
- `DELETE /notes/category/:categoryId` - Delete all notes in category

#### Categories
- `GET /notes-category` - Get all categories
- `GET /notes-category/:id` - Get category by ID
- `POST /notes-category` - Create new category
- `PUT /notes-category/:id` - Update category
- `DELETE /notes-category/:id` - Delete category

#### Health Check
- `GET /health` - Health check endpoint

### 🗄️ Database Schema

The application uses PostgreSQL with the following main entities:

- **Notes**: `id`, `title`, `content`, `categoryId`, `createdAt`, `updatedAt`
- **NotesCategory**: `id`, `name`, `createdAt`, `updatedAt`

### 🔒 Environment Variables

The application uses the following environment variables:

#### Backend (.env)
```env
PORT=5000
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=techworks_user
DB_PASSWORD=techworks_password
DB_NAME=techworks_db
NODE_ENV=development
```

#### Frontend (Environment Variables)
```env
VITE_API_BASE_URL=http://localhost:5000
```

### 🐛 Troubleshooting

#### Common Issues

1. **Port already in use**:
   ```bash
   # Check what's using the port
   netstat -ano | findstr :3000
   netstat -ano | findstr :5000
   
   # Stop conflicting services or change ports in docker-compose.yml
   ```

2. **Container won't start**:
   ```bash
   # Check container logs
   docker-compose logs <service-name>
   
   # Rebuild containers
   docker-compose down
   docker-compose up --build
   ```

3. **Database connection issues**:
   ```bash
   # Check if database is running
   docker-compose ps
   
   # Restart database
   docker-compose restart postgres
   ```

4. **Frontend not loading**:
   ```bash
   # Check frontend logs
   docker-compose logs frontend
   
   # Verify frontend container is running
   docker ps | grep frontend
   ```

#### Reset Everything
```bash
# Stop all services and remove volumes
docker-compose down -v

# Remove all containers and images
docker system prune -a

# Start fresh
docker-compose up --build
```

### 📁 Project Structure

```
JuniorPlus-Test-Task/
├── front/                    # Vue.js frontend
│   ├── src/
│   │   ├── components/       # Vue components
│   │   ├── views/           # Page components
│   │   ├── stores/          # Pinia stores
│   │   ├── services/        # API services
│   │   └── router/          # Vue Router
│   ├── Dockerfile           # Frontend container
│   └── package.json
├── src/                     # Node.js backend
│   ├── modules/            # Feature modules
│   ├── config/             # Configuration
│   └── migrations/         # Database migrations
├── docker-compose.yml      # Multi-container setup
├── Dockerfile             # Backend container
└── README.md
```

### 🤝 Contributing

1. Make your changes
2. Test with Docker Compose: `docker-compose up --build`
3. Ensure all services start correctly
4. Submit your changes

### 📝 License

This project is part of a technical assessment.
