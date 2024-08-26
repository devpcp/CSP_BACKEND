const file = {
    description: 'Upload file ไปยัง Server',
    consumes: ['multipart/form-data'],
    body: {
        type: 'object',
        required: ['fileName', 'fileType', 'fileDirectory', 'fileDirectoryId', 'fileUpload'],
        properties: {
            fileName: {
                properties: {
                    value: { type: 'string' }
                },
                description: 'ชื่อไฟล์หลังอัพโหลด',
                example: 'profile_001'
            },
            fileType: {
                properties: {
                    value: { type: 'string', enum: ['file', 'image'] }
                },
                description: 'ชนิดไฟล์ (ตอนนี้มีแค่ image)',
                example: 'image'
            },
            fileDirectory: {
                properties: {
                    value: { type: 'string' }
                },
                description: 'directory ที่เก็บไฟล์นี้ ซึ่งข้อมูลจะอยู่หลัง directory "/assets/${fileDirectory}"',
                example: 'profile'
            },
            fileDirectoryId: {
                properties: {
                    value: { type: 'string', format: 'uuid' }
                },
                description: 'directory รูปแบบ uuid ที่เก็บไฟล์นี้ ซึ่งข้อมูลจะอยู่หลัง directory "/assets/${fileDirectory}/${fileDirectoryId}"',
                example: '7ad50f75-e888-49c0-bca6-8c9260a16678'
            },
            fileUpload: {
                type: 'object',
                properties: {
                    encoding: { type: 'string' },
                    filename: { type: 'string' },
                    limit: { type: 'boolean' },
                    mimetype: { type: 'string' }
                },
                description: 'ไฟล์แนบ (ใน Swagger จะทดสอบไม่ได้)',
                example: '@C:\\Users\\MyUser\\Pictures\\34235dfsd.PNG'
            }
        }
    },
    tags: ['Upload'],
    security: [
        {
            "apiKey": []
        }
    ]
};

const all = {
    description: 'แสดงรายการ Directory ทั้งหมดที่สามารถ Upload file เข้าไปได้ โดย Directory ที่ได้ จะไปใช้กับ Parameter: "fileDirectory" ใน API: "/api/upload/file"',
    tags: ['Upload'],
    security: [
        {
            "apiKey": []
        }
    ]
};

const file_custome_path = {
    description: 'Upload file ไปยัง Server',
    consumes: ['multipart/form-data'],
    body: {
        type: 'object',
        required: ['fileType', 'fileDirectory', 'filePath', 'fileUpload'],
        properties: {
            fileType: {
                properties: {
                    value: { type: 'string', enum: ['file', 'image'] }
                },
                description: 'ชนิดไฟล์ (ตอนนี้มีแค่ image)',
                example: 'image'
            },
            fileDirectory: {
                properties: {
                    value: { type: 'string' }
                },
                description: 'directory ที่เก็บไฟล์นี้ ซึ่งข้อมูลจะอยู่หลัง directory "/assets/${fileDirectory}"',
                example: 'profile'
            },
            filePath: {
                properties: {
                    value: { type: 'string' }
                },
                description: 'directory รูปแบบ uuid ที่เก็บไฟล์นี้ ซึ่งข้อมูลจะอยู่หลัง directory "/assets/${fileDirectory}/${filePath}"',
                example: 'xxxxxxx/xxxxxxxxx/xxxxxxxxx'
            },
            fileUpload: {
                type: 'object',
                properties: {
                    encoding: { type: 'string' },
                    filename: { type: 'string' },
                    limit: { type: 'boolean' },
                    mimetype: { type: 'string' }
                },
                description: 'ไฟล์แนบ (ใน Swagger จะทดสอบไม่ได้)',
                example: '@C:\\Users\\MyUser\\Pictures\\34235dfsd.PNG'
            }
        }
    },
    tags: ['Upload'],
    security: [
        {
            "apiKey": []
        }
    ]
};

const delete_file = {
    description: 'ลบไฟล์',
    tags: ['Upload'],
    querystring: {
        required: ['path'],
        type: 'object',
        properties: {
            path: {
                type: 'string',
                description: 'path ของไฟล์ เช่น assets/shops/xxxxxxxxx/xxxxxxxx/xxxxxxxxxx.jpg'
            }
        }
    },
    security: [
        {
            "apiKey": []
        }
    ]
};

module.exports = {
    file,
    all,
    file_custome_path,
    delete_file
}