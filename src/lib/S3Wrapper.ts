import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { Readable } from 'stream';

export class S3Wrapper {
    private client: S3Client;
    private config: any;

    constructor(config: any = {}) {
        this.config = {
            bucket: config.bucket || 'default-bucket',
            region: config.region || 'us-east-1',
            endpoint: config.endpoint || 'https://minio.debian-k3s',
            credentials: {
                accessKeyId: config.accessKeyId || 'miniouser1',
                secretAccessKey: config.secretAccessKey || 'minio123'
            }
        };

        this.client = new S3Client({
            endpoint: this.config.endpoint,
            region: this.config.region,
            credentials: this.config.credentials,
            forcePathStyle: true // Required for MinIO
        });
    }

    async uploadFile(key: string, data: Buffer | string | Readable) {
        try {
            const command = new PutObjectCommand({
                Bucket: this.config.bucket,
                Key: key,
                Body: data
            });

            const response = await this.client.send(command);
            console.log(`File uploaded successfully: ${key}`);
            return response;
        } catch (error) {
            console.error('Failed to upload file:', error);
            throw error;
        }
    }

    async downloadFile(key: string): Promise<Buffer> {
        try {
            const command = new GetObjectCommand({
                Bucket: this.config.bucket,
                Key: key
            });

            const response = await this.client.send(command);
            
            if (!response.Body) {
                throw new Error('No data received from S3');
            }

            // Convert the readable stream to a buffer
            const chunks: Buffer[] = [];
            for await (const chunk of response.Body as Readable) {
                chunks.push(Buffer.from(chunk));
            }
            
            console.log(`File downloaded successfully: ${key}`);
            return Buffer.concat(chunks);
        } catch (error) {
            console.error('Failed to download file:', error);
            throw error;
        }
    }

    async deleteFile(key: string) {
        try {
            const command = new DeleteObjectCommand({
                Bucket: this.config.bucket,
                Key: key
            });

            const response = await this.client.send(command);
            console.log(`File deleted successfully: ${key}`);
            return response;
        } catch (error) {
            console.error('Failed to delete file:', error);
            throw error;
        }
    }

    async listFiles(prefix: string = ''): Promise<string[]> {
        try {
            const command = new ListObjectsV2Command({
                Bucket: this.config.bucket,
                Prefix: prefix
            });

            const response = await this.client.send(command);
            const files = response.Contents?.map(file => file.Key || '') || [];
            console.log(`Listed ${files.length} files with prefix: ${prefix}`);
            return files;
        } catch (error) {
            console.error('Failed to list files:', error);
            throw error;
        }
    }
}
