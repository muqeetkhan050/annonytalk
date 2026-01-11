# AnonnyTalk: AI Coding Agent Instructions

## Project Overview
**AnonnyTalk** is an anonymous real-time chat application using a microservices architecture with Docker composition. The system consists of:
- **Frontend** (React 19): Landing page + live chat UI on port 3000
- **Gateway** (Node/Express): API gateway with rate limiting on port 8080
- **Chat Service** (Node/Express + Socket.IO): WebSocket server for real-time messaging on port 3001
- **Data Layer**: MongoDB (persistence) + Redis (pub/sub for multi-instance scaling)

## Architecture & Data Flow
```
Browser → Frontend (React) ↔ Gateway (rate limit) ↔ Chat Service (Socket.IO broadcast)
                                                           ↓
                                         Redis (pub/sub adapter) + MongoDB (history)
```

**Critical Pattern**: Socket.IO connections connect to gateway on port 8080 (`/socket.io` route), which proxies WebSocket (ws/wss) to chat-service:3001. The chat-service uses Redis adapter to broadcast messages across all service instances.

## Key Files & Responsibilities
- **[frontend/src/App.js](frontend/src/App.js)**: Two-route React app (Landing → ChatRoom), Socket.IO client connection, message rendering
- **[chat-service/server.js](chat-service/server.js)**: Socket.IO server, message broadcasting via Redis adapter, auto-generated usernames (Anon-xxxx)
- **[gateway/server.js](gateway/server.js)**: Express rate limiter (60 req/min) + WebSocket proxy middleware
- **[docker-compose.yml](docker-compose.yml)**: Service orchestration with dependency chain (mongodb/redis → chat-service → gateway)

## Development Workflows

### Running the Stack
```bash
docker compose up --build
```
All services start sequentially with proper dependency resolution. Frontend dev server will be at http://localhost:3000.

### Local Frontend Development
In `frontend/` directory (not dockerized during dev):
```bash
npm install && npm start
```
Create-React-App dev server automatically proxies requests (uses http-proxy-middleware configured in dependencies).

### Testing
```bash
npm test  # In frontend directory only
```
Uses React Testing Library v16.3+ with jest-dom assertions.

## Project-Specific Patterns

### 1. Socket.IO Event Broadcasting
The chat-service deliberately uses `io.emit()` (not `socket.emit()`) to broadcast to **all clients across all instances**. This is intentional for the anonymous lobby design.

```javascript
// This reaches every client, everywhere:
io.emit('receive_message', { text, sender, time })
```

When modifying: preserve this pattern for lobby-wide messages. Use `socket.emit()` only for private/unicast events (if added).

### 2. Anonymous Identity Pattern
Usernames are auto-generated as `Anon-{first4CharsOfSocketId}`. There is no auth layer—this is by design. Never add user identity persistence or auth without architectural discussion.

### 3. Docker Service Communication
Services resolve via service names as hostnames (e.g., `mongodb://mongodb:27017`). Environment variables are set in docker-compose.yml. When adding new services:
- Add to docker-compose.yml with proper dependency order
- Use service name for internal networking (not localhost)
- Expose ports only for external access

### 4. React Router Setup
Two routes only: `/` (LandingPage) → `/chat` (ChatRoom). The global Socket.IO connection is initialized at module level, not per-route. This ensures persistent connection when navigating.

```javascript
const socket = io('http://localhost:8080', { transports: ['websocket'] });
// Available in all components without re-initialization
```

## Common Tasks & Patterns

### Adding a New Event Type
1. Emit from frontend: `socket.emit('event_name', data)`
2. Listen in chat-service: `socket.on('event_name', handler)`
3. Broadcast if needed: `io.emit('event_response', response)`
4. Update frontend listener: `socket.on('event_response', handler)`

### Persisting Messages
MongoDB is available but currently unused. To add persistence:
- Chat-service has access via `MONGO_URL` env variable
- Modify chat-service to connect (e.g., mongoose) and save messages on `send_message` event
- Load history on client connect and emit via `load_history` event (infrastructure already exists)

### Rate Limiting
Gateway enforces 60 requests/minute. For testing, temporarily increase in `gateway/server.js` or bypass via internal calls.

## Common Pitfalls & Solutions

| Issue | Root Cause | Solution |
|-------|-----------|----------|
| "Cannot find socket.io module" | Frontend Node modules missing | Run `npm install` in frontend/ directory |
| Messages not reaching other clients | Chat-service instance not using Redis adapter | Verify REDIS_URL env var and redis service health |
| Port 8080/3000/3001 already in use | Previous Docker/process still running | `docker compose down` then restart |
| CORS errors | frontend client connecting directly to chat-service without gateway | Ensure frontend connects to gateway port 8080 |

## External Dependencies
- **socket.io** v4.8.3 (WebSocket + fallback transport)
- **react-router-dom** v7.12.0 (lightweight routing)
- **express** (implicit, via http-proxy-middleware)
- **redis** (via createClient from node-redis)
- **MongoDB** (exposed but not yet utilized in code)

## Notes for AI Agents
- Do NOT assume create-react-app build structure; use react-scripts npm scripts
- Changes to docker-compose.yml require full rebuild: `docker compose up --build`
- Message history feature is scaffolded but not implemented—adding it requires MongoDB integration
- Test changes in browser DevTools console to verify Socket.IO events before committing
