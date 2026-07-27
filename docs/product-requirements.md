# Diabetes Diary Product Requirements

## 1. Application Overview

The application is intended for personal diabetes diary management. A user can record glucose readings, food information, meal photos, notes, and related events. The application can perform AI analysis of a food photo to provide an approximate estimate of its contents, calories, and macronutrients.

The application supports two user types:

1. **User** — the primary user who maintains their diary.
2. **Follower** — an observer who has read-only access to the diary of a selected User.

Authentication is required on first launch. The application cannot be used without authentication.

After authentication, access is granted only after the email address has been verified and a role has been assigned in Firestore. If the email address is not verified, the application displays the email verification screen. If no role has been assigned, the application displays the access-pending screen.

### Supported Platforms and Languages

MVP platforms:

```text
Android
iOS
Web
```

Interface languages:

```text
English
Russian
```

All user-facing strings are localized.

Platform support is divided as follows:

```text
Android / iOS
→ full interfaces for the user and follower roles;
→ the owner's local diary;
→ synchronization, cloud screen, AI, import, and export.

Web
→ authentication, email verification, and role-pending screen;
→ read-only follower diary;
→ profile and sign-out.
```

A user with `role = user` who opens the Web version sees a notice that maintaining their own diary is not supported on that platform. Web does not open the owner's local database and does not provide entry creation, editing, synchronization, AI analysis, import, export, or the owner's cloud diary tab.

The system glucose-check timer is implemented only on Android.

## 2. Users and Roles

The application uses the following roles:

### `null`

The default role after registration.

The user:

- is authenticated;
- has a Firestore document;
- has no access to application functionality;
- sees the “Access not granted” screen.

The role is changed manually by an administrator in Firestore.

### `user`

The primary application user.

A user with the `user` role:

- maintains their diary;
- creates glucose entries;
- creates food entries;
- adds meal photos;
- starts AI analysis of meal photos;
- deletes a saved AI analysis result;
- views their own data;
- may have one or more follower users.

### `follower`

An observer user.

A user with the `follower` role:

- does not maintain a personal diary;
- cannot create or edit the primary user's entries;
- can only view the diary of the user specified in `followedUserId`;
- sees the “No user assigned to follow” state if `followedUserId` is not set.

## 3. Authentication

Authentication is implemented with Firebase Auth.

The following flows are supported:

```text
registration with email and password;
sign-in with email and password;
password reset by email;
Google sign-in for an existing account;
email verification.
```

Google registration is not used as a separate flow. The user first creates an account with email and password. Google sign-in with the same email must open the existing application profile and the same diary rather than create a new one.

During registration, the user must provide a nickname. After `trim`, the nickname length must be from 1 to 255 characters. The nickname is set only during registration and cannot be changed through the application UI in the MVP.

After successful registration, the application:

1. creates a Firebase Auth user;
2. stores the nickname in Firebase Auth `displayName`;
3. creates or restores the user's Firestore document;
4. opens the email verification state.

The user sends the verification email through an explicit action on the screen. After the message has been sent, resend and verification-status check actions become available.

Access to the tab interface and diary is not granted until the email address is verified, regardless of the assigned role.

After any successful online authentication or restoration of an existing Auth session, the application checks `users/{uid}`. If the document does not exist, it is recreated with default values. A missing Firestore document is not treated as deletion of the Firebase Auth user and is not a reason to sign out.

The user identifier is the Firebase Auth `uid`. No additional UUID is created.

## 4. Firestore User Collection

All users are stored in:

```text
users/{uid}
```

Where `{uid}` is the user's Firebase Auth UID.

## 5. User Document Structure

```json
{
  "uid": "firebase_auth_uid",
  "email": "user@example.com",
  "nickname": "Andrei",
  "emailVerified": false,
  "role": null,
  "followerUserIds": [],
  "followedUserId": null,
  "createdAt": "serverTimestamp",
  "updatedAt": "serverTimestamp"
}
```

## 6. User Field Definitions

### `uid`

Type: `string`

The user's unique technical identifier. The current Firebase Auth UID is the source of truth.

If the field is missing, empty, or does not match the current Auth UID, the application restores it using the current `uid`.

---

### `email`

Type: `string`

The user's email address from Firebase Auth. It is used for display and manual identification of the user in Firestore.

If Firebase Auth provides an email address, the Firestore value is updated from it. If the Auth email is absent but the document contains a valid string, that value is preserved. If the email is absent in both places, an empty string is used.

---

### `nickname`

Type: `string`

The user's display name. It is not a unique identifier.

A nickname is required during registration. After `trim`, its valid length is from 1 to 255 characters. Changing the nickname through the application is not supported in the MVP.

If the field is missing, has the wrong type, or is empty after `trim`, it is restored in the following order:

1. Firebase Auth `displayName`;
2. the part of the email before `@`;
3. the string `user`.

An existing valid nickname is not replaced automatically.

---

### `emailVerified`

Type: `boolean`

A mirrored informational value of the email verification status.

The source of truth is:

```text
Firebase Auth currentUser.emailVerified
```

The Firestore field is not used to grant access and is not included in Firebase Security Rules as an access condition. A user cannot verify their email address by changing this field.

After the current Auth user has been successfully retrieved, the value is copied to Firestore and the local profile. If the field is missing, has the wrong type, or differs from Firebase Auth, the Firebase Auth value is applied.

---

### `role`

Type: `null | "user" | "follower"`

The user's role in the application. Default:

```json
"role": null
```

The field cannot be changed by the user through the application. The role is assigned manually by an administrator in Firestore.

Allowed values:

```text
null
user
follower
```

If the field is missing or contains an unsupported value, it is restored as `null`. The role must not be inferred from other document fields.

---

### `followerUserIds`

Type: `string[]`

A list of follower UIDs that are allowed to view the owner's diary.

If the field is missing or is not an array, an empty array is used. Invalid items are removed; only non-empty unique strings are retained.

---

### `followedUserId`

Type: `string | null`

The UID of the user followed by the follower.

If the field is missing, has the wrong type, or contains an empty string, `null` is used.

---

### `createdAt`

Type: `Timestamp`

The user document creation date. If the field is missing or corrupted, it is restored using the current `serverTimestamp`. A valid existing value is not changed.

---

### `updatedAt`

Type: `Timestamp`

The date of the last user document update. If the application repairs at least one document field, `updatedAt` is updated. If the field is missing or corrupted, the current `serverTimestamp` is used.

Additional unknown fields in the user document are not deleted and are ignored by the application.

## 7. Initial Sign-In Logic

The first sign-in and every new sign-in after an explicit sign-out require an internet connection.

After Firebase Auth initialization, the application waits for the final session state.

If `currentUser === null`:

- the local profile cache is removed;
- the previous user's open local database is closed;
- the authentication screen is opened;
- local entries and photos are not deleted.

If an Auth session exists and the internet is available, the application:

1. retrieves the current `uid`, `email`, `displayName`, and `emailVerified` from Firebase Auth;
2. loads `users/{uid}` from Firestore;
3. creates a complete default document if none exists;
4. validates all required fields and partially repairs missing or invalid values if the document exists;
5. preserves valid existing values, except fields for which Firebase Auth is the source of truth;
6. stores the normalized profile locally;
7. routes according to `emailVerified`, `role`, and the follower relationship.

The default document is created with the following values:

