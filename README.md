# 短剧平台

## 项目结构

```
drama-platform/
├── backend/                  # 后端 API (Nest.js)
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/         # 认证模块 (JWT + TikTok登录)
│   │   │   ├── user/         # 用户模块
│   │   │   ├── drama/        # 剧目模块
│   │   │   ├── episode/      # 剧集模块 (播放 + 解锁)
│   │   │   ├── subscription/ # 订阅模块 (TikTok Minis)
│   │   │   ├── payment/      # 支付模块 (金币充值)
│   │   │   ├── checkin/      # 签到模块
│   │   │   ├── redeem/       # 兑换码模块
│   │   │   ├── admin/        # 管理后台API
│   │   │   └── cdn/          # CDN签名URL服务
│   │   ├── config/           # 配置文件
│   │   ├── common/           # 公共模块 (守卫/装饰器)
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── sql/
│   │   └── init.sql          # 数据库初始化脚本
│   ├── .env                  # 环境变量
│   ├── package.json
│   └── tsconfig.json
├── h5-frontend/              # H5前端 (Vue 3 + Vite)
├── tt-minis/                 # TikTok Minis (Vue 3)
└── admin-frontend/           # 管理后台前端 (Vue 3 + Element Plus)
```

## 快速开始

### 1. 数据库初始化

```bash
mysql -u root -p < backend/sql/init.sql
```

### 2. 配置环境变量

编辑 `backend/.env`，填写数据库、Redis、OSS、CDN等配置。

### 3. 启动后端

```bash
cd backend
npm install
npm run start:dev
```

API 文档: http://localhost:3000/api-docs

## API 接口清单

### 认证
- `POST /api/v1/auth/tiktok/login` - TikTok登录
- `POST /api/v1/auth/h5/login` - H5手机号登录
- `GET /api/v1/auth/profile` - 获取用户信息

### 剧集
- `GET /api/v1/drama/featured` - 首页精选
- `GET /api/v1/drama/new-release` - 新剧上线
- `GET /api/v1/drama/ranking/:type` - 排行榜
- `GET /api/v1/drama/category/:name` - 分类列表
- `GET /api/v1/drama/search` - 搜索
- `GET /api/v1/drama/:id` - 剧集详情

### 播放
- `GET /api/v1/episode/:id/play` - 获取播放信息
- `POST /api/v1/episode/:id/unlock/coins` - 金币解锁
- `POST /api/v1/episode/:id/unlock/ad` - 广告解锁

### 订阅
- `GET /api/v1/subscription/tiers` - 订阅档位
- `POST /api/v1/subscription/create` - 创建订单
- `POST /api/v1/subscription/callback` - 支付回调
- `GET /api/v1/subscription/status` - 订阅状态
- `POST /api/v1/subscription/cancel-auto-renew` - 取消续费

### 支付
- `GET /api/v1/payment/coin-packages` - 金币套餐
- `POST /api/v1/payment/recharge` - 创建充值订单
- `GET /api/v1/payment/orders` - 充值记录
- `GET /api/v1/payment/coin-logs` - 金币变动

### 签到
- `POST /api/v1/checkin` - 每日签到
- `GET /api/v1/checkin/status` - 签到状态

### 兑换码
- `POST /api/v1/redeem` - 兑换

### 管理后台
- `GET /api/v1/admin/dashboard` - 仪表盘
- `GET /api/v1/admin/users` - 用户列表
- `GET /api/v1/admin/subscriptions` - 订阅列表
- `GET /api/v1/admin/subscription-tiers` - 档位列表
- `POST /api/v1/admin/subscription-tiers` - 创建档位
- `PUT /api/v1/admin/subscription-tiers/:id` - 更新档位
