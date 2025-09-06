import { RequestHandler } from "express";
import type { UserRole } from "@shared/api";

declare global {
  namespace Express {
    interface Request {
      userRole?: UserRole;
      userId?: string;
    }
  }
}

export const attachIdentity: RequestHandler = (req, _res, next) => {
  const role = (req.header("x-role") || "user").toLowerCase();
  const userId = req.header("x-user-id") || "anonymous";
  req.userRole = role === "admin" ? "admin" : "user";
  req.userId = userId;
  next();
};

export const requireAdmin: RequestHandler = (req, res, next) => {
  if (req.userRole !== "admin") {
    return res.status(403).json({ error: "Admin privileges required" });
  }
  next();
};
