# GoGreen DSA — Backend

Backend API for the **GoGreen Decision Support Application (DSA)**, developed within the GoGreen research project to support comparative assessment of materials and treatments for cultural heritage conservation.

- **Frontend repository:** https://github.com/IIT-CCHT/dsa_gogreen_frontend
- **Maintainer:** IIT — Center for Cultural Heritage Technology (CCHT)
- **License:** MIT (see `LICENSE`)

## Overview

This repository contains the GoGreen DSA Node.js API, including authentication, access to MongoDB-backed reference and application data, workbench persistence, and comparison/assessment functionality. The user interface is maintained in a separate Nuxt repository.

Please note: The MongoDB database is not included in this repository or distributed with the application, as it contains third-party data subject to separate licensing agreements and usage restrictions.

## Technology

- Node.js / Express
- MongoDB
- Email/password authentication with RSA-signed JWTs
- SMTP integration for password recovery workflows

The documented Windows development baseline is Node.js **24.22.2** and npm **11.19.1**. These are reference versions, not a verified minimum compatibility range.

## Prerequisites

- Git, Node.js and npm
- A running MongoDB instance
- A **compatible populated database** (see Database section)
- RSA signing keys for the local environment
- SMTP credentials only when testing email-dependent workflows

## Local setup (Windows / PowerShell)

```powershell
git clone https://github.com/IIT-CCHT/dsa_gogreen_backend.git
cd dsa_gogreen_backend
npm ci
```

### Configure the application

The documented `npm start` script uses `nodemon_dev.json`. Configure its `env` object for your own local installation, preserving any other required settings:

```json
{
  "env": {
    "DB_URL": "mongodb://127.0.0.1:27017/",
    "DB_NAME": "dsa",
    "PORT": "3000"
  }
}
```

This is a **partial example**, not a replacement for the entire existing configuration. The application concatenates `DB_URL` and `DB_NAME`, so `DB_URL` must end with the correct separator (`/` in this example). The example assumes a local MongoDB server without authentication; use suitable credentials and access controls for other environments.

**Important:** Existing configuration files may contain environment-specific secrets. Remove or replace them before publication, and inspect the complete Git history. The application may log the composed database URL: avoid logging credentials.

### Generate local JWT keys

For a **new, isolated development checkout only**, run:

```powershell
node .\generateKeypair.js
```

The script generates the `id_rsa_priv.pem` and `id_rsa_pub.pem` files expected in the backend root. **It overwrites existing keys**; never run it against shared or production keys. Keep private keys out of version control.

### Prepare MongoDB

The application does **not** automatically seed an empty MongoDB database on startup. A compatible database containing the required application and reference collections must be restored or provisioned before meaningful use.

**The public distribution procedure for an initial backup or sanitized seed dataset is still to be defined.** Do not publish operational backups, user records, credentials, or other sensitive data. Contact the project maintainers for approved data-access instructions.

### Start the API

```powershell
npm start
```

The documented script starts `nodemon server.js --config nodemon_dev.json`. The API normally listens on **http://localhost:3000**.

A basic process check is:

```powershell
Invoke-RestMethod http://localhost:3000/
```

The root route should return a status indicating `API running`. **This is not a database readiness check**: verify MongoDB connectivity and an authenticated data request separately.

## API areas

The frontend integrates with endpoints covering:

| Area                | Example path               |
| ------------------- | -------------------------- |
| Authentication      | `/auth/login`, `/auth/me`  |
| Workbench           | `/api/workbench/`          |
| Comparisons         | `/api/comparison/`         |
| Materials           | `/api/materials`           |
| Treatments          | `/api/treatments`          |
| Distance calculator | `/api/distance-calculator` |
| Generic CRUD        | `/api/crud/`               |
| Pickers             | `/api/pickers/`            |
| Menu                | `/api/menu`                |
| Files               | `/api/files`               |

These are representative integration paths, not a complete or formally versioned API specification. Verify route availability and authorization against the source code.

## External integrations

- **MongoDB:** persistent application and reference data.
- **SMTP:** email workflows such as password recovery.
- **OpenStreetMap Nominatim:** geographic location suggestions.

Network access and appropriate service configuration are needed for these functions. Legacy OAuth-related configuration may exist in the codebase; the documented active authentication path is local email/password with RSA-signed JWTs.

## Deployment

The documented application startup contract is:

```bash
npm start
```

The infrastructure operator is responsible for process supervision, environment-specific configuration, logging, reverse proxy, TLS, backups, monitoring, and restarts. PM2 is optional rather than a repository requirement. Docker is used in IIT's internal staging workflow but is not required for the documented local setup or handover.

Before releasing, record the frontend and backend commit SHAs, verify compatible API contracts, preserve database backups when changing data, and test login, workbench persistence, and comparisons. A source rollback alone does not reverse database changes.

## Testing and limitations

At the time of the technical handover guide, the backend's `npm test` script was a placeholder (`Error: no test specified`). Do not treat it as an automated verification suite. Perform manual integration checks with a compatible database and frontend.

## Security

Never commit private RSA keys, database exports, SMTP credentials, production configuration, tokens, or personal data. Review the **entire Git history** before making this repository public. Use isolated development credentials and keys; restrict CORS and database access according to the deployment environment.

## Related repository

[GoGreen DSA frontend](https://github.com/IIT-CCHT/dsa_gogreen_frontend)

## License

This project is distributed under the **MIT License**. See the repository's `LICENSE` file. Ensure the license file and copyright notice are approved by the relevant rights holders before publication.