```ts
{
  uid: currentUser.uid,
  email: currentUser.email ?? '',
  nickname: currentUser.displayName?.trim()
    || currentUser.email?.split('@')[0]
    || 'user',
  emailVerified: currentUser.emailVerified,
  role: null,
  followerUserIds: [],
  followedUserId: null,
  createdAt: serverTimestamp,
  updatedAt: serverTimestamp,
}
```

Only one profile is stored locally at a time:

```ts
{
  uid: string;
  email: string;
  nickname: string;
  emailVerified: boolean;
  role: null | 'user' | 'follower';
  followerUserIds: string[];
  followedUserId: string | null;
}
```

When the application starts without Firestore access, the local profile is used only if an Auth session for the same UID has been restored. If no saved profile exists, offline access is not granted.

A missing `users/{uid}` document does not cause sign-out and does not remove the local profile: the document is restored when a valid Auth session is confirmed.

A Firestore `permission-denied` response is not treated as a missing document. In that case, the document is not recreated, the cloud operation is treated as failed, and automatic sign-out occurs only after a separate error indicating an invalid Firebase Auth session.

The application does not perform a separate forced token refresh on every launch. Session validity is determined by standard Firebase Auth behavior and cloud request results. If Firebase reports that the Auth user has been deleted, disabled, or that the token is no longer valid, the application:

- signs out;
- removes the local profile cache;
- closes the local database for the current UID;
- opens the authentication screen;
- does not delete local entries or photos.

If the network or Firebase is temporarily unavailable, a previously saved profile may be used for offline mode. Lack of internet access alone does not trigger sign-out.

On explicit sign-out, the local profile is removed and the current database is closed, but the user's local database and photos remain on the device.

## 8. Routing After Authentication

Checks are performed in the following order.

If `emailVerified === false`:

```text
Open the “Email verification” state of the authentication screen.
```

The screen provides actions to send or resend the email, check verification, and sign out.

If the email is verified and `role === null`:

```text
Open the restricted “Pending” and “Profile” interface.
```

If the email is verified and `role === "user"`:

```text
Android / iOS → open the “Diary”, “Cloud”, and “Profile” tabs.
Web           → show the unsupported-platform notice and a sign-out action.
```

If the email is verified and `role === "follower"`:

```text
Open the “Diary” and “Profile” tabs.
```

A missing `followedUserId` does not block the follower interface from opening. In this case, the diary tab displays the “No user assigned to follow” state.

Before opening each follower diary page, the application does not make a separate request for the owner's document. Current read permission and the bidirectional relationship are ultimately enforced by Firebase Security Rules.

## 9. User–Follower Relationship

In the first stage, relationships between users are created manually in Firestore.

To link a follower to a user:

1. Add the follower UID to `followerUserIds` in the primary user's `users/{userUid}` document.
2. Set the primary user's UID in `followedUserId` in the follower's `users/{followerUid}` document.

Example primary user:

```json
{
  "uid": "user_123",
  "email": "main@example.com",
  "nickname": "Andrei",
  "emailVerified": true,
  "role": "user",
  "followerUserIds": ["follower_456"],
  "followedUserId": null
}
```

Example follower user:

```json
{
  "uid": "follower_456",
  "email": "viewer@example.com",
  "nickname": "Follower",
  "emailVerified": true,
  "role": "follower",
  "followerUserIds": [],
  "followedUserId": "user_123"
}
```

## 10. First-Stage Limitations

The first stage does not include:

- follow requests;
- automatic follower approval;
- request and relationship history;
- administrator roles in the application;
- role changes from the UI;
- nickname changes after registration;
- user search by login;
- a unique username;
- an application backend for user management.

All roles and relationships between users are configured manually in Firestore.

## 11. User Diary

The user diary stores universal entries. A diary entry is not divided into separate types such as “glucose,” “food,” or “insulin.” All data is stored in one entry, and unfilled fields are stored as `null`.

The cloud copy of diary entries is stored in Firestore at:

```text
users/{uid}/diaryEntries/{entryId}
```

For a user with the `user` role, the primary diary data source on the device is described below in the offline-first section.

Where:

```text
{uid}      — the diary owner's Firebase Auth UID
{entryId}  — the unique ID of a specific diary entry
```

The user's diary is the entire collection:

```text
users/{uid}/diaryEntries
```

No separate diary document is created.

## 12. Diary Entry Structure

```json
{
  "id": "entry_id",
  "userId": "firebase_auth_uid",

  "glucose": 7.4,
  "mealRelation": "beforeMeal",

  "shortInsulin": 4,
  "longInsulin": null,

  "carbsGram": 35,

  "comment": "Lunch.",
  "aiAnalysis": "Food: rice with chicken\nCalories: ~520 kcal\nProtein: ~32 g\nFat: ~14 g\nCarbohydrates: ~63 g",
  "photoPath": "users/user_123/diaryPhotos/entry_123.jpg",
  "photoUrl": "https://firebasestorage.googleapis.com/...",

  "eventAt": "Timestamp"
}
```

## 13. Diary Entry Field Definitions

### `id`

Type: `string`

The unique diary entry ID.

The value matches the Firestore document ID of the entry.

The ID is generated on the client before the entry is saved by creating a Firestore document reference.

---

### `userId`

Type: `string`

The diary owner's UID.

It duplicates the UID from the `users/{uid}` path for easier export, import, and local data processing.

---

### `glucose`

Type: `number | null`

The blood glucose level.

All glucose values are stored in one unit. The first stage uses `mmol/L`.

The unit is not stored separately in each entry.

---

### `mealRelation`

Type: `string | null`

A marker relative to a meal or time of day.

The value is stored as a string key. Human-readable text is rendered by the client.

Allowed values:

```text
beforeMeal
afterMeal
fasting
bedtime
night
```

If no marker is selected, the value is `null`. A `null` value is not considered a meaningful entry field.

---

### `shortInsulin`

Type: `number | null`

The number of short-acting insulin units.

If no value is provided, the field is `null`.

---

### `longInsulin`

Type: `number | null`

The number of long-acting insulin units.

If no value is provided, the field is `null`.

---

### `carbsGram`

Type: `number | null`

The amount of carbohydrates in grams.

If no value is provided, the field is `null`. Bread units are not calculated or displayed in the MVP.

---

### `comment`

Type: `string`

The user's comment.

The field contains only text entered by the user. The AI analysis result is not written to `comment`.

If there is no comment, the field contains an empty string.

---

### `aiAnalysis`

Type: `string`

The current AI analysis result for the meal photo.

The field is populated only after a successful AI request. The user cannot edit it manually.

If AI analysis has not yet been run, has been deleted by the user, or is absent, the field contains an empty string.

A subsequent successful AI analysis completely replaces the previous `aiAnalysis` value. The previous result is not sent with a new AI request.

Changing, replacing, or deleting a photo does not change `aiAnalysis` by itself.

---

### `photoPath`

Type: `string | null`

The photo file path in Firebase Storage.

Example:

```text
users/user_123/diaryPhotos/entry_123.jpg
```

The field is used to upload, overwrite, and delete the file in Firebase Storage. `photoPath` is not used to render the image directly.

If there is no photo, the value is `null`.

Exception: when a photo is deleted locally in offline-first mode, `photoPath` may temporarily preserve the path of the file that must be deleted from Storage during the next synchronization. After successful synchronization, `photoPath` is cleared.

For an imported entry, `photoPath` is always generated for the current user. At the same time, the stored `photoUrl` may temporarily point to a photo from the source backup. Until the local file is uploaded again, these fields do not have to refer to the same Storage object.

### `photoUrl`

Type: `string | null`

The Firebase Storage download URL of the photo.

