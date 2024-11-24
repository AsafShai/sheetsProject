import neo4j, { Driver } from 'neo4j-driver'
import { NEO4J_PASSWORD, NEO4J_URI, NEO4J_USERNAME } from '../utils/config';

export class Neo4JConnection {
    private static Neo4JConnection: Neo4JConnection;
    private driver: Driver;

    private constructor() {
        console.log('Connecting to Neo4J...');
        this.driver = neo4j.driver(NEO4J_URI, neo4j.auth.basic(NEO4J_USERNAME, NEO4J_PASSWORD));
    }

    static getInstance(): Neo4JConnection {
        if (!Neo4JConnection.Neo4JConnection) {
            Neo4JConnection.Neo4JConnection = new Neo4JConnection();
        }
        return Neo4JConnection.Neo4JConnection;
    }

    getDriver(): Driver {
        return this.driver;
    }
    async closeConnection(): Promise<void> {
        await this.driver.close();
    }
}
