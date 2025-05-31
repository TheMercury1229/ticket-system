import jwt from "jsonwebtoken";

export const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Authentication error:", error.message);
    res
      .status(500)
      .json({ message: "Internal server error", details: error.message });
  }
};