It is used by the client to display the image without an additional Storage request to obtain a URL.

After every successful photo upload or overwrite, the application obtains the current download URL and appends a unique version query parameter, for example:

```text
&v={timestamp}
```

The resulting string is stored in `photoUrl`. This prevents the application and followers from showing a previously cached photo version after a new file has been saved to the same `photoPath`.

If there is no photo, the value is `null`.

### `eventAt`

Firestore type: `Timestamp`

The event date and time selected by the user in the form.

This is not the Firestore document creation date.

Example: if the user measured glucose at 12:00 and entered the record at 12:20, `eventAt` must store 12:00.

The user selects the date and time in the device's local time zone. The value is converted to UTC before storage.

Storage formats:

```text
SQLite     — UTC milliseconds in INTEGER
JavaScript — Date
Firestore  — Timestamp
Backup     — ISO 8601 UTC with Z suffix
```

Example backup value:

```text
2026-07-14T12:30:00.000Z
```

When displayed, the value is converted to the viewer's current local time zone. This applies to both the diary owner and the follower. Therefore, the same moment may be shown to different users with different dates and times.

Diary entries are sorted by this field.

### Current Date and Time Mode in the Form

The create and edit forms contain a separate checkbox for current date and time mode. The checkbox is not an entry field and is not stored in local storage, Firestore, backup, or CSV.

In the create form:

- the current date and time are placed in `eventAt` when the form opens;
- the current date and time checkbox is enabled by default;
- while the checkbox is enabled, the date and time fields are unavailable;
- on save, the displayed `eventAt` value is ignored and the application records the current device time at the moment the save button is pressed;
- if the checkbox is disabled, the displayed manually selected `eventAt` value is used.

Toggling the checkbox does not change or clear the manual form value. If the user selects another time, enables the checkbox, and then disables it again, the previously selected time is shown again.

In the edit form:

- the checkbox is disabled by default;
- `eventAt` contains the entry's saved time;
- when the checkbox is enabled, the manual value remains in form state but is ignored on save;
- when the checkbox is disabled again, the saved or manually changed value is shown again.

The current time is captured before long-running operations begin, including photo normalization, Storage upload, and the AI request. The duration of these operations must not shift `eventAt`.

Future `eventAt` values are allowed. The application does not restrict events to the current or past time.

## 14. Offline-First Diary Mode

For a user with the `user` role, the diary follows a local-first model only on Android and iOS.

The owner's primary data sources are the local SQLite database and local application files. Firestore is not the source of truth for the local list and is used as a cloud copy for:

- follower access to the diary;
- storage of a synchronized version;
- the owner's “Cloud” tab;
- manual downloading of selected cloud entries.

The application changes local data first and then synchronizes it with Firebase when internet access is available.

Automatic reverse synchronization of the entire diary is not implemented:

```text
Firebase → SQLite
```

Cloud entries are downloaded only through an explicit owner action in the “Cloud” tab.

The owner's local diary is not created or opened on Web. Web is used for follower viewing and shared authentication flows.

## 15. Local Data Storage

Android and iOS use:

```text
SQLite       — entries and synchronization statuses
FileSystem   — local photos
```

A separate directory is created for each Firebase UID, for example:

```text
app document directory/users/{uid}/
├── database/
│   └── diary.db
└── diaryPhotos/
    ├── {entryId}.jpg
    └── ...
```

On sign-in, the application opens only the local storage for the current UID. On sign-out or account change, it is closed and no longer used by the UI, but the data remains on the device.

Photos are not stored inside the entry table as binary blobs. The entry stores only a local reference:

```text
localPhotoUri
```

This is a real path without query parameters:

```text
file:///.../users/{uid}/diaryPhotos/{entryId}.jpg
```

Photos are not saved to the cache directory or the device gallery.

Uninstalling the application or clearing its data removes local databases, photos, the profile, and unsynchronized changes.

## 16. Local Diary Entry Structure

The cloud entry structure remains as described above:

```json
{
  "id": "entry_id",
  "userId": "firebase_auth_uid",
  "glucose": 7.4,
  "mealRelation": "beforeMeal",
  "shortInsulin": 4,
  "longInsulin": null,
  "carbsGram": 35,
  "comment": "Lunch",
  "aiAnalysis": "Food: rice with chicken\nCalories: ~520 kcal\nProtein: ~32 g\nFat: ~14 g\nCarbohydrates: ~63 g",
  "photoPath": "users/user_123/diaryPhotos/entry_123.jpg",
  "photoUrl": "https://firebasestorage.googleapis.com/...",
  "eventAt": "Timestamp"
}
```

The local entry also contains service fields:

```ts
{
  localPhotoUri: string | null;
  syncStatus: 'synced' | 'pendingCreate' | 'pendingUpdate' | 'pendingDelete';
}
```

The following fields are not sent to Firestore:

```text
localPhotoUri
syncStatus
```

### `localPhotoUri`

Type: `string | null`

The local reference to the entry photo.

The path has the form:

```text
file:///.../users/{uid}/diaryPhotos/entry_123.jpg
```

If no local file exists, the value is `null`.

### `syncStatus`

Type:

```ts
'synced' | 'pendingCreate' | 'pendingUpdate' | 'pendingDelete'
```

Values:

```text
synced        — the last known synchronization of the entry with the cloud succeeded
pendingCreate — the entry was created locally and must be created or overwritten in the cloud
pendingUpdate — the entry was changed locally and must be updated or overwritten in the cloud
pendingDelete — the entry was deleted locally and must be deleted from the cloud
```

`syncStatus = synced` does not guarantee that the entry currently exists in the cloud. It only means that the last known synchronization succeeded.

## 17. Creating `entryId`

The application creates the entry ID before saving the entry.

A Firestore document reference may be created:

```ts
const entryRef = doc(collection(db, 'users', uid, 'diaryEntries'));
const entryId = entryRef.id;
```

Creating the reference does not create a Firestore document. It only provides a locally generated ID.

The same `entryId` is used:

- as the entry ID in the local database;
- as the Firestore document ID;
- as part of the Storage photo path.

The photo path is formed as follows:

```text
users/{uid}/diaryPhotos/{entryId}.jpg
```

## 18. Creating a Diary Entry

Opening the create form does not make Firestore, Storage, or AI requests.

When the create button is pressed, the application first captures the final `eventAt` and verifies that at least one meaningful field other than date and time is filled.

### Selected Photo Normalization

The photo is not cropped.

Before local storage, the selected or captured image is normalized:

1. orientation, including EXIF orientation, is applied;
2. aspect ratio is preserved;
3. the longer side is reduced to `1280 px` if it was larger;
4. small images are not enlarged;
5. the result is re-encoded as JPEG at approximately `85%` quality;
6. the final file is saved as `{entryId}.jpg`.

This exact JPEG is used locally, in Firebase Storage, in a full backup, and for AI analysis. The maximum allowed final image size for AI is 10 MB.

If the photo cannot be processed or saved safely, a new entry with that photo is not created.

### Creating an Entry Without a Photo

1. An `entryId` is created.
2. The entry is immediately saved to SQLite with `pendingCreate` status.
3. The form closes, the list moves to the first page, and the new entry is shown.
4. If internet access is available, a targeted synchronization request for this specific `entryId` is queued.
5. After a successful Firestore upsert, the status becomes `synced`.
6. Without internet access or after an error, the entry remains `pendingCreate` and is later picked up by batch synchronization.

### Creating an Entry With a Photo

