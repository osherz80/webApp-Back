import { AuthRequest } from "../middleware/authMiddleware";

export interface UpdateUserReq extends AuthRequest {
    username?: string;
    profilePicture?: string;
    bio?: string;
}