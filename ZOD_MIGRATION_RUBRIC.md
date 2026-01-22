# Zod as Single Source of Truth - Migration Rubric

## Current State Analysis

### Redundancy Identified

**YES, your backend uses Zod and Mongoose schemas redundantly:**

1. **BehaviorRecord Schema Duplication**
   - **Mongoose Schema**: Defined in `server/models/BehaviorRecord.model.js`
     - `BehaviorSchema` with category enum, severity enum, etc.
     - `ContextSchema` with optional fields
     - `InterventionSchema` with status enum, tier enum
     - `BehaviorRecordSchema` as main schema
   
   - **Zod Schema**: Defined in `server/services/llm_service.js`
     - `LlmOutputSchema` with identical structure
     - Same enums: behavior.category, behavior.severity, intervention.status, intervention.tier
     - Same nested structure (behavior, context, intervention)
   
   - **Redundancy Impact**: Any changes to the data model require updates in TWO places, risking schema drift

2. **User Schema - No Zod Validation**
   - **Mongoose Schema**: Defined in `server/models/User.model.js`
   - **Zod Schema**: NONE
   - **Manual Validation**: Controllers use ad-hoc checks (`if (!req.body.email)`)
   - **Missing**: Request body validation, response validation, type safety

3. **Request Validation Gaps**
   - No Zod validation middleware for:
     - `POST /api/auth/register` - manual checks only
     - `POST /api/auth/login` - manual checks only
     - `POST /api/records` - only checks for `teacherNotes` existence
     - `PUT /api/records/:id` - relies on Mongoose validators only
   - Controllers manually check for required fields with basic if-statements

### Current Validation Strategy

- **Mongoose**: Used for database schema definition and validation on save/update
- **Zod**: Only used for LLM output validation in `llm_service.js`
- **Manual**: Controllers perform basic existence checks
- **No middleware**: No centralized request validation

---

## Target Architecture: Zod as Single Source of Truth

### Core Principle
**Zod schemas define the data contract. Mongoose schemas are generated from Zod schemas.**

### Architecture Components

#### 1. Schema Definition Layer (`server/schemas/`)
```
server/schemas/
├── user.schema.js          # User Zod schema
├── behaviorRecord.schema.js # BehaviorRecord Zod schema
└── index.js                 # Export all schemas
```

**Requirements:**
- All data models have corresponding Zod schemas
- Schemas include validation rules (min/max, formats, enums)
- Schemas define both input (request) and output (response) variants
- Schemas support partial/update variants for PATCH/PUT operations

#### 2. Mongoose Schema Generation (`server/models/`)
```
server/models/
├── User.model.js           # Mongoose model generated from Zod
├── BehaviorRecord.model.js # Mongoose model generated from Zod
└── schemaGenerator.js      # Utility to convert Zod → Mongoose
```

**Requirements:**
- Mongoose schemas are programmatically generated from Zod schemas
- Use library like `zod-to-json-schema` + `json-schema-to-mongoose` OR
- Use `mongoose-zod` OR custom conversion utility
- Mongoose schemas maintain database-specific features (indexes, refs, timestamps)
- No manual Mongoose schema definitions

#### 3. Validation Middleware (`server/middleware/`)
```
server/middleware/
├── validation.middleware.js # Zod validation middleware
└── auth.middleware.js        # (existing)
```

**Requirements:**
- Express middleware that validates `req.body`, `req.query`, `req.params` using Zod
- Returns 400 with detailed error messages on validation failure
- Supports different schemas for different routes (body, query, params)
- Reusable across all routes

#### 4. Controller Updates
**Requirements:**
- Remove all manual validation checks (`if (!req.body.field)`)
- Remove redundant Zod validation in services (if schema is already validated at route level)
- Controllers trust validated data from middleware
- Use Zod-inferred types for better IDE support (if using TypeScript)

#### 5. Service Layer
**Requirements:**
- LLM service uses shared Zod schema from `schemas/` directory
- No duplicate schema definitions
- Services can use Zod schemas for internal validation if needed

---

## Success Criteria Rubric

### Phase 1: Schema Consolidation ✅

**Must Have:**
- [ ] All Mongoose models have corresponding Zod schemas in `server/schemas/`
- [ ] `LlmOutputSchema` in `llm_service.js` is moved to `schemas/behaviorRecord.schema.js`
- [ ] User schema has Zod definition in `server/schemas/user.schema.js`
- [ ] No duplicate enum definitions (all enums defined once, referenced)
- [ ] Schema files export base schemas, input schemas, output schemas, and update schemas

**Success Metrics:**
- Zero duplicate schema definitions
- Single source of truth for all data structures
- All enums defined in one place

### Phase 2: Mongoose Schema Generation ✅

**Must Have:**
- [ ] Mongoose schemas are generated from Zod schemas (not manually written)
- [ ] Database-specific features (indexes, refs, timestamps) are preserved
- [ ] Conversion utility handles:
  - Basic types (string, number, boolean)
  - Enums → Mongoose enum
  - Arrays → Mongoose arrays
  - Nested objects → Mongoose subdocuments
  - Optional fields → `required: false`
  - Default values
- [ ] Generated Mongoose schemas maintain same validation rules as Zod

**Success Metrics:**
- `User.model.js` and `BehaviorRecord.model.js` are generated, not manually written
- All existing database constraints preserved
- No breaking changes to database operations

### Phase 3: Request Validation Middleware ✅

**Must Have:**
- [ ] Validation middleware created in `server/middleware/validation.middleware.js`
- [ ] Middleware validates:
  - `req.body` for POST/PUT/PATCH requests
  - `req.query` for GET requests with query params
  - `req.params` for route parameters (if needed)