1. An `entryId` is created.
2. The photo is normalized into a temporary file, validated, and safely moved into permanent local storage.
3. A preliminary entry is created in SQLite:

```ts
localPhotoUri = 'local path to {entryId}.jpg';
photoPath = 'users/{uid}/diaryPhotos/{entryId}.jpg';
photoUrl = null;
aiAnalysis = '';
syncStatus = 'pendingCreate';
```

4. While the form prepares the photo and the selected AI operation, this `entryId` is excluded from the general synchronization process.
5. If internet access is available, the JPEG is uploaded to Storage at the permanent `photoPath`.
6. The resulting `photoUrl`, including its version parameter, is immediately saved to SQLite.
7. If AI was selected, the request is made after the current `photoUrl` is obtained; a successful result is also saved to SQLite immediately.
8. After preparation, the entry becomes available to the synchronizer again, the form closes, and the card is shown in the local list.
9. If the photo was prepared successfully or there is no photo, targeted synchronization for the known `entryId` is queued.
10. Firestore receives the final local version separately from the form. During this operation, the card displays “Synchronizing…”.

If the photo upload fails:

- the form closes;
- the entry and local JPEG remain with `pendingCreate` status;
- AI is not started;
- targeted Firestore synchronization is not queued;
- the next attempt can occur through batch or forced synchronization.

If AI fails, the entry is still synchronized with the previous or empty `aiAnalysis`. AI is not automatically retried later.

If the application closes after the preliminary local save, the entry and photo are not lost. On the next launch, batch synchronization continues using the saved fields, but an unfinished AI request is not resumed.

## 19. AI Photo Analysis

AI analysis is not a separate entity. Its current user-facing result is stored in the entry's string field:

```ts
aiAnalysis: string;
```

AI does not modify `comment`, `carbsGram`, insulin doses, or any other user-entered fields.

### Starting AI Analysis

AI is started only when the user explicitly selects the checkbox in the create or edit form and then presses the primary save button.

The checkbox:

- is disabled each time the form opens;
- is available only to the `user` role on Android and iOS;
- requires a photo and internet access;
- is not triggered when the form opens, when an entry is synchronized, or when network access is restored;
- is not stored as an entry field.

Before the first AI request, the user confirms that the photo and part of the comment will be sent to an external AI provider. The following warning is permanently displayed next to the feature:

```text
The AI estimate is approximate. Do not use it to calculate an insulin dose.
```

### AI Request Data

The application does not call Gemini directly. It calls a protected Cloudflare Worker.

The request includes:

```text
entryId;
photoPath;
the current photoUrl from Firebase Storage;
the first 1000 characters of comment;
the current application language: en or ru;
Firebase ID token in the authorization header.
```

The Worker verifies the user, role, URL ownership, and limits, and then passes `photoUrl` to the selected Gemini Flash model. The AI API key is never included in the application.

The photo must be a JPEG, belong to the expected Storage bucket and current user's path, and be no larger than 10 MB.

### Limits

The MVP applies the following server-side limits:

```text
5 AI requests per user per UTC calendar day;
no more than one active AI request per user;
no more than one new request every 30 seconds;
a global daily project limit.
```

An attempt is charged immediately before the AI provider is called. Once the request has been sent to the provider, the attempt is not restored after a timeout, error, `not_food`, or `insufficient_data` result.

### Saving and Partial Results

The model response contains a description, calorie and macronutrient ranges, confidence, and assumptions.

Supported statuses:

```text
ok                — all primary fields are valid;
partial           — a useful result exists, but one or more fields could not be determined;
not_food          — the image does not contain food;
insufficient_data — there is not enough information for a reasonable estimate.
```

Valid parts of a `partial` result are saved. Missing or invalid values are explicitly shown as “could not be determined.” One invalid value must not discard the entire useful response.

The entire response is rejected only if its JSON or structure cannot be processed, or if it contains no useful valid field.

`not_food`, `insufficient_data`, and any error do not replace the existing `aiAnalysis`.

A successful `ok` or `partial` result is converted by the application into localized text and completely replaces the previous `aiAnalysis`. The structured JSON is not stored separately in the entry.

Example:

```text
Partial estimate.
Food: buckwheat with chicken and vegetables
Calories: 420–580 kcal
Protein: 25–38 g
Fat: could not be determined
Carbohydrates: 45–65 g
Confidence: medium
```

The maximum stored `aiAnalysis` length is 2000 characters. An existing analysis is not translated when the application language changes. AI-estimated carbohydrates are not copied into `carbsGram`.

### Errors and Repeat Analysis

The AI wait timeout is 45 seconds. There is no automatic retry and no automatic fallback to another model.

If the user changed other fields, an AI error does not cancel their local save or synchronization with the previous AI text.

If repeating AI analysis was the only action and it failed, the entry and its `syncStatus` do not change.

The user can separately delete a stored analysis:

```ts
aiAnalysis = '';
```

Replacing or deleting a photo without selecting AI does not automatically change `aiAnalysis`.

## 20. Editing a Diary Entry

A user with the `user` role can edit their entries on Android and iOS. A follower cannot edit them.

An entry with `pendingDelete` status, and an entry currently being synchronized, cannot be edited or deleted.

Editable fields:

```text
glucose
mealRelation
shortInsulin
longInsulin
carbsGram
comment
aiAnalysis — only through AI or explicit deletion
eventAt
photo
```

Status transitions:

```text
synced        → pendingUpdate
pendingCreate → pendingCreate
pendingUpdate → pendingUpdate
pendingDelete → editing prohibited
```

Changes are first saved safely to SQLite. After photo preparation and the selected AI operation are complete, the form closes, the card is updated, and targeted synchronization for the known `entryId` is added to the shared queue.

If synchronization begins while the form is already open, the save and delete buttons are temporarily disabled. Before a subsequent save, the entry is read from SQLite again so that a stale form object cannot overwrite the current `photoUrl` and `syncStatus`.

### Editing Without Changing the Photo

`localPhotoUri`, `photoPath`, and `photoUrl` remain unchanged. If AI is not selected, `aiAnalysis` also remains unchanged.

### Safe Photo Addition and Replacement

A new image is first normalized and saved to a temporary file. The existing photo and entry are not removed until the new file has been created, is readable, and the local entry has been updated successfully.

After successful preparation:

```ts
localPhotoUri = 'local reference to {entryId}.jpg';
photoPath = 'users/{uid}/diaryPhotos/{entryId}.jpg';
photoUrl = null;
syncStatus = transitionByCurrentStatus;
```

The path remains constant. The new file overwrites the previous Storage object at the same `photoPath`, after which a new download URL with a new version parameter is stored.

While the form uploads the new photo and performs the selected AI operation, the entry is excluded from the general synchronization process.

If preparing the new file or updating the local entry fails, the old entry and old photo are preserved or restored.

Replacing the photo does not automatically clear `aiAnalysis`. A successful selected AI operation replaces it; without AI, or after an AI error, the previous result is retained.

## 21. Deleting a Photo From an Entry

If the user removes the photo but keeps the entry, `photoPath` must not be cleared before the application has attempted to delete the cloud file.

After a successful local change:

```ts
localPhotoUri = null;
photoPath = 'users/{uid}/diaryPhotos/{entryId}.jpg';
photoUrl = null;
syncStatus = transitionByCurrentStatus;
```

Status transition:

```text
synced        → pendingUpdate
pendingCreate → pendingCreate
pendingUpdate → pendingUpdate
```

The local file is deleted only after the local entry has been updated successfully. If an error occurs, the old photo and entry are preserved or restored.

