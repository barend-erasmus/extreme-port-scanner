import * as mongodb from 'mongodb';
import { IPortChecker, PortCheckerResult } from '..';

export class MongoDBPortChecker implements IPortChecker {

    public async check(ipAddress: string, port: number): Promise<PortCheckerResult> {
        let client: mongodb.MongoClient = null;

        try {
            client = await mongodb.MongoClient.connect(`mongodb://${ipAddress}:${port}`);

            const database: mongodb.Db = client.db('local');

            const collection: mongodb.Collection = database.collection('test');

            await collection.insertOne({ hello: 'world' });

            const meta: any = await this.getMeta(client);

            return new PortCheckerResult(ipAddress, true, meta, port, new Date());
        } catch (error) {
            return new PortCheckerResult(ipAddress, false, null, port, new Date());
        } finally {
            if (client) {
                client.close();
            }
        }
    }

    protected async getMeta(client: mongodb.MongoClient): Promise<any> {
        const result: { databases: any[] } = {
            databases: [],
        };

        const localDatabase: mongodb.Db = client.db('local');

        const listDatabasesResult: any = await localDatabase.admin().listDatabases();

        for (const databaseItem of listDatabasesResult.databases) {
            if (databaseItem.name === 'admin' || databaseItem.name === 'config' || databaseItem.name === 'local' || databaseItem.name === 'Warning') {
                continue;
            }

            const databaseMeta: { collections: any[], name: string, sizeOnDisk: number } = {
                collections: [],
                name: databaseItem.name,
                sizeOnDisk: databaseItem.sizeOnDisk,
            };

            const database: mongodb.Db = client.db(databaseItem.name);

            const listCollectionsResult: any[] = await database.listCollections().toArray();

            for (const collectionItem of listCollectionsResult) {
                const collectionMeta: { data: any[], name: string } = {
                    data: [],
                    name: collectionItem.name,
                };

                const collection: mongodb.Collection = database.collection(collectionItem.name);

                const data: any[] = await collection.find({}).toArray();

                collectionMeta.data = data;

                databaseMeta.collections.push(collectionMeta);
            }

            result.databases.push(databaseMeta);
        }

        return result;
    }

}
