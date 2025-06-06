import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const isAdmin = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  }
  {
    throw new ApiError(403, "Access Denied, Admin only");
  }
});
export { isAdmin };