During synchronization:

1. the file is deleted from Storage using `photoPath`;
2. a missing file is treated as success;
3. local `photoPath` and `photoUrl` are cleared;
4. the Firestore entry is saved without a photo;
5. after success, the status becomes `synced`.

If deletion of the Storage file or the Firestore write does not complete, `photoPath` is preserved and the entry remains pending.

`comment` and `aiAnalysis` are not changed automatically.

## 22. Deleting a Diary Entry

A user with the `user` role can delete an entry with one of the following statuses:

```text
synced
pendingCreate
pendingUpdate
```

A follower cannot delete entries. An entry currently being synchronized cannot be deleted.

After confirmation:

1. the entry receives `syncStatus = pendingDelete`;
2. the form closes;
3. the card remains in the local list;
4. the card becomes gray, inactive, and displays `Deleting…`;
5. a targeted delete operation is added to the shared synchronization queue.

Until deletion is complete:

- the card cannot be opened;
- the photo and full text cannot be opened;
- the entry cannot be selected in bulk-selection mode;
- the entry continues to participate in sorting, local `COUNT(*)`, and pagination.

When processing `pendingDelete`, the application:

1. deletes the Firestore document;
2. deletes the Storage file using `photoPath`, if a path exists;
3. treats a missing cloud document or file as success;
4. deletes the local photo;
5. physically deletes the SQLite row.

Even a `pendingCreate` entry is not deleted from SQLite immediately: a cloud document or photo may have been partially saved before an error occurred.

If internet access is unavailable or deletion fails, the gray card remains until the next targeted, batch, or manual synchronization.

## 23. Photo State Logic

The action for a photo is determined by the combination of local reference, path, URL, and entry status.

```text
localPhotoUri | photoPath | photoUrl | syncStatus                   | Action
--------------|-----------|----------|------------------------------|------------------------------
null          | null      | null     | not pendingDelete            | No photo
present       | present   | null     | pendingCreate/pendingUpdate  | Upload photo
present       | present   | present  | normal synchronization       | Do not upload again
present       | present   | present  | force sync                   | Re-upload photo
null          | present   | present  | not pendingDelete            | Photo available online only
null          | present   | null     | pendingCreate/pendingUpdate  | Delete file from Storage
any           | any       | any      | pendingDelete                | Delete file and entry
```

Core rules:

```text
localPhotoUri exists + photoUrl is null
→ upload the local photo

localPhotoUri is null + photoPath exists + photoUrl is null
+ status is pendingCreate/pendingUpdate
→ delete any possible Storage file, then clear photoPath

force sync + localPhotoUri exists
→ always re-upload the file and obtain a new photoUrl with a new v

pendingDelete
→ delete the related Storage file and Firestore document
```

For display, the owner first uses `localPhotoUri`; if it is absent or fails, `photoUrl` is used. The follower and cloud screen use `photoUrl`.

`photoPath` is not used directly for display and does not by itself prove that an active photo exists: it may temporarily store a path pending deletion or a future path for the current user after import.

## 24. Synchronizing Local Storage → Firebase

One global synchronization coordinator handles `pendingCreate`, `pendingUpdate`, and `pendingDelete`. No more than one entry is processed at a time.

The internal operation for synchronizing one entry is shared. Only the way the ID is obtained differs:

```text
targeted synchronization
→ entryId is already known after creation, editing, or deletion;

batch synchronization
→ first finds all pending entries in SQLite.
```

### Targeted Synchronization

After a specific entry has been prepared successfully locally, its `entryId` is added directly to the queue. The application does not scan for every pending entry after each save.

AI is never started from synchronization.

### Batch Synchronization

The batch check starts:

- after a new application launch, once the database is open and network availability is confirmed;
- after a real `offline → online` network transition;
- through the explicit `Synchronize` action;
- once more after a pass if pending entries were created or changed while it was running.

The following are not used:

- interval-based retries;
- retry timers;
- a separate automatic trigger when the application returns from the background;
- an immediate infinite retry loop for a failed entry.

The initial network event `unknown → online` does not start a second synchronization on top of startup synchronization.

While an entry is in an active photo or AI preparation flow, the shared coordinator skips it. After successful preparation, the form queues a targeted operation. If photo upload fails, the entry waits for the next external batch or manual trigger.

New synchronization requests are queued. Duplicate IDs are merged, and the entry is read again from SQLite before processing, so the latest local state is sent to the cloud.

An error for one entry does not stop the remaining entries. The failed entry keeps its pending status. Successful operations are not rolled back.

For `pendingCreate` and `pendingUpdate`, an upsert is performed using the same `entryId`. The photo action is processed first, and then the current Firestore document is saved. After complete success, the status becomes `synced`.

For `pendingDelete`, final cloud and local cleanup is performed, after which the row is physically deleted.

A targeted operation is represented by a loader on the card. Batch and forced synchronization display overall progress by number of entries.

## 25. Forced Upload of Local Entries to the Cloud

Forced upload means:

```text
Upload local entries to the cloud
```

It is not bidirectional synchronization:

- it does not merge;
- it does not compare versions;
- it does not download cloud data;
- it does not delete cloud entries that do not exist locally;
- it works with selected local entries or the current page;
- the local version overwrites the cloud version.

Each entry is processed independently.

For a local file:

```text
localPhotoUri exists
```

the application always uploads it again using `photoPath`, regardless of the existing `photoUrl`, obtains a new URL, appends a new `v`, stores the URL locally, and sends the entry to Firestore.

For a photo deleted locally:

```text
localPhotoUri = null
photoPath = present
photoUrl = null
syncStatus = pendingCreate or pendingUpdate
```

the application:

1. deletes the Storage file using `photoPath`;
2. treats a missing file as success;
3. clears local `photoPath` and `photoUrl`;
4. sends the Firestore entry without a photo.

For a photo that exists only in the cloud:

```text
localPhotoUri = null
photoPath = present
photoUrl = present
```

the file is neither uploaded nor deleted. Current fields are sent to Firestore. If the URL is broken, restoration is impossible without a local file.

If there is no photo at all, the entry is sent with `photoPath = null` and `photoUrl = null`.

`pendingDelete` is not uploaded as a normal entry; it is processed by the final deletion mechanism.

After complete success, `pendingCreate` or `pendingUpdate` becomes `synced`.

## 26. Extra Cloud Entries and Cloud Conflicts

If the cloud contains an entry that does not exist locally, forced upload does not delete it.

To delete such an entry, the user uses the required “Cloud Entries” screen:

1. downloads the entry locally;
2. confirms the conflict if necessary;
3. deletes it locally;
4. waits for `pendingDelete` synchronization.

If a cloud entry is newer but has the same `entryId`, force sync still overwrites it with the local version.

If `photoUrl` is broken but `localPhotoUri` exists, force sync can restore the Storage file and replace the URL with a new value containing a new `v`. Restoration is impossible without a local file.

Unknown Storage files that are no longer referenced by any `photoPath` in either local or cloud entries are not discovered automatically and may remain as orphaned files. Global orphan discovery and cleanup are not implemented in the MVP.

## 27. Retrieving and Paginating Entries for the Diary Owner

For the `user` role on Android and iOS, the diary is displayed from SQLite.

Entries are sorted by `eventAt` descending, then by `id` descending. Future values participate in sorting like ordinary entries.

A `pendingDelete` entry remains in the list as a gray inactive `Deleting…` card until cloud and local file cleanup succeeds.

