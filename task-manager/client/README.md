# 🚀 Task Manager Pro

A full-stack **MERN** (MongoDB, Express, React, Node.js) application designed for efficient team task management. It features secure authentication, role-based access control, and a modern, responsive UI with **Dark Mode**.

### 🔗 **Live Demo:** [https://task-manager-pink-delta.vercel.app/](https://task-manager-pink-delta.vercel.app/)

---
## Pictures

1. Login Page 
![Login Page Screenshot](./Screenshot/login.png)

2. Demo Accounts
![Demo Accounts for the user to test with the function of Auto fill](./Screenshot/Demo-accounts.png)

3. Light Mode
![Changing dark mode by clicking the icon at the bottom right](./Screenshot/light-mode.png)

4. Dashboard
![Superior Dashboard](./Screenshot/superior-dashboard.png)
![Member Dashboard](./Screenshot/member-dashboard.png)
![Admin Dashboard](./Screenshot/admin-dashboard.png)

5. Create Task
![Superior Create Task](./Screenshot/Create-task.png)
![Member Create Task](./Screenshot/member-createtask.png)
![Admin Create Task](./Screenshot/admin-createTask.png)

6. Admin Advantage
![Admin has a control over everything including the perks to delete other users](./Screenshot/admin-advantage.png)

## ✨ Key Features

* **🔐 Secure Authentication:** JWT-based login and registration system.
* **👤 Role-Based Access Control (RBAC):**
    * **Admin:** Secret overarching access to manage all users and delete unwanted accounts.
    * **Superiors:** Can create tasks, assign them to users, and view all team data.
    * **Users:** Can view their assigned tasks and update status (Pending/Progress/Completed).
* **🌓 Dark Mode Support:** Fully integrated dark/light theme toggle using Bootstrap CSS.
* **📊 Dashboard Analytics:** Real-time stats showing Total, Completed, and Pending tasks.
* **🎨 Modern UI/UX:** Built with **Bootstrap CSS** for a clean, responsive design on mobile and desktop.
* **🔔 Smart Notifications:** Toast notifications for success/error feedback (e.g., "Login Failed", "Task Created").

---

## 🛠️ Tech Stack

**Frontend:**
* React.js (Vite)
* Bootstrap CSS
* React Router DOM
* React Hot Toast

**Backend:**
* Node.js & Express.js
* MongoDB (Mongoose)
* JWT (JSON Web Tokens) for Auth
* BcryptJS for Password Hashing

**Deployment:**
* **Frontend:** Vercel
* **Backend:** Render
* **Database:** MongoDB Atlas

---

## ⚡ Getting Started Locally

If you want to run this project on your local machine:

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/Subiyan-coder/Task_Manager.git](https://github.com/Subiyan-coder/Task_Manager.git)
    cd Task_Manager
    ```

2.  **Install Dependencies:**
    ```bash
    # Install Backend
    cd server
    npm install

    # Install Frontend
    cd ../client
    npm install
    ```

3.  **Set up Environment Variables:**
    Create a `.env` file in the `server` folder with:
    ```env
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_secret_key
    PORT=5000
    ADMIN_EMAIL=your_email_to_trigger_admin_role
    ```

4.  **Run the App:**
    ```bash
    # Run Backend (inside server folder)
    node index.js

    # Run Frontend (inside client folder)
    npm run dev
    ```

---

### 👨‍💻 Author
**Mohamed Muneerul Subiyan**
* [GitHub Profile](https://github.com/Subiyan-coder)