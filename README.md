# Smartbill Trendyol Integration

## Description
This project integrates the Romanian invoice generator program **Smartbill** with the **Trendyol** e-commerce platform. It automates the process of fetching orders from Trendyol, generating corresponding invoices in Smartbill, and managing the data flow between these two systems.

The application is built with [NestJS](https://nestjs.com/), providing a robust and scalable architecture.

## Features
- **Smartbill Integration**: 
    - Generate invoices.
    - Fetch tax information.
    - Retrieve generated invoices as PDFs.
- **Trendyol Integration**:
    - Fetch orders from Trendyol.
    - Submit generated order information back to Trendyol.
- **Automated Workflow**:
    - Streamline the order-to-invoice process.
- **API Documentation**: 
    - Integrated Swagger and Scalar API documentation for easy reference.

## Prerequisites
- **Node.js**: Ensure you have Node.js installed on your machine.
- **npm**: Access to the Node Package Manager.

## Installation

1. **Clone the repository:**
   ```bash
   git clone <repository_url>
   cd smartbill-trendyol-integration
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

## Configuration

The application requires configuration via environment variables.

1. **Create a `.env` file** in the root directory by copying the example file:
   ```bash
   cp .env.example .env
   ```

2. **Configure the variables** in `.env`:

   **General:**
   - `DB_PATH`: Path to the SQLite database file (e.g., `./data/database.sqlite`).

   **Smartbill Configuration:**
   - `SMARTBILL_BASE_URL`: Base URL for Smartbill API (e.g., `https://ws.smartbill.ro/SBORO/api`).
   - `SMARTBILL_EMAIL`: Account email for Smartbill.
   - `SMARTBILL_TOKEN`: API token for Smartbill.
   - `SMARTBILL_VAT_CODE`: Company VAT code.
   - `SMARTBILL_COMPANY_NAME`: Your company name.

   **Trendyol Configuration:**
   - `TRENDYOL_BASE_URL`: Base URL for Trendyol Integration API (e.g., `https://apigw.trendyol.com/integration`).
   - `TRENDYOL_STORE_IDS`: Comma-separated list of Trendyol Store IDs (e.g., `111111,222222`).

   **Specific Store Configuration (repeat for each Store ID defined in `TRENDYOL_STORE_IDS`):**
   - `TRENDYOL_<STORE_ID>_API_STORE_FRONT_CODES`: Store front codes ("RO,BG,GR" etc.).
   - `TRENDYOL_<STORE_ID>_SMARTBILL_SERIES_NAME`: Smartbill invoice series name for this store.
   - `TRENDYOL_<STORE_ID>_API_KEY`: Trendyol API Key for the store.
   - `TRENDYOL_<STORE_ID>_API_SECRET`: Trendyol API Secret for the store.

## Running the Application

### Development
```bash
npm run start
```

### Watch Mode (Development)
```bash
npm run start:dev
```

### Production Mode
```bash
npm run build
npm run start:prod
```

## API Documentation

Once the application is running, you can access the API documentation:

- **Swagger UI**: [http://localhost:3000/api](http://localhost:3000/api)
- **Scalar Reference**: [http://localhost:3000/reference](http://localhost:3000/reference)

### Key Endpoints

#### Smartbill (`/smartbill`)
- `GET /smartbill/tax`: Retrieve tax information.
- `GET /smartbill/invoice/:seriesName/:number`: Download a specific invoice as PDF.
- `POST /smartbill`: Create a new invoice manually.

#### Trendyol (`/trendyol`)
- `GET /trendyol/order`: Get all orders.
- `GET /trendyol/order/smartbill`: Get orders specifically filtered/formatted for Smartbill.
- `POST /trendyol/order/smartbill`: Trigger generation of orders for Smartbill.
- `GET /trendyol/store-id/:storeId/order-number/:orderNumber`: Get details of a specific order.
- `POST /trendyol/store-id/:storeId/order-number/:orderNumber/smartbill`: Generate a specific order for Smartbill manually.
- `GET /trendyol/store-id/:storeId/submit-generated-order-to-trendyol/:smartbillOrderNumber`: Submit a generated order back to Trendyol.

## Testing

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# test coverage
npm run test:cov
```

## License
This project is [UNLICENSED](LICENSE).