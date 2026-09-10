# 🚀 How to Run MediGuide AI

You have two very easy ways to run the complete project on your own:

---

## 🟢 Method 1: The 1-Click Launcher (Easiest!)

Simply double-click the **`start_all.bat`** file located in your project folder (`C:\Users\USER\MINI`).

It will automatically:
1. Start the **Python NLP Service** on Port 8000.
2. Start the **Spring Boot Backend** on Port 8080.
3. Start the **React Frontend** on Port 5173.
4. Automatically open your browser at **http://localhost:5173**!

---

## 💻 Method 2: Manual Terminal Commands

If you prefer opening terminals manually in VS Code, open 3 terminal tabs and run:

### Terminal 1: Python NLP Service
```bash
cd backend/python-service
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

### Terminal 2: Spring Boot Java Backend
```bash
cd backend
mvn spring-boot:run
```

### Terminal 3: React Vite Frontend
```bash
npm run dev
```

Then open **http://localhost:5173** in your browser!

---

## 🔑 Default Login Credentials:
* **Admin Login**: `admin@mediguide.com` / `Admin@1234`
* **Patient Login**: Any registered email (e.g. `susithra@gmail.com` / `Password@123`) or click **Create Account**.
