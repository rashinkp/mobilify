import jwt from "jsonwebtoken";

const generateToken = (res, userId, role) => {
  const token = jwt.sign({ userId, role }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

  res.cookie(role, token, {
    httpOnly: true,
    sameSite: "none", // Required for cross-origin requests (Vercel → Render)
    secure: true, // Required when sameSite is "none"
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    // Don't set domain - allows cookie to work across different domains
  });
};

export default generateToken;
