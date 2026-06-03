# 📚 Nexcoin Complete Documentation

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    NEXCOIN ECOSYSTEM                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐         ┌──────────────────┐         │
│  │  MULTICHAIN      │         │   TODO APP       │         │
│  │  WALLET          │         │   (LocalStorage) │         │
│  └──────────────────┘         └──────────────────┘         │
│         │                              │                    │
│    ┌────┴────────────┬─────────────┐   │                    │
│    │                 │             │   │                    │
│  BACKEND         MOBILE        CONTRACTS                    │
│  (Node.js)      (React Native) (Solidity)                  │
│  ├─ Express      ├─ Screens      ├─ TreasuryToken          │
│  ├─ PostgreSQL   ├─ Components   └─ Access Control         │
│  ├─ Prisma       ├─ Services                                │
│  ├─ Auth         └─ UI (Trust Wallet)                       │
│  └─ API                                                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📂 Project Structure

### MultiChain Wallet - Backend

```
multichain-wallet/backend/
├── src/
│   ├── server.ts              # Express server entry point
│   ├── middleware/
│   │   ├── rateLimit.ts      # Rate limiting middleware
│   │   └── deviceAuth.ts     # HMAC-SHA256 authentication
│   ├── routes/
│   │   ├── vault.ts          # Vault management endpoints
│   │   ├── wallet.ts         # Wallet info endpoints
│   │   ├── lockout.ts        # Device lockout endpoints
│   │   └── transactions.ts   # Transaction history
│   └── services/
│       ├── vaultService.ts   # Vault business logic
│       └── lockoutService.ts # Lockout management
├── prisma/
│   └── schema.prisma         # Database schema
├── Dockerfile                # Docker configuration
├── docker-compose.yml        # Multi-container setup
├── nginx.conf                # Reverse proxy config
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript config
└── .env.example              # Environment template
```

### Todo App

```
todo-app/
├── index.html                # Main HTML structure
├── css/
│   ├── styles.css            # Main styling
│   └── dark-mode.css         # Dark theme
├── js/
│   ├── app.js                # Main app logic
│   ├── storage.js            # localStorage wrapper
│   ├── ui.js                 # DOM manipulation
│   ├── utils.js              # Utility functions
│   └── constants.js          # Constants
└── README.md                 # Todo app docs
```

---

## 🔐 Security Features

### Device Authentication
```typescript
// HMAC-SHA256 based authentication
const signature = HMAC_SHA256(deviceId, HMAC_SECRET);
headers: {
  'x-device-id': deviceId,
  'x-device-signature': signature
}
```

### Lockout System
```
Attempt 1 → 1 min lock
Attempt 2 → 2 min lock  
Attempt 3 → 4 min lock
Attempt 4 → 8 min lock
Attempt 5+ → Permanent lock
```

### Data Encryption
- Device credentials stored encrypted on mobile
- Private keys never leave device
- Vault mnemonic verified server-side only

---

## 🗄️ Database Schema

### User
```sql
id: String (Primary Key)
deviceId: String (Unique)
encryptedSeed: String (Optional)
isVaultAdmin: Boolean
lastLogin: DateTime
createdAt: DateTime
updatedAt: DateTime
```

### Lockout
```sql
id: String (Primary Key)
deviceId: String (Unique, Foreign Key)
attempts: Int
lockUntil: DateTime (Optional)
permanentLock: Boolean
```

### Transaction
```sql
id: String (Primary Key)
userId: String (Foreign Key)
fromAddress: String
toAddress: String
amount: String
tokenSymbol: String
chain: String
txHash: String (Unique)
status: String
gasUsed: String (Optional)
gasPrice: String (Optional)
nonce: Int (Optional)
```

---

## 📊 API Reference

### Vault Endpoints

#### Login with Mnemonic
```http
POST /api/vault/login
X-Device-ID: device-uuid
X-Device-Signature: hmac-signature

{
  "mnemonic": "abandon abandon ..."
}

Response:
{
  "success": true,
  "wallets": {
    "ethereum": "0x...",
    "solana": "...",
    "tron": "..."
  },
  "balances": {
    "ETH": "1000000000000000000000000000",
    ...
  }
}
```

#### Check Vault Status
```http
GET /api/vault/status
X-Device-ID: device-uuid
X-Device-Signature: hmac-signature

Response:
{
  "isVaultAdmin": true,
  "lastLogin": "2024-01-01T10:00:00Z"
}
```

### Wallet Endpoints

#### Get Wallet Info
```http
GET /api/wallet/info
X-Device-ID: device-uuid
X-Device-Signature: hmac-signature

Response:
{
  "deviceId": "...",
  "isVaultAdmin": true,
  "createdAt": "2024-01-01T10:00:00Z",
  "lastLogin": "2024-01-02T10:00:00Z"
}
```

#### Get Token Balance
```http
GET /api/wallet/balance?chain=ETH
X-Device-ID: device-uuid
X-Device-Signature: hmac-signature

Response:
{
  "chain": "ETH",
  "balance": "10.5",
  "decimals": 18,
  "symbol": "ETH"
}
```

