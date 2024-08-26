import {FastifyRequest} from "fastify";
import {MultipartFile} from "fastify-multipart"

/**
 * A FastifyRequest contains incoming request from
 */
export type IHandlerUploadFileRequest = FastifyRequest<ISchemaHandlerUploadFileRequest>

/**
 * An interface contains incoming request from
 */
export interface ISchemaHandlerUploadFileRequest {
    // Headers: {};
    // Params: {};
    // Querystring: {};
    Body: {
        /**
         * ชื่อไฟล์หลังอัพโหลด
         */
        fileName: string;
        /**
         * ชนิดไฟล์ (ตอนนี้มีแค่ image)
         */
        fileType: string;
        /**
         * directory ที่เก็บไฟล์นี้ ซึ่งข้อมูลจะอยู่หลัง directory "src/assets/"
         */
        fileDirectory: string;
        /**
         * directory ที่เก็บไฟล์นี้ ซึ่งข้อมูลจะอยู่หลัง directory "src/assets/${fileDirectory}/"
         */
        fileDirectoryId: string;
        /**
         * ไฟล์แนบ (ใน Swagger จะทดสอบไม่ได้)
         */
        fileUpload: MultipartFile
    };
}


/**
 * A FastifyRequest contains incoming request from
 */
export type IHandlerUploadAllRequest = FastifyRequest<ISchemaHandlerUploadAllRequest>

/**
 * An interface contains incoming request from
 */
export interface ISchemaHandlerUploadAllRequest {
    // Headers: {};
    // Params: {};
    // Querystring: {};
    // Body: {}
}