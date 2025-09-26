import { Readable } from "stream";
import { Client } from "basic-ftp";

export const uploadToCPanel = async (
    fileBuffer: Buffer,
    fileName: string,
    moduleFolder: string,
): Promise<any> => {
    const client = new Client();
    client.ftp.verbose = true;
    console.log(moduleFolder);
    try {
        await client.access({
            host: "ftp.hatechz.com",
            user: "hatechzc",
            password: "wyf@KCI042Fr7:",
            port: 21,
            secure: false
        });
        await client.cd(`hrm.hatechz.com/uploads/${moduleFolder}`);
        const stream = Readable.from(fileBuffer);
        await client.uploadFrom(stream, fileName);
        return `https://hrm.hatechz.com/uploads/${moduleFolder}/${fileName}`;
    } catch (err) {
        console.log(err);
    }
    finally {
        client.close();
    }
};