The local page size is 30 entries. Pagination is calculated by number of entries, not by calendar days.

The currently open page does not limit synchronization of other pending entries.

## 28. Retrieving Entries for a Follower

A follower reads the diary only from Firestore and works online on Android, iOS, and Web.

If `followedUserId` is missing, no diary request is made and the following state is displayed:

```text
No user assigned to follow
```

If a UID is assigned, the application loads:

```text
users/{followedUserId}/diaryEntries
```

The application does not make an additional owner-document request before each page. The bidirectional relationship, owner role, and read permission are enforced by Firebase Security Rules.

The follower has read-only access. Entry cards, full text, and photos can be viewed.

Cloud pagination:

```text
30 displayed entries;
request at most 31 documents;
sort by eventAt DESC, then document ID DESC;
“Previous” and “Next” buttons;
no total count or last-page number.
```

There are no automatic realtime updates, intervals, focus refetch, background-return refetch, or network-restoration refetch. Data is reloaded on the first opening after a new application launch, after a new sign-in, or through the explicit `Refresh list` action.

Follower states:

```text
No user assigned to follow
Diary access not granted
No diary entries yet
Failed to load diary
```

`permission-denied` is displayed as “Diary access not granted.” A temporary Firebase error does not trigger automatic sign-out unless the Auth session is explicitly determined to be invalid.

## 29. Cloud Viewing and Manual Entry Download

The `Cloud` tab is a required part of the `user` interface on Android and iOS. It reads the user's own entries directly from Firestore and is not the source of truth for the local diary.

The owner and follower use a shared read-only card interface. The owner can additionally select entries from the current cloud page and download them into SQLite.

The cloud list:

- displays up to 30 entries per page;
- uses cursor pagination with `Previous` / `Next`;
- has no search, filters, total count, or last page;
- refreshes only on the first opening in a new session or through the explicit `Refresh list` action;
- displays photos directly from `photoUrl`.

The owner can download one or more entries from the current page, up to 30. The selected documents are not fetched again: the cloud object snapshot already shown to the user is used.

The photo is not downloaded locally. The following values are stored:

```ts
localPhotoUri = null;
photoPath = cloudEntry.photoPath;
photoUrl = cloudEntry.photoUrl;
syncStatus = 'synced';
```

If no local entry with the same `id` exists, it is added. In case of a conflict, including `pendingDelete`, the user chooses to skip or fully replace the local version. Replacing a `pendingDelete` entry cancels the deletion.

Download runs under a shared lock for operations that modify SQLite. While it is active, entry creation, editing, deletion, AI, synchronization, import, export, and another download cannot start.

Each selected entry is processed independently. The result shows the number of added, replaced, skipped, and failed entries. Downloaded entries are not automatically uploaded back to Firestore.

## 30. Diary Access

Access depends on role and platform.

### User With the `user` Role

On Android and iOS, the user can:

- read, create, edit, and delete local entries;
- save local photos;
- synchronize entries with the cloud;
- perform forced upload;
- open the `Cloud` tab and manually download entries;
- start AI analysis and delete `aiAnalysis`;
- import and export the local diary;
- create a system timer on Android.

On Web, the user sees only the unsupported-platform notice and has no access to their own diary.

### User With the `follower` Role

On Android, iOS, and Web, the follower can:

- read the diary of the user specified by `followedUserId`;
- view entries, photos, and saved AI analysis through Firestore and Storage.

The follower cannot create, edit, delete, or download another user's entries into a local database, manage photos, start AI, import, export, or create timers.

### Follower Access Condition

A follower can read a diary only when the relationship is bidirectional:

```text
users/{followerUid}.followedUserId = userUid
users/{userUid}.followerUserIds contains followerUid
```

The client uses `followedUserId` to build the request path, but Firebase Security Rules make the final read-access decision. A one-sided relationship does not grant access.

## 31. Authentication and Offline Access

The first sign-in and every sign-in after an explicit sign-out require internet access.

Firebase Auth can restore a local session without Firestore. After initialization:

- if `currentUser` is absent, the profile cache is removed and authentication is opened;
- if a session exists and Firestore is available, the profile is loaded and normalized;
- if Firestore is temporarily unavailable, the cached profile for the same UID is used;
- if no cache exists, offline access is not granted.

A separate forced token refresh is not performed on every launch. If Firebase returns an error that explicitly means the session is invalid, the application signs out, removes the profile cache, and closes the local database for the current UID.

On Android and iOS, a previously verified user with the `user` role can work with the local diary offline. Creates and edits remain pending until the next external synchronization trigger.

A follower always depends on Firestore to retrieve new pages. A page already shown may remain visible until the next network action, but no persistent offline follower diary is created.

Web does not provide an offline diary for the owner.

The role and follower relationships are not checked periodically during an open offline session. Administrator changes apply after the next successful profile retrieval, while cloud requests may begin to be rejected by Security Rules before the local interface is updated.

On sign-out:

- the Auth session ends;
- the profile cache is removed;
- the local database for the current UID is closed on Android and iOS;
- local entries and photos are not deleted.

If the account is deleted, local data remains. A new registration with the same email may receive a different UID and a separate local database.

If the role on a native platform changes to `null` or `follower`, the previous personal database is not deleted but is no longer used by the current interface.

Uninstalling the application or clearing its data removes local entries, photos, the profile, and unsynchronized changes.

## 32. Export and Import

Export and import are available only to a user with the `user` role on Android and iOS. These functions are not available on Web.

A user with the `follower` role cannot:

- export another user's diary;
- import entries;
- create a backup of another user's data;
- create a CSV file of another user's diary.

Export and import are not Firebase synchronization. A backup operates only on local entries and local photos stored on the current device.

Importing a backup does not write data to Firestore and does not upload photos to Firebase Storage. If the user wants to send imported entries to the cloud afterward, they must explicitly run forced upload of local entries.

### 32.1. Export Types

The first stage supports three export types.

#### Full Application Backup

A ZIP archive for restoring entries together with local photos. It contains:

```text
manifest.json
entries/
photos/
```

Photos are included only from local storage. Cloud images are not downloaded specifically for export.

#### Lightweight Application Backup

A ZIP archive without local photos:

```text
manifest.json
entries/
```

`photoUrl` is preserved, so a photo may still be displayed online after import while the link remains valid.

#### Tabular Export

CSV is intended only for viewing and cannot be imported back into the application.

The column order is fixed:

```text
eventAt;
glucose;
mealRelation;
shortInsulin;
longInsulin;
carbsGram;
comment;
aiAnalysis;
photoUrl
```

CSV does not contain IDs, `userId`, `photoPath`, `localPhotoUri`, `syncStatus`, or local photos.

Parameters:

```text
delimiter: ;
encoding: UTF-8 with BOM
```

Headers and `mealRelation` values are exported as localized text in the current application language. Numbers are formatted according to the current language: a decimal point for English and a decimal comma for Russian. Units are not appended to cells.

`eventAt` is exported in the local time zone using an unambiguous human-readable format for the current language.

Fields containing `;`, a double quote, or a line break are enclosed in double quotes. An internal double quote is escaped by doubling it.

### 32.2. Export Scope

The following scopes are available for backup and CSV:

```text
all entries
entries within a selected period
selected entries
```

Export by a specified number of entries is not implemented.

Period export uses `eventAt`:

```text
fromDate <= eventAt <= toDate
```

The user selects period boundaries in their local time zone. The boundaries are converted to UTC before the local query.

The interface may use a calendar with date-range selection.

