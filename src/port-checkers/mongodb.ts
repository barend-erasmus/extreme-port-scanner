import * as mongodb from 'mongodb';

export class MongoDBPortChecker {

    public async check(ipAddress: string): Promise<boolean> {
        let client: mongodb.MongoClient = null;

        try {
            client = await mongodb.MongoClient.connect(`mongodb://${ipAddress}:27017`);

            const database: mongodb.Db = client.db('local');

            const collection: mongodb.Collection = database.collection('test');

            await collection.insertOne({ hello: 'world' });

            return true;
        } catch (error) {
            return false;
        } finally {
            if (client) {
                client.close();
            }
        }
    }

}
