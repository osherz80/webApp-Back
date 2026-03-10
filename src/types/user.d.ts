import { AuthRequest } from "../middleware/authMiddleware";

export interface UpdateUserReq extends AuthRequest {
    username?: string;
    picture?: string;
    bio?: string;
}