import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import path from "path";
import { UserRole, StudentEvaluation } from "./types";

// In-memory "database" for demonstration
let evaluations: StudentEvaluation[] = [];

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(cors());
  app.use(express.json());

  // --- RBAC Middleware ---
  const checkRole = (roles: UserRole[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
      const userRole = req.headers["x-user-role"] as UserRole;
      if (!userRole || !roles.includes(userRole)) {
        return res.status(403).json({ error: "Access denied: Insufficient permissions" });
      }
      next();
    };
  };

  // --- API Endpoints ---
  
  // Mock Auth Endpoints
  app.post("/api/auth/forgot-password", (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });
    
    // In a real app, we would check if the user exists and send an actual email.
    // For this demo, we'll just return a success message.
    console.log(`[MOCK] Sending reset code to ${email}: 123456`);
    res.json({ message: "Verification code sent to your email." });
  });

  app.post("/api/auth/reset-password", (req, res) => {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      return res.status(400).json({ error: "Email, code, and new password are required" });
    }

    // Mock verification logic
    if (code !== "123456") {
      return res.status(400).json({ error: "Invalid verification code." });
    }

    // In a real app, we would update the user's password in the database.
    console.log(`[MOCK] Password reset for ${email} to ${newPassword}`);
    res.json({ message: "Password has been reset successfully." });
  });

  // Get all evaluations (Teachers see all, Students see only theirs)
  app.get("/api/evaluations", (req, res) => {
    const userRole = req.headers["x-user-role"] as UserRole;
    const userId = req.headers["x-user-id"] as string;

    if (!userRole || !userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (userRole === UserRole.TEACHER) {
      return res.json(evaluations);
    } else {
      const studentEvals = evaluations.filter(e => e.student_id === userId);
      return res.json(studentEvals);
    }
  });

  // Create evaluation (Teacher only)
  app.post("/api/evaluations", checkRole([UserRole.TEACHER]), (req, res) => {
    const evaluation: StudentEvaluation = {
      ...req.body,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString()
    };
    evaluations.push(evaluation);
    res.status(201).json(evaluation);
  });

  // Update evaluation (Teacher only)
  app.put("/api/evaluations/:id", checkRole([UserRole.TEACHER]), (req, res) => {
    const { id } = req.params;
    const index = evaluations.findIndex(e => e.id === id);
    if (index === -1) return res.status(404).json({ error: "Evaluation not found" });

    evaluations[index] = { ...evaluations[index], ...req.body };
    res.json(evaluations[index]);
  });

  // Delete evaluation (Teacher only)
  app.delete("/api/evaluations/:id", checkRole([UserRole.TEACHER]), (req, res) => {
    const { id } = req.params;
    evaluations = evaluations.filter(e => e.id !== id);
    res.status(204).send();
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
