import neo4j, { Driver } from 'neo4j-driver'
import { NEO4J_PASSWORD, NEO4J_URI, NEO4J_USERNAME } from '../utils/config';
import { IDatabaseConnection } from '../utils/types';

export class Neo4JConnection implements IDatabaseConnection {
    private driver: Driver;

    constructor() {
        console.log('Connecting to Neo4J...');
        this.driver = neo4j.driver(NEO4J_URI, neo4j.auth.basic(NEO4J_USERNAME, NEO4J_PASSWORD));
    }

    closeConnection(): Promise<void> {
        return this.driver.close();
    }

    getDriver(): Driver {
        return this.driver;
    }
}
