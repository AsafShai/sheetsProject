# Sheets Project

## Prerequisites
- Docker and Docker Compose installed on your system
- Node.js and npm (for running tests)

## Getting Started

### Setting Up the Server

1. Navigate to the project directory where the `docker-compose.prod.yaml` file is located

2. Build the Docker containers:
```bash
docker compose -f docker-compose.prod.yaml build
```

3. Start the server:
```bash
docker compose -f docker-compose.prod.yaml up
```

The server should now be running and ready to accept api calls.

### Running Tests

1. Navigate to the project directory where the `docker-compose.test.yaml` file is located

2. Build the Docker containers:
```bash
docker compose -f .\docker-compose.test.yaml build
```

3. Start the server:
```bash
docker compose -f .\docker-compose.test.yaml up --abort-on-container-exit
```

## API Endpoints

### Get Sheet by ID
```
GET localhost:3000/api/sheets/:sheetId

Parameters:
- sheetId: string

```

### Update Cell in Sheet (by value, didn't implement lookup)
```
PUT localhost:3000/api/sheets/:sheetId/columns/:columnName/cell

Parameters:
- sheetId: string
- columnName: string

Request Body:
{
    "value": any,
    "row": number
}

```

### Create New Sheet
```
POST localhost:3000/api/sheets

Request Body:
{
    "columns": [
        {
            "name": string,
            "type": "string" ("int"|"string"|"boolean"|"double")
        },
    ]
}

```