### Lockout Endpoints

#### Check Device Lockout Status
```http
GET /api/lockout/status
X-Device-ID: device-uuid
X-Device-Signature: hmac-signature

Response:
{
  "isLocked": false,
  "attempts": 0,
  "lockUntil": null,
  "permanentLock": false,
  "remainingSeconds": 0
}
```

### Transaction Endpoints

#### Get Transaction History
```http
GET /api/transactions/history?limit=50&skip=0
X-Device-ID: device-uuid
X-Device-Signature: hmac-signature

Response:
{
  "transactions": [...],
  "total": 100,
  "limit": 50,
  "skip": 0
}
```

#### Send Transaction
```http
POST /api/transactions/send
X-Device-ID: device-uuid
X-Device-Signature: hmac-signature

{
  "toAddress": "0x...",
  "amount": "1.5",
  "tokenSymbol": "ETH",
  "chain": "ethereum"
}

Response:
{
  "success": true,
  "transaction": {...},
  "message": "Transaction initiated"
}
```

---

## 💾 Local Storage (Todo App)

### Data Structure
```javascript
{
  todos: [
    {
      id: "todo-1234567890-abc123",
      title: "Task name",
      category: "Work",
      priority: "high",
      dueDate: "2024-12-31",
      completed: false,
      createdAt: "2024-01-01T10:00:00Z",
      updatedAt: "2024-01-01T10:00:00Z"
    }
  ],
  settings: {
    darkMode: true,
    sortBy: "dueDate",
    filterBy: "all"
  }
}
```

### Storage Methods
```javascript
// Save todos
TodoStorage.saveTodos(todos);

// Get all todos
TodoStorage.getTodos();

// Add todo
TodoStorage.addTodo(todo);

// Update todo
TodoStorage.updateTodo(id, updates);

// Delete todo
TodoStorage.deleteTodo(id);

// Export data
const json = TodoStorage.exportData();

// Import data
TodoStorage.importData(jsonString);
```

---

## 🚀 Deployment Guide

### Prerequisites
- Ubuntu 22.04 LTS
- Node.js 18+
- PostgreSQL 14+
- Nginx
- SSL Certificate (Let's Encrypt)

### Step 1: Server Setup
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y nodejs npm postgresql nginx git

# Create app directory
mkdir -p /var/www/nexcoin
cd /var/www/nexcoin
```

### Step 2: Clone & Install
```bash
git clone https://github.com/nexoraapk-art/Nexcoin.git
cd Nexcoin/multichain-wallet/backend

npm install
npm run build
npx prisma migrate deploy
```

### Step 3: Environment Setup
```bash
cp .env.example .env
# Edit .env with production values
```

### Step 4: PM2 Setup
```bash
npm install -g pm2
pm2 start dist/server.js --name nexcoin-api
pm2 save
pm2 startup
```

### Step 5: Nginx Configuration
```bash
sudo cp nginx.conf /etc/nginx/sites-available/nexcoin
sudo ln -s /etc/nginx/sites-available/nexcoin /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 6: SSL Certificate
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```

---

## 🧪 Testing

### Manual API Testing
```bash
# Health check
curl http://localhost:3000/health

# Login to vault
curl -X POST http://localhost:3000/api/vault/login \
  -H "Content-Type: application/json" \
  -H "X-Device-ID: test-device" \
  -H "X-Device-Signature: signature" \
  -d '{"mnemonic": "abandon abandon ..."}'
```

### Todo App Testing
1. Open `todo-app/index.html` in browser
2. Add tasks with different categories and priorities
3. Test dark mode toggle
4. Export and import data
5. Clear browser cache to test persistence

---

## 📈 Performance Tips

### Backend Optimization
- Enable Redis caching
- Use connection pooling
- Implement request batching
- Add CDN for static assets

### Frontend Optimization
- Lazy load components
- Minimize bundle size
- Cache API responses
- Optimize images

---

## 🔄 Version Control

### Branch Strategy
```
main → Production
  ├── develop → Development
  │   ├── feature/* → Features
  │   ├── bugfix/* → Bug fixes
  │   └── hotfix/* → Hotfixes
```

### Commit Convention
```
feat: Add new feature
fix: Fix a bug
docs: Documentation changes
style: Code style changes
refactor: Code refactoring
test: Add tests
chore: Maintenance
```

---

## 📞 Support & Troubleshooting

### Common Issues

**Database Connection Error**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Restart PostgreSQL
sudo systemctl restart postgresql
```

**Port Already in Use**
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 PID
```

**CORS Error**
```bash
# Update CORS_ORIGIN in .env
CORS_ORIGIN=https://yourdomain.com
```

---

## 📄 License

MIT License - Free for personal and commercial use

---

**Created:** 2026-06-03  
**Version:** 1.0.0  
**Status:** ✅ Production Ready

