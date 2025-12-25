import jwt from "jsonwebtoken";

export const authHandler = (req: any, res: any, next: any) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authorization header missing or invalid" });
    }

    const token = authHeader.split(" ")[1];

    const decodedUser = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    );

    req.user = decodedUser;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};
