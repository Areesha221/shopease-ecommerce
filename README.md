# 🛍️ ShopEase - Complete E-Commerce Platform

A full-stack, production-ready e-commerce web application built with the MERN stack (MongoDB, Express.js, Node.js) featuring advanced shopping capabilities, real-time updates, and a comprehensive admin dashboard.

![Status](https://img.shields.io/badge/Status-Complete-brightgreen)
![License](https://img.shields.io/badge/License-MIT-blue)
![Node](https://img.shields.io/badge/Node.js-v14+-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)

## 🌟 Features

### 👤 **User Features**
- ✅ **JWT Authentication** - Secure login & registration with password hashing
- ✅ **Smart Product Discovery** - Live search, category/price filtering, sorting
- ✅ **Product Details** - Image zoom, stock management, reviews, related products
- ✅ **Shopping Cart** - Real-time badge counter, preview dropdown, quantity management
- ✅ **Wishlist** - Save favorites with instant badge updates
- ✅ **Checkout System** - Complete order summary with printable invoice
- ✅ **Order History** - Track all past orders with status
- ✅ **User Profile** - Personal dashboard with stats
- ✅ **Dark Mode** - Full theme toggle for better accessibility
- ✅ **Recently Viewed** - Track last 5 viewed products

### 🛠️ **Admin Features**
- ✅ **Dashboard Analytics** - Real-time stats (Products, Orders, Users, Revenue)
- ✅ **Product Management** - Full CRUD operations
- ✅ **Order Management** - View, update status (Pending → Processing → Shipped → Delivered)
- ✅ **User Management** - View all users, delete users, change roles (User ↔ Admin)
- ✅ **Revenue Tracking** - Automatic calculation (excludes cancelled orders)

### 🎨 **UI/UX Features**
- ✅ **Responsive Design** - Mobile, tablet, desktop optimized
- ✅ **Micro-interactions** - Smooth animations, hover effects, transitions
- ✅ **Loading States** - Global spinner, skeleton screens
- ✅ **Toast Notifications** - Success/error/info messages
- ✅ **Custom 404 Page** - Professional error handling
- ✅ **Professional Footer** - Newsletter, social links, contact info
- ✅ **Scroll Animations** - Fade-in effects on scroll

## 🛠️ Tech Stack

### **Frontend**
- HTML5, CSS3 (CSS Variables for theming)
- Vanilla JavaScript (ES6+)
- Font Awesome Icons
- Google Fonts (Poppins)

### **Backend**
- Node.js
- Express.js
- JSON Web Tokens (JWT)
- bcryptjs (password hashing)
- CORS (Cross-Origin Resource Sharing)

### **Database**
- MongoDB (MongoDB Atlas)
- Mongoose ODM

### **Deployment**
- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas

## 📂 Project Structure

```
ecommerce-store/
├── backend/
│   ├── config/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── orderController.js
│   │   └── productController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── Order.js
│   │   ├── Product.js
│   │   └── User.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── productRoutes.js
│   │   └── userRoutes.js
│   ├── .env
│   ├── package.json
│   ├── server.js
│   └── test-db.js
├── frontend/
│   ├── index.html
│   ├── products.html
│   ├── product-detail.html
│   ├── cart.html
│   ├── wishlist.html
│   ├── checkout.html
│   ├── orders.html
│   ├── profile.html
│   ├── admin.html
│   ├── 404.html
│   ├── style.css
│   ├── script.js
│   ├── cart.js
│   ├── checkout.js
│   ├── orders.js
│   ├── profile.js
│   ├── wishlist.js
│   ├── admin.js
│   ├── product-detail.js
│   ├── products.js
│   └── toast.js
├── .env
├── .gitignore
├── package.json
└── README.md
```

## 🚀 Installation & Setup

### **Prerequisites**
- Node.js (v14 or higher) - [Download](https://nodejs.org/)
- MongoDB Atlas account (free) - [Sign Up](https://www.mongodb.com/cloud/atlas/register)
- Git - [Download](https://git-scm.com/)

### **1. Clone the Repository**
```bash
git clone https://github.com/Areesha221/shopease-ecommerce.git
cd shopease-ecommerce
```

### **2. MongoDB Atlas Setup**

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster (M0 Free tier)
4. Create a database user:
   - Username: `your_username`
   - Password: `your_password`
   - Role: **Read and write to any database**
5. Whitelist your IP address:
   - Go to **Network Access**
   - Click **Add IP Address**
   - Select **Allow Access from Anywhere** (0.0.0.0/0)
   - Click **Confirm**
6. Get your connection string:
   - Click **Connect** on your cluster
   - Select **Connect your application**
   - Copy the connection string
   - Replace `<password>` with your database user password

### **3. Backend Setup**

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create .env file
echo PORT=3000 > .env
echo MONGO_URI=your_mongodb_connection_string >> .env
echo JWT_SECRET=your_super_secret_key >> .env
echo FRONTEND_URL=http://localhost:5500 >> .env

# Test database connection
node test-db.js

# Start backend server
npm run dev
# or
node server.js
```

Server will run on `http://localhost:3000`

### **4. Frontend Setup**

```bash
# Open frontend folder in VS Code
cd ../frontend

# Install Live Server extension in VS Code
# Right-click index.html → Open with Live Server
```

Frontend will run on `http://localhost:5500`

### **5. Environment Variables**

Create `.env` file in **backend** folder:

```env
# Server Configuration
PORT=3000

# MongoDB Connection
MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/shopease?retryWrites=true&w=majority

# JWT Secret (Generate a strong random string)
JWT_SECRET=your_very_secret_key_here_make_it_long_and_random

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5500
```

**Important Notes:**
- Replace `username` and `password` with your MongoDB Atlas credentials
- Replace `cluster0.xxxxx` with your actual cluster URL
- `JWT_SECRET` should be a long random string (at least 32 characters)
- Never commit `.env` file to Git (it's in `.gitignore`)

## 🌐 API Endpoints

### **Base URL**
```
http://localhost:3000/api
```

### **Authentication Endpoints**

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### **Product Endpoints**

#### Get All Products
```http
GET /api/products
```

#### Get Product by ID
```http
GET /api/products/:id
```

#### Add Product (Admin Only)
```http
POST /api/products
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Product Name",
  "description": "Product description",
  "price": 99.99,
  "stock": 50,
  "category": "Electronics",
  "image": "https://example.com/image.jpg"
}
```

#### Update Product (Admin Only)
```http
PUT /api/products/:id
Authorization: Bearer <token>
```

#### Delete Product (Admin Only)
```http
DELETE /api/products/:id
Authorization: Bearer <token>
```

### **Order Endpoints**

#### Create Order
```http
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "items": [
    {
      "_id": "product_id",
      "name": "Product Name",
      "price": 99.99,
      "quantity": 2,
      "image": "https://example.com/image.jpg"
    }
  ],
  "customer": {
    "fullName": "John Doe",
    "email": "john@example.com",
    "address": "123 Main St",
    "city": "Karachi",
    "postalCode": "74000",
    "phone": "+92 300 1234567"
  },
  "totals": {
    "subtotal": 199.98,
    "shipping": 10,
    "total": 209.98
  }
}
```

#### Get User's Orders
```http
GET /api/orders/my-orders
Authorization: Bearer <token>
```

#### Get All Orders (Admin Only)
```http
GET /api/orders
Authorization: Bearer <token>
```

#### Update Order Status (Admin Only)
```http
PUT /api/orders/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "processing"
}
```

**Status Options:** `pending`, `processing`, `shipped`, `delivered`, `cancelled`

#### Get Admin Stats
```http
GET /api/orders/stats/admin
Authorization: Bearer <token>
```

**Response:**
```json
{
  "totalProducts": 25,
  "totalOrders": 150,
  "totalUsers": 89,
  "totalRevenue": 15420.50
}
```

### **User Endpoints (Admin Only)**

#### Get All Users
```http
GET /api/users
Authorization: Bearer <token>
```

#### Update User Role
```http
PUT /api/users/:id/role
Authorization: Bearer <token>
Content-Type: application/json

{
  "role": "admin"
}
```

#### Delete User
```http
DELETE /api/users/:id
Authorization: Bearer <token>
```

## 🔐 Security Features

- ✅ JWT token-based authentication
- ✅ Password hashing with bcryptjs (10 salt rounds)
- ✅ Protected routes middleware
- ✅ CORS enabled for specific origins
- ✅ Environment variables for sensitive data
- ✅ Input validation and sanitization

## 📱 Responsive Design

- **Mobile:** 320px and up
- **Tablet:** 768px and up
- **Desktop:** 1024px and up
- **Large Desktop:** 1440px and up

## 🌍 Deployment

### **Frontend (Vercel)**
1. Go to [vercel.com](https://vercel.com)
2. Login with GitHub
3. Click **"Add New Project"**
4. Import your repository
5. Set **Root Directory** to `frontend`
6. Click **Deploy**
7. Your site will be live at `https://your-project.vercel.app`

### **Backend (Render)**
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click **"New +"** → **"Web Service"**
4. Connect your repository
5. Set **Root Directory** to `backend`
6. **Build Command:** `npm install`
7. **Start Command:** `node server.js`
8. Add **Environment Variables** (same as `.env` file)
9. Click **Create Web Service**
10. Your API will be live at `https://your-backend.onrender.com`

### **Update Frontend API URL**
After deploying backend, update frontend API calls:
```javascript
// Change from:
fetch('http://localhost:3000/api/products')

// To:
fetch('https://your-backend.onrender.com/api/products')
```

## 🐛 Troubleshooting

### **MongoDB Connection Error (ECONNREFUSED)**
**Problem:** Database not connecting
**Solution:**
1. Go to MongoDB Atlas → Network Access
2. Add IP: `0.0.0.0/0` (Allow from anywhere)
3. Wait 5 minutes for changes to take effect
4. Verify connection string in `.env` file
5. Check if cluster is ACTIVE (not PAUSED)

### **CORS Error**
**Problem:** Frontend can't connect to backend
**Solution:**
1. Check `FRONTEND_URL` in backend `.env` file
2. Make sure it matches your frontend URL exactly
3. Restart backend server

### **JWT Token Invalid**
**Problem:** Authentication failing
**Solution:**
1. Clear localStorage in browser
2. Login again
3. Check if `JWT_SECRET` is same in all places

### **Port Already in Use**
**Problem:** Port 3000 is busy
**Solution:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### **Code Style Guidelines**
- Use 2 spaces for indentation
- Use single quotes for strings
- Add comments for complex logic
- Follow existing code patterns
- Test your changes before submitting

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Areesha**
- GitHub: [@Areesha221](https://github.com/Areesha221)
- LinkedIn: [Areesha Shahid](https://linkedin.com/in/areesha-shahid-13a743377/)
- Email: chaudharyareesha400@gmail.com

## 🙏 Acknowledgments

- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) - Free cloud database
- [Vercel](https://vercel.com) - Frontend deployment platform
- [Render](https://render.com) - Backend deployment platform
- [Font Awesome](https://fontawesome.com) - Icons
- [Google Fonts](https://fonts.google.com) - Typography

---

**⭐ If you found this project helpful, please consider giving it a star on GitHub!**

**Made with ❤️ by Areesha**
