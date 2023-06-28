import { callMyServer } from "./utils.js"

export const refreshSignInStatus = async function() {
    const userInfoObj = await callMyServer("/server/users/get_my_info");
}