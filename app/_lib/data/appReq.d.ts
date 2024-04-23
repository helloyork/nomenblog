
export interface AppReq<T> {
    data: T;
}

export type AppResStatus = "success" | "error";
export interface AppRes<T, U extends AppResStatus = "success"> {
    status: AppResStatus;
    data: U extends "success" ? T : null;
    error: U extends "error" ? string : null;
}