If `fromDate > toDate`, export does not start. If the selected scope contains no entries, no file is created and the message “No entries to export” is displayed.

Entries with `pendingDelete` status are not exported to backup or CSV because they have already been deleted from the user's perspective.

Entries with `synced`, `pendingCreate`, and `pendingUpdate` statuses are exported as normal visible entries. Their `syncStatus` is not stored as a command for a future import.

In a backup, `eventAt` is stored as ISO 8601 UTC with `Z`. In CSV, date and time are displayed in the local time zone of the user performing the export.

### 32.3. Exported File Names

An exported file name must include:

```text
application name
export type
user name
backup/CSV creation date and time
record period or all/selected marker
```

General template:

```text
{appName}_{exportType}_{userName}_{exportedAt}_{recordsScope}.{extension}
```

Where:

```text
appName      — the technical application name, for example diabetes-diary
exportType   — backup, backup-light, or csv
userName     — the current user's nickname converted to a safe file name
exportedAt   — file creation date and time
recordsScope — all, selected, or a record period
extension    — zip or csv
```

Examples:

```text
diabetes-diary_backup_andrei_2026-07-14_15-42_all.zip
diabetes-diary_backup-light_andrei_2026-07-14_15-42_all.zip
diabetes-diary_csv_andrei_2026-07-14_15-42_all.csv
```

For period export:

```text
diabetes-diary_backup_andrei_2026-07-14_15-42_2026-01-01_to_2026-01-31.zip
diabetes-diary_backup-light_andrei_2026-07-14_15-42_2026-01-01_to_2026-01-31.zip
diabetes-diary_csv_andrei_2026-07-14_15-42_2026-01-01_to_2026-01-31.csv
```

For selected entries:

```text
diabetes-diary_backup_andrei_2026-07-14_15-42_selected.zip
```

`userName` is included only for user convenience. It does not protect the backup file.

If `nickname` is missing or contains characters that cannot be used in a file name, the application replaces it with a safe value such as `user`.

### 32.4. Backup Archive Structure

The backup archive must not store all entries in one large `entries.json` file.

Entries are divided into chunk files:

```text
diabetes-diary-backup.zip
  ├── manifest.json
  ├── entries/
  │   ├── entries_000001.json
  │   ├── entries_000002.json
  │   └── entries_000003.json
  └── photos/
      ├── entry_123.jpg
      └── entry_456.jpg
```

One chunk must contain no more than:

```text
300 entries
```

This prevents the application from keeping thousands of entries in one large JSON object in memory during export or import.

### 32.5. `manifest.json`

Every backup archive must contain:

```text
manifest.json
```

Example:

```json
{
  "app": "diabetes-diary",
  "formatVersion": 1,
  "exportType": "fullBackup",
  "exportedAt": "2026-07-14T12:00:00.000Z",
  "sourceUserName": "Andrei",
  "sourceUserId": "firebase_auth_uid",
  "entriesCount": 2400,
  "photosCount": 1300,
  "withPhotos": true,
  "recordsScope": {
    "type": "period",
    "from": "2026-01-01T00:00:00.000Z",
    "to": "2026-01-31T23:59:59.999Z"
  },
  "chunks": [
    "entries/entries_000001.json",
    "entries/entries_000002.json"
  ]
}
```

`formatVersion` is required.

If the application does not support the backup format version, import is prohibited.

`sourceUserId` and `sourceUserName` are informational only. They are not used as protection and do not block import.

### 32.6. Entry Format Inside a Backup

A backup entry must contain diary data and a reference to the photo file inside the archive if that photo was included.

Example:

```json
{
  "id": "entry_123",
  "glucose": 7.4,
  "mealRelation": "beforeMeal",
  "shortInsulin": 4,
  "longInsulin": null,
  "carbsGram": 35,
  "comment": "Lunch",
  "aiAnalysis": "Food: rice with chicken\nCalories: ~520 kcal\nProtein: ~32 g\nFat: ~14 g\nCarbohydrates: ~63 g",
  "photoFileName": "entry_123.jpg",
  "photoUrl": "https://firebasestorage.googleapis.com/...",
  "eventAt": "2026-07-14T12:00:00.000Z"
}
```

A backup entry does not need to store:

```text
userId
localPhotoUri
syncStatus
```

`photoPath` is also not used as the final path during import. The application always rebuilds `photoPath` for the current user.

If a full backup contains a local photo, `photoFileName` contains the name of the file inside `photos/`.

If the photo is not included in the backup, the value is:

```json
"photoFileName": null
```

### 32.7. Backup File Security

The backup file is not encrypted in the first stage.

A backup may contain medical data:

```text
glucose levels
insulin
carbohydrates
comments
meal photos
event dates
```

The user is responsible for storing and transferring the backup file securely.

The presence of `sourceUserId`, `sourceUserName`, or a user name in the file name is not protection. Any user who has access to the backup file can technically import it into the application.

### 32.8. Exporting a Large Number of Entries

A large export is processed in batches and does not load all entries or photos into memory at once.

Before export starts, a global lock is enabled for operations that modify local data.

Flow:

1. obtain the selected entries;
2. read them in batches of up to 300;
3. create separate chunk files;
4. add local photos sequentially for a full backup;
5. create the manifest;
6. build the ZIP archive;
7. release the lock after success or failure.

While export is running, the following are prohibited:

- creating, editing, or deleting entries;
- adding, replacing, or deleting photos;
- starting or deleting AI analysis;
- import;
- manual cloud download;
- automatic or forced synchronization;
- sign-out or account change through the UI.

Viewing the diary remains available.

If a local photo is missing or unreadable, the entry is still exported without the file. Separate warnings for each photo are not displayed.

### 32.9. Backup Import

Import is available only for application backup archives. CSV cannot be imported.

Importing into a local database that already contains entries is a normal scenario. Matching IDs are treated as conflicts, not as backup corruption.

The MVP has no fixed maximum archive size and no preliminary free-space check. Contents are processed sequentially.

Before local data is modified, the application validates:

- the presence and structure of `manifest.json`;
- a supported `formatVersion`;
- safe relative paths;
- the presence of all required chunks;
- that each chunk is an array containing no more than 300 entries;
- the absence of duplicate `id` values across the entire backup;
- that the actual number of entries matches `entriesCount`.

If a required validation can be completed before any changes and fails, import does not start.

Then:

1. chunks are read only from the manifest list;
2. each entry is validated;
3. conflicts are processed according to the user's choice;
4. photos are prepared in temporary files;
5. each completed chunk is stored in a separate local transaction;
6. temporary data is removed after success or failure.

Import does not access Firestore or Storage.

Each imported entry receives:

```ts
userId = currentUser.uid;
syncStatus = 'synced';
```

`localPhotoUri` from the archive is not used directly. `photoPath` is always rebuilt for the current user.

Unreferenced files that are not listed by the manifest or entries are ignored.

### 32.10. Photos During Import

If the backup contains a photo file:

1. the file is copied to temporary storage;
2. existence, readability, and non-empty size are verified;
3. replacement is prepared only after successful validation;
4. the final file is stored in the current UID's local storage;
5. a new `localPhotoUri`, a new current-user `photoPath`, and the backup `photoUrl` or `null` are assigned.

If `photoFileName` is specified but the file is missing, empty, or unreadable, the current chunk is rolled back and import stops.

If no file exists but `photoUrl` is present:

```ts
localPhotoUri = null;
photoPath = 'users/{currentUser.uid}/diaryPhotos/{entryId}.jpg';
photoUrl = backup.photoUrl;
syncStatus = 'synced';
```