- [ ] Middleware returns 400 status with detailed Zod error messages
- [ ] Middleware is applied to all routes:
  - `POST /api/auth/register` - validates UserCreateSchema
  - `POST /api/auth/login` - validates LoginSchema
  - `POST /api/records` - validates PostNoteSchema (teacherNotes)
  - `PUT /api/records/:id` - validates BehaviorRecordUpdateSchema
  - `GET /api/records` - validates QueryParamsSchema (page, limit, filters)

**Success Metrics:**
- Zero manual validation checks in controllers
- All request bodies validated before reaching controller logic
- Consistent error response format across all endpoints

### Phase 4: Controller Cleanup ✅

**Must Have:**
- [ ] All `if (!req.body.field)` checks removed from controllers
- [ ] Controllers assume data is validated (from middleware)
- [ ] Error handling focuses on business logic, not validation
- [ ] `auth.controller.js`:
  - `register()` - no manual field checks
  - `login()` - no manual field checks
- [ ] `notes.controller.js`:
  - `postNote()` - no manual `teacherNotes` check
  - `editNote()` - relies on validation middleware

**Success Metrics:**
- Controllers are cleaner and focused on business logic
- Reduced code duplication
- Better separation of concerns

### Phase 5: Service Layer Integration ✅

**Must Have:**
- [ ] `llm_service.js` imports Zod schema from `schemas/behaviorRecord.schema.js`
- [ ] No duplicate schema definitions in service files
- [ ] Services can optionally validate internal data using shared schemas
- [ ] Type inference works if using TypeScript

**Success Metrics:**
- Single schema definition used across LLM validation and database model
- No schema drift between service and model layers

### Phase 6: Testing & Validation ✅

**Must Have:**
- [ ] All existing API tests pass
- [ ] New validation tests verify:
  - Invalid request bodies return 400
  - Valid request bodies pass through
  - Error messages are descriptive
- [ ] Database operations unchanged (no data migration needed)
- [ ] Edge cases handled:
  - Missing required fields
  - Invalid enum values
  - Type mismatches
  - Nested object validation

**Success Metrics:**
- 100% test coverage for validation
- No regressions in existing functionality
- Better error messages for API consumers

---

## Implementation Approach

### Recommended Libraries

1. **zod-to-json-schema** + **json-schema-to-mongoose**
   - Convert Zod → JSON Schema → Mongoose
   - More control, but two-step conversion

2. **mongoose-zod** (if available)
   - Direct Zod to Mongoose conversion
   - Simpler, but may have limitations

3. **Custom Converter**
   - Write utility function to map Zod types to Mongoose
   - Most flexible, but requires maintenance

### Schema Variants Needed

For each model, define:
- **Base Schema**: Complete model definition
- **Create Schema**: Input validation (may exclude auto-generated fields)
- **Update Schema**: Partial updates (all fields optional)
- **Response Schema**: Output validation (excludes sensitive fields like passwords)
- **Query Schema**: Query parameter validation

### Example Structure

```javascript
// schemas/user.schema.js
const UserBaseSchema = z.object({...});
const UserCreateSchema = UserBaseSchema.omit({_id: true, createdAt: true});
const UserUpdateSchema = UserBaseSchema.partial();
const UserResponseSchema = UserBaseSchema.omit({password: true});
const LoginSchema = z.object({email: z.string().email(), password: z.string()});
```

---

## Migration Checklist for AI Agent

### Pre-Migration
- [ ] Backup current codebase
- [ ] Review all existing Mongoose schemas
- [ ] Document all validation rules currently in controllers
- [ ] Identify all enum values used across codebase

### Migration Steps
1. [ ] Create `server/schemas/` directory
2. [ ] Extract `LlmOutputSchema` to `schemas/behaviorRecord.schema.js`
3. [ ] Create `schemas/user.schema.js` with all User validation
4. [ ] Create schema generation utility
5. [ ] Generate Mongoose models from Zod schemas
6. [ ] Create validation middleware
7. [ ] Apply middleware to all routes
8. [ ] Remove manual validation from controllers
9. [ ] Update services to use shared schemas
10. [ ] Run tests and fix any issues

### Post-Migration
- [ ] Verify all endpoints work correctly
- [ ] Check error messages are user-friendly
- [ ] Ensure no performance regressions
- [ ] Update documentation
- [ ] Remove any unused validation code

---

## Benefits of This Architecture

1. **Single Source of Truth**: Schema changes in one place
2. **Type Safety**: Zod schemas can generate TypeScript types
3. **Better Validation**: Consistent validation across all layers
4. **Reduced Bugs**: No schema drift between validation and database
5. **Easier Testing**: Can test schemas independently
6. **Better DX**: Clearer error messages, IDE autocomplete
7. **Future-Proof**: Easy to add GraphQL, OpenAPI docs, etc.

---

## Potential Challenges

1. **Mongoose-Specific Features**: Indexes, refs, virtuals, methods need special handling
2. **Type Conversion**: Zod strings vs Mongoose ObjectIds
3. **Timestamps**: Mongoose `timestamps: true` vs Zod schema
4. **Migration Path**: Need to ensure no breaking changes during migration
5. **Performance**: Validation middleware adds overhead (minimal, but measurable)

---

## Notes for Implementation

- Start with BehaviorRecord schema (already has Zod definition)
- Then tackle User schema (simpler, good learning)
- Test each phase before moving to next
- Keep existing Mongoose models working during migration
- Consider using feature flags to gradually roll out validation

