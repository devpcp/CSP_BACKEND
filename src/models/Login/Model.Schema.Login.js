const login = {
    description: "Login เข้าสู่ระบบ เพื่อรับ access_token และ refresh_token",
    body: {
        type: 'object',
        required: ['user_name', 'password'],
        properties: {
            user_name: {
                type: 'string',
                description: "Username สำหรับ Login",
                example: 'devfik'
            },
            password: {
                type: 'string',
                description: "Password สำหรับ Login",
                example: '12345678'
            }
        }
    },
    tags: ['Auth']
};

module.exports = {
    login,
};