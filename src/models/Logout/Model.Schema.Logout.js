const logout = {
    description: "Logout ออกสู่ระบบ เพื่อถอน access_token และ refresh_token",
    tags: ['Auth'],
    security: [
        {
            "apiKey": []
        }
    ]
};

module.exports = {
    logout,
}