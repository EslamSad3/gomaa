# Multi-Tenant SaaS Application Documentation

## Overview
A secure multi-tenant SaaS backend built with Node.js, Express.js, and MongoDB. Key features include:
- User registration with email verification
- OTP-based login flow
- Password management
- JWT authentication with refresh tokens
- Tenant isolation via tenant_id

## Project Structure
```
saas-multi-tenant/
├── models/
│   ├── SuperUser.js
│   ├── Team.js
│   └── User.js
├── controllers/
│   ├── superuserController.js
│   ├── userController.js
│   └── authController.js
├── routes/
│   ├── superusers.js
│   ├── users.js
│   └── auth.js
├── middleware/
│   └── auth.js
├── utils/
│   └── email.js
├── db.js
├── index.js
├── .env
└── package.json
```

## Core Functionality
### Authentication Flow
1. **SuperUser Registration**: Creates tenant, hashes password, sends verification email
2. **Email Verification**: Uses code sent via Gmail
3. **Login with OTP**: Two-step process with email OTP
4. **Password Management**: Secure password change with current password verification
5. **Token Refresh**: Uses refresh tokens to maintain sessions

### Security Features
- Bcrypt for password hashing
- JWT with short expiration (15m)
- UUID for tenant_id generation
- Rate limiting on login attempts
- Helmet for security headers

## Schema Design

### Enhanced Schema Documentation

#### User Schema
The User schema is critical for managing individual users, and enhancements focus on authentication, authorization, and auditing:

| Field | Type | Description | Security/Access Control Relevance |
|-------|------|-------------|-----------------------------------|
| name | String | Required, user's name | None directly, but part of user identity |
| email | String | Required, user's email | Used for authentication, must be unique per tenant |
| password | String | Required, user's password (must be hashed) | Central to authentication security |
| createdAt | Date | Default: current date, tracks creation time | Useful for auditing |
| lastLogin | Date | Tracks last login time | For auditing and detecting inactive accounts |
| loginAttempts | Number | Default: 0, counts failed login attempts | Enables account lockout, enhances security |
| mfaEnabled | Boolean | Default: false, indicates MFA status | Adds second factor for authentication |
| teamId | ObjectId | References Team, links user to a team | Supports team-based access control |
| tenant_id | String | Required, identifies tenant | Ensures data isolation, critical for multi-tenancy |
| tags | [String] | Array of tags, editable | Can be used for categorization in access control |
| roles | [String] | Array of roles (e.g., ["admin", "editor"]) | Enables role-based access control (RBAC) |
| status | String | Enum: ["active", "inactive", "pending"], default "pending" | Controls account activation, enhances access control |
| emailVerified | Boolean | Default: false, tracks email verification | Prevents unauthorized access, enhances security |

The additions of lastLogin, loginAttempts, roles, status, and emailVerified enhance security by enabling auditing, RBAC, and account management.

#### SuperUser Schema
The SuperUser schema manages tenant administrators, requiring even stronger security:

| Field | Type | Description | Security/Access Control Relevance |
|-------|------|-------------|-----------------------------------|
| tenant_id | String | Required, identifies tenant | Ensures data isolation, critical for multi-tenancy |
| name | String | Required, superuser's name | Part of identity, no direct security impact |
| orgName | String | Required, organization name | Identifies tenant context, supports isolation |
| email | String | Required, superuser's email | Used for authentication, must be unique per tenant |
| password | String | Required, superuser's password (must be hashed) | Central to authentication security |
| createdAt | Date | Default: current date, tracks creation time | Useful for auditing |
| lastLogin | Date | Tracks last login time | For auditing and detecting inactive accounts |
| loginAttempts | Number | Default: 0, counts failed login attempts | Enables account lockout, enhances security |
| mfaEnabled | Boolean | Default: false, indicates MFA status | Adds second factor for authentication |
| teams | [ObjectId] | References Team, links to managed teams | Supports team-based access control |
| contactSupport | String | Contact details for support | Could be used for access control policies |
| domains | [String] | Array of allowed domains | Supports domain-based access control |
| ips | [String] | Array of allowed IPs | Enables IP-based access control |
| tags | [String] | Array of tags, for categorization | Can be used for fine-grained access control |
| roles | [String] | Array of roles (e.g., ["super_admin"]) | Enables RBAC for superusers, critical for access control |

The additions of lastLogin, loginAttempts, and roles enhance auditing and RBAC, ensuring superusers are tightly controlled.

#### Team Schema
The Team schema supports team-based access control:

| Field | Type | Description | Security/Access Control Relevance |
|-------|------|-------------|-----------------------------------|
| name | String | Required, team's name | Part of identity, no direct security impact |
| createdAt | Date | Default: current date, tracks creation time | Useful for auditing |
| tags | [String] | Array of tags, for categorization | Can be used for team-based access control |
| users | [ObjectId] | References User, links to team members | Enables team-based access control via membership |
| tenant_id | String | Required, identifies tenant | Ensures data isolation, critical for multi-tenancy |

The tenant_id and users fields ensure teams are isolated by tenant and support access control through user membership.

### Implementation Details
To implement these enhanced schemas, consider the following:

- **Password Hashing**: While not part of the schema, passwords must be hashed using a strong algorithm like bcrypt.
- **Compound Indexes**: The compound indexes on { tenant_id: 1, email: 1 } ensure uniqueness per tenant.
- **Role-Based Access Control (RBAC)**: The roles field can be used with middleware to check permissions.
- **Tenant Isolation**: Always filter queries by tenant_id in application logic.
- **MFA Implementation**: The mfaEnabled field suggests MFA support.
- **Auditing**: Fields like lastLogin and loginAttempts can be updated in pre-save hooks or middleware.

### Performance and Scalability Considerations
Using a shared collection with tenant_id for isolation has trade-offs:

- **Pros**: Simpler to manage from a single application instance, easier tenant switching within the same process
- **Cons**: Requires careful indexing and query optimization to maintain performance at scale

### User
- tenant_id, name, email, password
- teamId reference
- emailVerified status
- verificationCode, loginOTP

### Team
- tenant_id, name
- tags for categorization
- users array

## Implementation Details
### Utilities
- Password hashing with bcrypt (salt rounds: 10)
- JWT generation with tenant context
- Email sending via nodemailer/Gmail

### Middleware
- JWT authentication with tenant verification
- Rate limiting (5 attempts/15min per IP)

## OWASP Top 10 Compliance
| Vulnerability | Mitigation |
|--------------|------------|
| Injection | Mongoose query sanitization |
| Broken Auth | Bcrypt, JWT, OTP |
| Sensitive Data | Email over TLS, hashed passwords |
| Broken Access Control | tenant_id verification |
| Security Misconfig | Helmet headers |

## Performance Considerations
- Shared collection with tenant_id indexing
- Compound indexes on frequently queried fields
- Application-level tenant filtering

## Production Recommendations
- Enable HTTPS
- Enhance logging/monitoring
- Regular security audits