If neither a file nor a URL exists:

```ts
localPhotoUri = null;
photoPath = null;
photoUrl = null;
syncStatus = 'synced';
```

When an existing entry is replaced, the old local file is deleted only after the new version has been prepared and the entry updated successfully. If the incoming version contains no local file, the old file is deleted after successful replacement because it is no longer used.

If any error occurs, the previous entry and previous photo are preserved or restored.

### 32.11. Import Conflicts

If the imported `id` does not exist locally, the entry is added.

If the `id` already exists, including an entry with `pendingDelete` status, the following options are shown:

```text
Skip
Replace local entry
Apply to all matches
```

When skipped, local data and the file are not changed.

When replaced:

1. the incoming photo, if present, is prepared and validated;
2. the local entry is replaced within the current chunk transaction;
3. `userId` becomes the current UID;
4. `syncStatus = synced`;
5. `localPhotoUri` and `photoPath` are rebuilt;
6. the old file is deleted only after success;
7. replacing a `pendingDelete` entry cancels the scheduled deletion and restores the entry.

“Apply to all” applies only within the current import operation.

A duplicate ID inside the backup itself is not a user conflict and is treated as an archive error.

### 32.12. Import Errors

There is no separate cancel button for import.

During import, the following progress is displayed:

```text
Processed N of M
```

`N` includes added, replaced, and skipped entries.

After success:

```text
Added: A
Replaced: B
Skipped: C
```

An entry is counted as added or replaced only after the chunk transaction completes successfully.

An entry is invalid if it has a missing or empty `id`, invalid `eventAt`, incorrect field types, unsupported `mealRelation`, invalid numeric values, or invalid string fields.

If an entry or required photo fails:

- the current chunk is rolled back completely;
- import stops;
- previously completed chunks remain;
- remaining entries are not imported;
- the process does not continue automatically.

If an `entriesCount` mismatch is discovered only after sequential processing, already completed chunks remain, but import ends with an error.

The error message contains:

```text
Processed N entries of M.
Added: A.
Replaced: B.
Skipped: C.
The remaining entries were not imported because of an error.
```

On a repeated import, entries that were already added are handled by the normal conflict mechanism.

### 32.13. Export Errors

There is no separate cancel button for export.

During the operation, progress is displayed by processed-entry count:

```text
Exported N entries of M
```

If export fails or the application is closed during the operation:

- the final archive is not considered created;
- temporary export files are removed when possible, or on the next application launch;
- the user receives a general export error.

If an individual local photo cannot be added to a full backup, the entry may still be included without that photo.

Separate warnings for each missing photo are not shown.

### 32.14. Temporary Files

Application temporary directories are used for export and import.

Examples:

```text
app document directory/tmp/export_{timestamp}/
app document directory/tmp/import_{timestamp}/
```

After success or failure, the application must attempt to remove temporary files.

On application launch, remaining temporary directories from incomplete imports and exports are also cleaned. An unfinished export archive is not considered a valid backup file.

### 32.15. Repeated Operations

During import, all operations that modify local data are blocked:

- creating, editing, and deleting entries;
- adding, replacing, and deleting photos;
- starting and deleting AI analysis;
- manual cloud download;
- automatic and forced synchronization;
- export;
- another import;
- sign-out and account change through the UI.

During export, an equivalent modification lock is used to produce a consistent data snapshot.

Two imports, two exports, or an import and export cannot run simultaneously.

Viewing the diary remains available. After success or failure, the lock is released and automatic synchronization may run again.

## 33. Android System Glucose-Check Timer

On Android, the create and edit forms include a checkbox for creating a new system glucose-check timer.

The feature is not implemented or shown on iOS and Web.

Target time:

```text
reminderAt = eventAt + 2 hours
timerDuration = reminderAt - current time
```

A future `eventAt` is allowed, so the timer duration may be longer than two hours.

The checkbox is available only if `reminderAt > current time`. Availability is recalculated when `eventAt` or current-time mode changes.

The checkbox:

- is available only to the `user` role on Android;
- is shown in create and edit forms;
- is disabled whenever the form opens;
- is not stored or synchronized;
- does not require internet access;
- creates a timer only after an explicit save action.

When a new or changed entry is saved:

1. the final `eventAt` is captured;
2. local save and the selected AI operation complete;
3. the remaining time is calculated again;
4. if the duration is positive, a new system timer is created.

Each action creates a new timer in addition to existing timers. The application does not store its identifier and does not edit or delete previous timers. Editing or deleting the entry does not affect them.

In the edit form, the user may select only the timer without changing the entry. In this case:

- the local entry is not updated;
- `syncStatus` does not change;
- synchronization does not start;
- only a new timer based on the saved `eventAt` is created.

In the create form, selecting only the timer does not count as entry content.

If the timer cannot be created after the entry is saved, the entry remains saved and the user receives a timer error. If the entry was not changed and only a timer was being created, the message must not claim that the entry was saved.

The timer label is localized, for example “Check blood glucose.” The Android Intent implementation is defined in the technical design document.

## 34. Diary Entry Validation

An entry cannot be saved if no meaningful field other than the required `eventAt` is filled:

```text
glucose
mealRelation
shortInsulin
longInsulin
carbsGram
comment
aiAnalysis
photo
```

`mealRelation = null`, an empty `comment`, and an empty `aiAnalysis` do not count as filled. Numeric value `0` does count as filled.

Limits:

```text
eventAt is required; past and future values are allowed
glucose: 0–100, maximum 1 decimal place
shortInsulin: 0–1000, maximum 1 decimal place
longInsulin: 0–1000, maximum 1 decimal place
carbsGram: 0–1000, maximum 1 decimal place
comment: maximum 5000 characters
aiAnalysis: maximum 2000 characters, not entered manually by the user
```

Both a decimal point and comma are accepted for decimal input. Before storage, the value is normalized and stored as a number.

`mealRelation` must be `null` or one of the keys:

```text
beforeMeal
afterMeal
fasting
bedtime
night
```

Unfilled numeric fields are stored as `null`; an empty comment and absent AI result are stored as empty strings.

## 35. Error Handling and MVP Limitations

If `localPhotoUri` exists but the local file is missing or corrupted:

- the UI attempts to use `photoUrl`;
- if the URL is absent or broken, an image error is shown;
- synchronization that requires the local file leaves the entry pending until the file is repaired or restored manually.

If `photoUrl` is broken or the Storage file has been deleted:

- the UI shows an error;
- normal synchronization does not proactively verify file existence;
- restoration through forced synchronization is possible only when `localPhotoUri` exists.

If upload succeeds but the Firestore write fails, `photoPath` and `photoUrl` remain stored locally and the next synchronization retries the document write.

If Firestore succeeds but the local status is not updated, another upsert with the same `entryId` is allowed.

If deletion of a Storage file fails, `photoPath` is not cleared, the status does not become `synced`, and the operation is retried on the next external synchronization trigger.

If normalization or local storage of a new photo fails, a new entry with that photo is not created, and a replacement preserves the previous version.

The MVP does not include:

- entry revision or change history;
- additional synchronization diagnostic fields;
- a button to delete all local data;
- synchronization while the application is fully closed;
- interval-based or background synchronization retries;
- nickname changes after registration;
- bread units;
- a system timer on iOS;
- an owner's local diary on Web;
- automatic AI retry or automatic fallback to another model.

`createdAt` and `updatedAt` fields are not added to diary entries. Sorting uses `eventAt`.
