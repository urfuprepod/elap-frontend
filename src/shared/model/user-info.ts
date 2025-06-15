import { UserAuthority } from "./user-authority";
import { MentorInfo } from "./mentor-info";

export type UserInfo = {
    id: number;
    login: string;
    email: string;
    authorities?: UserAuthority[];
    mentor?: MentorInfo;
    mentorRole?: string;
    isActive: boolean;
};
