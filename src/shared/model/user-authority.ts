export enum UserAuthorityType {
    USER = 'USER',
    MENTOR = 'MENTOR',
    ADMIN = 'ADMIN'
}

export type UserAuthority = {
    authority: UserAuthorityType;
};
