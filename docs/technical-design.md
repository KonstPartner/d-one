# Diabetes Diary Technical Design

## 0. Supported Platforms

MVP functionality is divided by platform.

```text
Android / iOS
→ full interfaces for the user and follower roles;
→ the owner's local SQLite diary;
→ synchronization, the “Cloud” tab, AI, import, and export.

Web
→ authentication, email verification, and role-assignment waiting state;
→ read-only follower diary;
→ profile and sign-out.
```

For `role = user`, the local diary is not opened on Web. Instead of the user tab layout, a full-screen unsupported-platform notice with a sign-out action is shown. Web does not create or open the owner's SQLite database, local photos, personal cloud diary tab, synchronization coordinator, AI, import, export, or Android timer.

For `role = follower`, the cloud read-only diary is supported on Android, iOS, and Web.

---

## 1. Initial Routing

At application startup, the following are determined in order:

1. Firebase Auth state;
2. email verification status;
3. the user's Firestore profile;
4. the user's role.

After these checks complete, the application selects the interface available to the user.

### 1.1. User Is Not Authenticated

Condition:

```text
Firebase Auth session is absent
```

Result:

```text
Open the “Authentication” screen in the “Sign in” state.
```

### 1.2. User Is Authenticated but Email Is Not Verified

Condition:

```text
Firebase Auth session exists
emailVerified = false
```

Result:

```text
Open the “Authentication” screen in the “Email verification” state.
```

### 1.3. Email Is Verified but No Role Is Assigned

Condition:

```text
emailVerified = true
role = null
```

Result:

```text
Open a restricted interface with two tabs:
- Pending;
- Profile.
```

### 1.4. `user` Role Is Assigned

Condition:

```text
emailVerified = true
role = user
```

Result on Android and iOS:

```text
Open the primary user interface with tabs:
- Diary;
- Cloud;
- Profile.
```

Result on Web:

```text
Open the unsupported-platform notice.
Do not open the owner's local database.
Provide a sign-out action.
```

### 1.5. `follower` Role Is Assigned

Condition:

```text
emailVerified = true
role = follower
```

Result:

```text
Open the follower interface with tabs:
- Diary;
- Profile.
```

A missing `followedUserId` does not block access to the tab layout.

---

## 2. “Authentication” Screen

The “Authentication” screen is used for all actions before access to a tab layout is granted.

The screen does not contain:

- bottom tabs;
- the main application header;
- the three-dot menu.

The screen can be in one of the following states:

```text
Sign in
Registration
Password reset
Email verification
```

Transitions between states occur within the shared authentication screen.

---

## 3. “Sign In” State

### 3.1. Title

```text
Sign in
```

### 3.2. Screen Elements

The screen displays:

1. application logo;
2. application name or title;
3. `Email` field;
4. `Password` field;
5. `Sign in` button;
6. `Forgot password?` link;
7. visual `or` divider;
8. `Sign in with Google` button;
9. `Don't have an account?` text;
10. `Register` link;
11. area for a general authentication error.

### 3.3. Email and Password Sign-In

When `Sign in` is pressed:

1. fields are validated;
2. the form is blocked from duplicate submission;
3. Firebase Auth sign-in is performed;
4. after successful sign-in, `emailVerified` is determined again;
5. if the email is verified, the profile is loaded and the role is determined;
6. the user is redirected to the appropriate tab layout.

On error, the user remains on the sign-in form. The error is displayed within the screen.

### 3.4. Google Sign-In

The `Sign in with Google` button is available only in the “Sign in” state.

Google sign-in is not used as a separate registration flow. Before their first Google sign-in, the user must register manually with email and password.

Firebase Auth must be configured so that Google sign-in with the same email resolves to the existing user account rather than creating a separate application profile and separate diary.

No separate Google connect or link button is provided in the profile.

After successful Google sign-in, the same checks are performed:

```text
emailVerified → profile → role → available tab layout
```

### 3.5. Transitions

```text
Register         → “Registration” state
Forgot password? → “Password reset” state
```

---

## 4. “Registration” State

### 4.1. Title

```text
Registration
```

### 4.2. Fields

The form contains:

1. `Nickname`;
2. `Email`;
3. `Password`;
4. `Repeat password`.

### 4.3. Additional Elements

The screen displays:

- `Register` button;
- validation messages for individual fields;
- area for a general registration error;
- `Already have an account?` text;
- `Sign in` link.

A Google button is not shown on the registration form.

### 4.4. Validation

Before submission, verify that:

- nickname is not empty after `trim`;
- nickname length after `trim` does not exceed 255 characters;
- email is filled and has a valid format;
- password complies with Firebase Auth and application rules;
- repeated password matches the original password.

### 4.5. Successful Registration

After successful registration, the application:

1. creates a Firebase Auth user;
2. stores the nickname in Firebase Auth `displayName`;
3. creates or restores the user's Firestore document;
4. switches the authentication screen to the “Email verification” state.

The verification email does not have to be sent automatically immediately after registration. The user first sees an explicit button for sending the verification link.

### 4.6. Transition

```text
Sign in → “Sign in” state
```

---

## 5. “Password Reset” State

### 5.1. Title

```text
Password reset
```

### 5.2. Screen Elements

The screen displays:

- explanatory text;
- `Email` field;
- `Send link` button;
- `Back to sign in` link;
- successful-send message;
- error area.

### 5.3. Behavior

When `Send link` is pressed:

1. email is validated;
2. the form is temporarily blocked;
3. Firebase Auth sends a password-reset email;
4. after success, the user remains on the current screen;
5. a sent-link message is displayed.

### 5.4. Transition

```text
Back to sign in → “Sign in” state
```

---

## 6. “Email Verification” State

### 6.1. Title

```text
Email verification
```

The screen is used only for an authenticated user whose email is not verified.

### 6.2. Initial State

Before an email has been sent successfully, display:

- explanation that email verification is required;
- the current user's email;
- `Send verification link` button;
- `Sign out` action.

The `Check verification` button is not shown at this stage.

### 6.3. State After Email Is Sent

After the email has been sent successfully, display:

- message that the email was sent;
- the current user's email;
- explanation that the user must open the link in the email;
- `Check verification` button;
- secondary `Send again` action;
- `Sign out` action.

### 6.4. Verification Check

When `Check verification` is pressed, the application:

1. retrieves current Firebase Auth user data again;
2. checks `emailVerified`;
3. if the email is still unverified, keeps the user on the current screen;
4. if the email is verified, loads the profile;
5. determines the role;
6. opens the appropriate tab layout.

### 6.5. Sign-Out

When `Sign out` is pressed:

- the Firebase Auth session ends;
- the local profile cache is removed;
- the “Sign in” state opens.

The user's local entries and photos are not deleted.

---

## 7. Tab Layout for a User Without a Role

For `role = null`, two tabs are displayed:

```text
Pending
Profile
```

`Pending` is the initial tab.

### 7.1. “Pending” Tab

#### Header

The left side displays:

```text
Access pending
```

The right side displays the three-dot menu button.

#### Content

The screen displays:

- a message that the email is verified;
- a message that no role has been assigned yet;
- an explanation that primary functionality becomes available after an administrator assigns a role.

A `Check access` button is not shown.

The current role is checked during the next profile retrieval or refresh, including a new application launch and the application returning to the active state.

### 7.2. “Profile” Tab

The shared profile screen is used.

Displayed role name:

```text
Access not granted
```

---

## 8. Tab Layout for a User With the `user` Role

This section applies only to Android and iOS.

For the `user` role, three tabs are displayed:

```text
Diary
Cloud
Profile
```

`Diary` is the initial tab.

The displayed role name in the `Profile` tab is:

```text
User
```

This tab layout is not created on Web; the platform notice described in the platform section is used instead.

---

## 9. Tab Layout for a User With the `follower` Role

For the `follower` role, two tabs are displayed:

```text
Diary
Profile
```

`Diary` is the initial tab.

The `Cloud` tab is absent.

The following permanent labels are not added to the header or primary content:

```text
Read only
User's diary ...
```

Follower restrictions must be expressed through available interface actions and role business logic.

The displayed role name in the `Profile` tab is:

```text
Follower
```

---

## 10. Shared “Profile” Screen

The `Profile` tab is available to:

- a user without an assigned role;
- a user with the `user` role;
- a user with the `follower` role.

### 10.1. Header

The left side displays:

```text
Profile
```

The right side displays the three-dot menu button.

### 10.2. Shared Data

For every role, the screen displays:

- nickname;
- email;
- human-readable role name.

Technical role values are not shown directly.

Mapping:

```text
null     → Access not granted
user     → User
follower → Follower
```

### 10.3. Shared Actions

Sign-out is available on the screen.

On sign-out:

- the Firebase Auth session ends;
- the local profile is removed;
- local storage for the current UID is closed;
- local entries and photos are not deleted;
- the authentication screen opens in the “Sign in” state.

### 10.4. Import and Export

For the `user` role on Android and iOS, the screen additionally displays:

```text
Import and export
```

It opens a separate full-screen interface for managing local diary data.

The action is not shown for `null` and `follower` roles.

Import and export do not start directly from the profile screen; the profile is only the entry point into a separate flow.

---

## 11. Shared Header for Tab Screens

The header is displayed on every screen inside a tab layout.

Structure:

```text
[Current screen title]                              [⋮]
```

### 11.1. Left Side

The left side displays the current screen's text title.

Examples:

```text
Access pending
Diary
Cloud
Profile
```

### 11.2. Right Side

The right side displays a button with three vertical dots.

Pressing it opens the context menu for the current screen.

### 11.3. Menu Composition

Menu contents may depend on:

- the current screen;
- the user's role;
- current data state;
- availability of a specific action on the platform.

The menu may include:

1. shared actions available on multiple screens;
2. actions specific to the current screen;
3. actions available only to a specific role;
4. actions available only on a specific platform.

Functions unavailable to the current role are not shown.

---

## 12. “Diary” Tab for the `user` Role

This section applies only to Android and iOS.

The screen is the primary interface for working with the user's local diary.

The local SQLite database is the source of truth for listing, creating, editing, and deleting entries. The cloud version is used for synchronization and follower access.

### 12.1. Header and Menu

The left side displays:

```text
Diary
```

The right side displays the three-dot menu.

The following actions are available:

```text
Refresh list
Synchronize
Select entries
Collapse all days / Expand all days
```

Only one group action is shown at a time:

```text
at least one day is expanded → Collapse all days
all days on the current page are collapsed → Expand all days
```

The day-collapse action is not shown in entry-selection mode.

`Refresh list`:

1. closes selection mode if it is active;
2. clears the local list cache;
3. moves the list to the first page;
4. repeats the entry query and `COUNT(*)` with the currently applied search and filters.

`Synchronize` starts batch synchronization for all entries whose `syncStatus` is not `synced`.

`Select entries` enables bulk-selection mode for the current page.

`Collapse all days` hides the cards in every group on the current page while keeping day headers visible. `Expand all days` restores all group cards. These actions do not change the SQL query, entry count, or pagination.

### 12.2. Local Database and Application Layers

The local diary uses `expo-sqlite` without an ORM.

A separate local database is opened for each Firebase UID. Changing users closes the previous UID's database and opens the current UID's database.

Layers:

```text
DiaryScreen
→ Zustand: interface parameters and modes
→ TanStack Query: requests, cache, loading/error
→ DiaryRepository
→ expo-sqlite
→ diary_entries
```

Rules:

- SQL exists only in migrations and the repository;
- UI components do not construct SQL;
- all user values are passed to SQL through parameters;
- SQLite is the source of truth;
- Zustand does not store a duplicate entry array;
- TanStack Query stores query results and their state;
- local queries use `staleTime: Infinity`;
- refresh is explicit after data changes or a user action.

Migrations are performed manually through `PRAGMA user_version`:

```text
open database
→ read user_version
→ execute missing migrations in order
→ set the new version
→ allow repository queries
```

### 12.3. Local Entry Format

Primary table:

```sql
CREATE TABLE diary_entries (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL,
  glucose REAL,
  meal_relation TEXT,
  short_insulin REAL,
  long_insulin REAL,
  carbs_gram REAL,
  comment TEXT NOT NULL DEFAULT '',
  ai_analysis TEXT NOT NULL DEFAULT '',
  local_photo_uri TEXT,
  photo_path TEXT,
  photo_url TEXT,
  event_at INTEGER NOT NULL,
  sync_status TEXT NOT NULL
);
```

Indexes:

```sql
CREATE INDEX idx_diary_entries_event_at
ON diary_entries(event_at DESC, id DESC);

CREATE INDEX idx_diary_entries_sync_status
ON diary_entries(sync_status);
```

`event_at` is stored in SQLite as UTC milliseconds in an `INTEGER`.

Conversions:

```text
SQLite         → INTEGER UTC milliseconds
JavaScript     → Date
Firestore      → Timestamp
JSON backup    → ISO 8601 UTC
CSV export     → agreed human-readable date and time format
```

Numeric values are stored as `REAL` and may be `null`.

Synchronization states:

```text
synced
pendingCreate
pendingUpdate
pendingDelete
```

A `pendingDelete` entry remains in the local list until cloud data has been deleted successfully.

### 12.4. Top Panel in Normal Mode

Below the header, display:

1. search-field selector;
2. search input;
3. filter button;
4. `+` button.

The `+` button opens the shared entry form in create mode.

During batch synchronization, only the following panel is shown above it:

```text
Synchronizing: 2 of 5
```

The batch synchronization panel is not used for targeted synchronization of one entry after creation, editing, or deletion.

### 12.5. Search

Available fields:

```text
Comment
AI analysis
Glucose
Short-acting insulin
Long-acting insulin
Carbohydrates
```

`mealRelation`, date, photo presence, and AI-analysis presence are configured only through filters.

For text fields:

- case-insensitive search;
- partial match;
- query starts at two characters;
- 400 ms debounce;
- `%`, `_`, and `\` are escaped before `LIKE`.

For numeric fields:

- the string is converted to a number;
- one decimal place is allowed;
- both point and comma are accepted as decimal separators;
- `6`, `6.0`, and `6,0` are the same numeric query;
- search uses numeric equality rather than substring matching.

When the search field changes:

1. the entered value is cleared;
2. the page resets to the first page;
3. the list query and `COUNT(*)` run without a search condition.

When a valid search query changes after debounce:

1. the page resets to the first page;
2. the list query and `COUNT(*)` run;
3. applied filters remain unchanged.

An empty string removes the search condition.

### 12.6. Building the Local Query

Base sorting:

```sql
ORDER BY event_at DESC, id DESC
```

Search and filters are combined with `AND`.

Conditions for multiple selected `mealRelation` values are combined as an `IN` group.

Text fields use parameterized `LIKE`.

Numeric fields are compared as numbers.

Photo filter:

```text
Has photo → local_photo_uri IS NOT NULL OR photo_url IS NOT NULL
No photo  → local_photo_uri IS NULL AND photo_url IS NULL
```

AI filter:

```text
Has AI → TRIM(ai_analysis) != ''
No AI  → TRIM(ai_analysis) = ''
```

`pendingDelete` is not excluded from the normal query: an entry being deleted must remain visible as a gray inactive card until successful cloud deletion.

Each page executes two queries with the same `WHERE`:

```text
SELECT entries
SELECT COUNT(*)
```

The repository returns:

```ts
type DiaryPageResult = {
  items: DiaryEntry[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
};
```

For an empty result:

```text
page = 1
totalItems = 0
totalPages = 0
hasPreviousPage = false
hasNextPage = false
```

### 12.7. Filters

The filter button opens a modal.

The modal contains:

1. calendar and date boundaries;
2. glucose range;
3. short-acting insulin range;
4. long-acting insulin range;
5. carbohydrate range;
6. `mealRelation` selection;
7. photo filter;
8. AI-analysis filter;
9. `Clear` button;
10. `Apply` button;
11. separate close button.

A filter draft is edited inside the modal.

`Apply`:

- copies the draft into the applied filter;
- moves the list to the first page;
- runs the list query and `COUNT(*)`;
- does not close the modal.

Closing without applying discards draft changes. The last applied filter is shown the next time the modal opens.

#### 12.7.1. Date

Above the calendar:

```text
From date
To date
```

One boundary is active. Pressing a date changes the active boundary.

Initial state:

```ts
{
  from: null,
  to: null,
  activeBoundary: 'from',
}
```

The first `from` selection automatically switches the active boundary to `to`.

States:

| `from`         | `to`           | Condition                              |
| -------------- | -------------- | -------------------------------------- |
| `null`         | `null`         | no filter                              |
| date           | `null`         | from start of selected local day       |
| `null`         | date           | through end of selected local day      |
| same dates     | same dates     | one local day                          |
| different dates | different dates | inclusive range                      |

If the second date is earlier than the first, the boundaries are swapped.

Before querying:

- `from` is converted to the start of the local day, then to UTC milliseconds;
- `to` is converted to the end of the local day, then to UTC milliseconds.

Use `react-native-calendars` with `markingType="period"` and generated `markedDates`.

Each boundary can be cleared separately. Resetting the date block clears both.

#### 12.7.2. Numeric Ranges

Each range block contains:

- dual-thumb slider;
- `From` input;
- `To` input;
- reset button for the block.

State:

```ts
{
  min: number | null,
  max: number | null,
}
```

Conditions:

| `min`              | `max`              | Condition                 |
| -----------------: | -----------------: | ------------------------- |
| `null`             | `null`             | no filter                 |
| number             | `null`             | value `>= min`            |
| `null`             | number             | value `<= max`            |
| different numbers  | different numbers  | inclusive range           |
| equal numbers      | equal numbers      | exact numeric value       |

Scales:

| Field                | Minimum | Maximum | Slider step |
| -------------------- | ------: | ------: | ----------: |
| Glucose              |       0 |      40 |         0.1 |
| Short-acting insulin |       0 |      30 |           1 |
| Long-acting insulin  |       0 |      60 |           1 |
| Carbohydrates        |       0 |     100 |           1 |

Manual input:

- is allowed for all numeric boundaries;
- allows one decimal place;
- normalizes point and comma;
- rejects values with two or more decimal places;
- does not round;
- may exceed the standard slider scale.

If a manual value is outside the scale, the actual value is preserved while the corresponding thumb is visually clamped to the edge. Two values beyond the same edge may be displayed at the same position.

Slider thumbs cannot cross but may coincide.

`min > max` is an error and disables `Apply`.

Resetting the block sets both boundaries to `null`.

#### 12.7.3. `mealRelation`

Use a dropdown with checkboxes.

Multiple values can be selected. An empty selection means no filter.

#### 12.7.4. Photo and AI Analysis

Each filter has three states:

```text
Ignore
Has
Does not have
```

Initial state: `Ignore`.

#### 12.7.5. Filter Buttons

`Clear` is enabled when the draft differs from the default state.

Clearing changes only the draft and does not run a query until `Apply` is pressed.

`Apply` is enabled when:

- the draft differs from the applied filter;
- numeric ranges are valid.

After applying, the button becomes disabled until another change is made.

### 12.8. List, Day Grouping, and Pagination

Use `FlatList` for the list.

No more than 30 entries are displayed on one page. Pagination is calculated by entry count rather than calendar-day count.

Local pagination uses:

```sql
LIMIT 30 OFFSET ((page - 1) * 30)
```

After a page is retrieved, entries are grouped in memory by the local calendar date of `eventAt`:

```text
eventAt in UTC milliseconds
→ convert to device local time zone
→ YYYY-MM-DD day key
→ day header and cards for that day
```

Grouping is performed only within the current page and does not change the SQL query. One calendar day may be split across adjacent pages if the 30-entry boundary falls within that day.

Two item types are passed to the flat `FlatList` array:

```ts
type DiaryListItem =
  | {
      type: 'dayHeader';
      dayKey: string;
      title: string;
      entriesCount: number;
    }
  | {
      type: 'entry';
      entry: DiaryEntry;
    };
```

A pressable header is displayed above each group:

```text
▼ July 19, 2026 · 4 entries
› July 18, 2026 · 2 entries
```

Pressing a header toggles only that day.

For a collapsed day:

- the header remains visible;
- that day's cards are excluded from the rendered array;
- entries are not removed from the query result;
- `COUNT(*)` and pagination do not change;
- cloud photos for hidden cards are not requested.

State is stored in Zustand for UI purposes only:

```ts
type DiaryDayKey = string;

collapsedDayKeys: Set<DiaryDayKey>;
```

Collapse state is not persisted in SQLite or permanent storage.

All days are expanded when:

- the page changes;
- search changes or is cleared;
- filters are applied or reset;
- the list is refreshed manually;
- a newly created entry moves the list to the first page;
- bulk-selection mode is entered.

When a card on the current page is normally refreshed, group state is preserved.

Pagination panel:

```text
‹ | first | previous | current | next | last | ›
```

Example:

```text
‹  1  5  [6]  7  122  ›
```

Rules:

- duplicate page numbers are removed;
- the current page is highlighted and not pressable;
- the left arrow is disabled on the first page;
- the right arrow is disabled on the last page;
- the panel is hidden when `totalPages <= 1`;
- the list scrolls to the top after navigation;
- repeated navigation is blocked while a new page is loading.

When search changes, a filter is applied, or the list is refreshed manually, the page always resets to the first page.

### 12.9. Entry Card

The card displays all meaningful data available to the application:

- date and time;
- glucose;
- `mealRelation`;
- short-acting insulin;
- long-acting insulin;
- carbohydrates;
- comment;
- photo;
- AI analysis;
- synchronization state.

Technical fields are not displayed:

```text
id
userId
localPhotoUri
photoPath
photoUrl
syncStatus as a raw text value
```

Empty fields are omitted.

Interactions:

- pressing an active card opens the shared form in edit mode;
- pressing the photo opens the full-screen viewer;
- pressing `More` opens the full-text modal;
- interactive areas are implemented separately so pressing the photo or `More` does not open edit mode.

Comment and AI analysis:

- are displayed in no more than four lines;
- show a `More` button only when the text is actually truncated;
- open a modal with full text, vertical scrolling, and a close button;
- do not use long press.

The full-screen photo viewer supports:

- pinch-to-zoom;
- panning a zoomed image;
- double tap to zoom and reset;
- close button.

### 12.10. Lazy Photo Loading

Photos are not recompressed when shown in the list.

The already normalized photo is used:

```text
JPEG
long side no greater than 1280 px
approximately 85% quality
```

Separate thumbnails are not generated in the first version.

Source priority:

```text
localPhotoUri
→ photoUrl
→ no photo
```

A cloud photo is not passed to the image component until the card enters the visible `FlatList` area.

Use:

- `onViewableItemsChanged`;
- a limited virtualization window;
- `expo-image`;
- memory and disk cache;
- an entry-specific `recyclingKey`.

The `expo-image` cache is not treated as the entry's local photo and does not change `localPhotoUri`.

If a cloud image fails to load:

- the card remains on screen;
- a fallback is displayed instead of the photo;
- a toast with the known error cause is shown once for the current attempt.

For a cloud-only photo without network access, the fallback states that the photo is available only in the cloud.

### 12.11. Entry and Photo Indicators

The state of the whole entry is displayed at the bottom of the card:

| State                             | Display                                  |
| --------------------------------- | ---------------------------------------- |
| `synced`                          | normal synchronization icon              |
| `pendingCreate` / `pendingUpdate` | crossed-out synchronization icon         |
| entry is synchronizing now        | loader and `Synchronizing…` text         |
| `pendingDelete`                   | gray inactive card and `Deleting…`       |

Photo state is independent of entry state.

Overlay on the photo:

| Local copy | Cloud copy | Display                           |
| ---------- | ---------- | --------------------------------- |
| present    | present    | no additional icon                |
| present    | absent     | crossed-out cloud                 |
| absent     | present    | cloud-download icon               |
| absent     | absent     | photo block is absent             |

### 12.12. Shared Create and Edit Form

Use one full-screen interface:

```ts
type EntryFormMode = 'create' | 'edit';
```

Create mode:

```text
title: New entry
fields: initial values
current date and time: enabled
AI: disabled
timer: disabled
primary button: Create
```

Edit mode:

```text
title: Edit entry
fields: current entry from SQLite
current date and time: disabled
AI: disabled
timer: disabled
primary button: Save
```

Before edit mode opens, the entry is read again from SQLite by `id`.

Form contents:

1. glucose;
2. short-acting insulin;
3. long-acting insulin;
4. carbohydrates;
5. date;
6. time;
7. current date and time checkbox;
8. `mealRelation`;
9. comment;
10. photo;
11. AI analysis and its edit-mode actions;
12. perform-AI checkbox;
13. create-timer checkbox on Android;
14. `Cancel`;
15. `Create` or `Save`;
16. `Delete entry` only in edit mode.

### 12.13. Numeric Form Fields

Each field contains:

- current value;
- single-thumb slider;
- ability to press the value and enter it manually;
- button to clear it to `null`.

Scales:

| Field                | Minimum | Maximum | Slider step |
| -------------------- | ------: | ------: | ----------: |
| Glucose              |       0 |      40 |         0.1 |
| Short-acting insulin |       0 |      30 |           1 |
| Long-acting insulin  |       0 |      60 |           1 |
| Carbohydrates        |       0 |     100 |           1 |

Manual input allows one decimal place for every field. Insulin and carbohydrate sliders change values in whole-number steps, but manual input may set a fractional value.

Values with two or more decimal places are rejected. No automatic rounding is performed.

A manually entered value may exceed the slider scale. In that case, the thumb is clamped visually to the edge while the entered value is preserved.

### 12.14. Form Date and Time

Date and time are separate elements:

```text
Date: 07/18/2026
Time: 14:30
```

Pressing the date opens the system date picker. Pressing the time opens the system time picker.

Checkbox:

```text
Use current date and time
```

When the checkbox is enabled, date and time cannot be changed manually and are captured at save time.

### 12.15. Photo in the Form

Pressing `Add photo` opens the system action chooser:

```text
Take photo
Choose from gallery
Cancel
```

The system camera and gallery are used. After capture or selection, the application returns to the form and immediately shows the selected photo.

A new photo remains a form draft until save.

When the form is canceled, the temporary file is deleted and the existing entry remains unchanged.

#### 12.15.1. Replacing a Photo

Edit mode provides:

```text
Replace
Delete
```

AI analysis is not automatically tied to photo replacement or deletion. It remains until the user requests a new analysis or deletes it separately.

The photo path is permanent and depends on `entryId`:

```text
local: {entryId}.jpg
Storage: users/{uid}/diaryPhotos/{entryId}.jpg
```

Replacement flow:

1. normalize the new photo into a temporary file;
2. validate the temporary file;
3. after successful validation, safely replace the local `{entryId}.jpg`;
4. keep `photoPath` unchanged;
5. clear `photoUrl`;
6. set the entry to `pendingUpdate` or preserve `pendingCreate`;
7. upload the new file using the existing `photoPath`, overwriting the old object;
8. obtain the current download URL after upload;
9. append a version parameter to bypass the previous cache;
10. save the new URL locally and send it to Firestore.

A separate old-path field is not required.

#### 12.15.2. Deleting a Photo

When photo deletion is saved:

```text
localPhotoUri = null
photoUrl = null
photoPath is temporarily preserved
```

`photoPath` tells the synchronizer which Storage file to delete.

After successful Storage deletion:

```text
photoPath = null
```

AI analysis does not change.

### 12.16. AI Analysis in the Form

AI text cannot be edited manually.

AI starts only after the user explicitly selects it and presses `Create` or `Save`. Opening the form, synchronizing an entry, and restoring network access do not start AI.

The AI checkbox is disabled whenever the form opens.

A photo is required:

```text
no photo
→ AI checkbox is off and disabled
→ AI request is impossible
```

A photo is considered available if at least one source remains after applying the current form draft:

```ts
const hasPhoto =
  Boolean(draftPhotoUri) ||
  Boolean(entry.localPhotoUri) ||
  Boolean(entry.photoUrl);

const canRequestAi =
  hasPhoto && !isPhotoMarkedForDeletion && isOnline && !isSubmitting;
```

Adding a photo enables the checkbox. Deleting a photo immediately turns it off and disables it. Existing `aiAnalysis` is not cleared automatically.

Edit mode provides:

```text
Delete analysis
[ ] Repeat AI analysis
```

The actions are mutually exclusive.

`Delete analysis` sets the following after save:

```text
aiAnalysis = ''
```

`Repeat AI analysis`:

- completely replaces the existing text on success;
- preserves the previous text on error;
- is not automatically retried later.

If the user selected only repeat AI and the request fails:

- SQLite is not changed;
- entry status is not changed;
- Firestore synchronization does not start.

If other fields were changed at the same time, they are saved and synchronized with the old AI text.

For a new, added, or replaced photo, the sequence is strictly:

```text
upload photo to Firebase Storage
→ obtain current photoUrl
→ AI request through Cloudflare Worker
```

For an unchanged photo with an existing `photoUrl`, AI may run without uploading the file again.

If only `localPhotoUri` exists and `photoUrl` is absent, the photo is uploaded to Storage first.

The Worker request is performed through a TanStack Query mutation:

```ts
useAnalyzeFoodMutation({
  retry: false,
});
```

`useQuery` is not used because AI analysis is a one-time user action and must not load or retry automatically.

TanStack Query stores only network-operation state:

```text
isPending
isError
data
error
```

The final result is stored in SQLite after successful processing. Mutation cache is not the source of truth.

### 12.17. Timer

The timer checkbox is displayed only on Android.

It is disabled whenever the form opens.

The timer is created after a successful local save and does not depend on Firestore synchronization success.

The checkbox is available when the calculated timer moment is still in the future. The current flow uses:

```text
eventAt + 2 hours > current time
```

A timer creation error does not cancel entry saving.

### 12.18. Canceling and Unsaved Changes

`Cancel`, the system Back button, and the close gesture use the same behavior.

If the form has not changed, it closes immediately.

If there are changes, discard confirmation is shown.

After confirmed cancellation, a temporary new photo is deleted if one was created.

### 12.19. Creating an Entry

Sequence:

```text
1. Validate the form.
2. Capture eventAt.
3. Normalize and safely store the new local photo.
4. Create the SQLite entry with pendingCreate status.
5. Add the id to preparingEntryIds.
6. Upload the photo to Storage if one exists.
7. After the photo, call `useAnalyzeFoodMutation` if AI was selected.
8. Save photoUrl and aiAnalysis to SQLite immediately after they are received.
9. Remove the id from preparingEntryIds.
10. Close the form.
11. Move the list to the first page and show the entry.
12. If the photo was prepared successfully or is absent, queue targeted synchronization for the entry.
```

While the entry is in `preparingEntryIds`, general synchronization skips it.

If photo upload fails:

- the form closes;
- the entry remains `pendingCreate`;
- the local photo is preserved;
- targeted Firestore synchronization does not start;
- AI is not started automatically later;
- the next photo upload attempt can occur through batch or forced synchronization.

If AI fails:

- the entry is synchronized without new AI text;
- AI is not automatically retried later.

The form closes before the Firestore request. During targeted synchronization, the card displays `Synchronizing…`.

Targeted and batch synchronization do not duplicate business logic. The core operation is one function that synchronizes a single entry by ID. The targeted flow passes the known `entryId` immediately after entry preparation, while the batch flow first finds every pending entry in SQLite and sequentially invokes the same operation for each ID.

Targeted synchronization is the normal fast path after creation, editing, or deletion. Batch synchronization is the recovery mechanism for accumulated pending entries after offline use, an error, or a manual run. The application does not perform a full pending-entry scan after every save.

### 12.20. Editing an Entry

Normal changes are saved locally, after which the entry receives:

```text
synced        → pendingUpdate
pendingCreate → pendingCreate
pendingUpdate → pendingUpdate
```

If a new or replaced photo requires preparation, the entry is temporarily added to `preparingEntryIds` and cannot be synchronized until the photo upload and selected AI operation complete.

After preparation, the form closes, the card updates, and targeted synchronization is queued.

If the date changed, the list moves to the first page because the entry's position in the sort order may have changed.

If the date did not change, the current page may be preserved and its card updated.

An entry being synchronized cannot be opened for editing or deletion.

If synchronization starts while the edit form is already open, the `Save` and `Delete entry` buttons are temporarily disabled until the operation completes. Before a subsequent save, the entry is read again from SQLite so a stale form object does not overwrite technical `photoUrl` and `syncStatus` changes.

### 12.21. Deleting an Entry

Edit mode provides a separate destructive button:

```text
Delete entry
```

After confirmation:

1. the entry receives `pendingDelete`;
2. the form closes;
3. the card remains in the list;
4. the card becomes gray and inactive;
5. targeted deletion is queued for synchronization.

Until deletion completes:

- the card cannot be opened;
- the photo cannot be opened;
- `More` does not work;
- the entry cannot be selected in bulk mode;
- the entry participates in `COUNT(*)` and normal sorting.

After successful deletion of the Firestore document and Storage file:

1. the local photo is deleted;
2. the row is physically deleted from SQLite;
3. the list and `COUNT(*)` are updated;
4. if the current page is no longer valid, the last existing page opens, or the first page if the list is empty.

On error, the gray card remains until the next synchronization run.

### 12.22. Entry Selection Mode

The mode is enabled through the `Select entries` menu action.

After it is enabled:

- all day groups expand automatically;
- individual day-header buttons no longer collapse groups;
- `Collapse all days` / `Expand all days` is not shown in the header;
- checkboxes appear next to available cards;
- pressing a card toggles selection;
- editing, the photo viewer, and `More` are disabled;
- search, filters, the `+` button, and manual refresh are hidden;
- pagination is hidden;
- the current page is fixed.

Panel:

```text
[ ] Select all | Delete | Synchronize | ✕
```

`Select all` selects only available entries on the current page, up to 30.

The checkbox has the following states:

- nothing selected;
- some entries selected;
- all available entries on the page selected.

`pendingDelete` and currently synchronizing entries cannot be selected.

`Delete`:

- is disabled without selected entries;
- displays confirmation with the count;
- after confirmation, assigns `pendingDelete` to selected entries;
- closes selection mode;
- queues deletion operations.

`Synchronize`:

- is disabled without selected entries;
- closes selection mode;
- starts forced synchronization only for selected IDs;
- does not start AI;
- resends the current local object to the cloud even for a `synced` entry;
- re-uploads the local photo when required.

The close icon clears the selection and returns to normal mode without changing data. After exit, all groups remain expanded.

The system Back button closes selection mode first.

### 12.23. List States

Initial loading displays a normal loading indicator.

When page, search, or filters change, the existing list may remain visible with a refresh indicator.

Completely empty diary:

```text
No entries yet
Create your first entry with the “+” button.
```

When there are no entries at all, search, filters, and pagination are not shown.

Empty search or filter result:

```text
No entries found
Change the search or reset the filters.
```

An action is available to reset search and filters and move to the first page.

SQLite error:

```text
Failed to load entries
Retry
```

Technical error details are saved to logs but are not shown to the user.

If an error occurs while refreshing an already displayed list, the list remains and the error is shown in a toast.

Known creation, editing, deletion, photo, AI, and synchronization errors are also shown through toasts. The card always reflects the actual local state.

---

### 12.24. AI Service and Cloudflare Worker

#### 12.24.1. General Architecture

The AI provider is not called directly from React Native. A separate Cloudflare Worker is used.

Worker source code is stored in the same Git repository but forms a separate TypeScript project with its own dependencies, configuration, and deployment:

```text
project-x/
├── app/
├── src/
└── worker/
    ├── src/
    │   ├── index.ts
    │   ├── prompt.ts
    │   ├── schema.ts
    │   ├── auth.ts
    │   ├── firestore.ts
    │   └── limits.ts
    ├── migrations/
    ├── package.json
    └── wrangler.jsonc
```

Flow:

```text
React Native
→ Cloudflare Worker
→ local Firebase ID token verification
→ Firestore REST: current role verification
→ Cloudflare D1: limit check and reservation
→ Gemini Developer API using photoUrl
→ Cloudflare Worker
→ React Native
→ SQLite
```

Only the public Worker URL is included in the mobile application. The Gemini key is stored as a Cloudflare Secret and is not included in the application or public `.env`.

The model is configured through a Worker environment variable:

```text
GEMINI_MODEL=<currently selected Flash model with an available quota>
```

The model name is not hardcoded in the mobile client. Before deployment, it is checked against the current Gemini API model list and quotas and can be changed without releasing a new application version.

Primary image-transfer method:

```text
Firebase Storage photoUrl
→ Worker validates the URL
→ Gemini downloads the JPEG from the URL
```

The Worker does not download the image, resize it, or encode it in Base64. This reduces Cloudflare Worker CPU and memory use.

Compatibility of a real Firebase Storage download URL with the selected model is verified through a separate integration test during implementation. If it is incompatible, the fallback is streaming transfer through the Gemini Files API without Base64.

#### 12.24.2. Worker Dependencies

Required packages:

```text
@google/genai
zod
jose
```

Purpose:

- `@google/genai` — official Gemini API client;
- `zod` — runtime validation for the request body, Worker configuration, and model response;
- `jose` — local cryptographic verification of the Firebase ID token.

Firebase Admin SDK, a service-account private key, and Cloudflare Rate Limiting binding are not used.

#### 12.24.3. Application Request

The request is performed through `useAnalyzeFoodMutation`.

```ts
type AnalyzeFoodRequest = {
  entryId: string;
  photoPath: string;
  photoUrl: string;
  comment: string;
  language: 'en' | 'ru';
};
```

The Firebase ID token is passed in the header:

```http
Authorization: Bearer <firebase-id-token>
Content-Type: application/json
```

Rules:

- after truncation, `comment` contains no more than 1000 characters;
- only the current `photoUrl` obtained after a successful Firebase Storage upload is sent;
- the local file is not sent to the Worker;
- the comment is used as user context, not as an instruction that can override the prompt;
- AI does not receive glucose, insulin doses, email, nickname, diary history, or other entries.

The request body, environment, and model response are validated through Zod. TypeScript types alone are not considered runtime validation.

#### 12.24.4. Local Firebase ID Token Verification

The Worker extracts the Bearer token and verifies the JWT locally through `jose`.

Google public keys for Firebase Secure Token are used. Keys are cached for the duration specified by `Cache-Control`; a network request for keys is made only when no matching `kid` is available, the cache expires, or keys rotate.

Required checks:

```text
alg = RS256
signature is valid
kid matches a Google public key
aud = FIREBASE_PROJECT_ID
iss = https://securetoken.google.com/{FIREBASE_PROJECT_ID}
exp is in the future
iat is in the past
auth_time is in the past
sub is a non-empty Firebase UID
email_verified = true
```

The UID is taken only from the verified `sub`. A UID supplied by the client in the body, `photoPath`, or URL is not trusted.

No separate `accounts:lookup` request is made. Immediate revocation checking for an already issued ID token is not implemented in the MVP; the token is accepted until `exp`. The current role is still checked on every AI request.

#### 12.24.5. Worker Access to Firestore

After local JWT verification, the Worker reads:

```text
users/{verifiedUid}
```

through the Firestore REST API and passes the same user Firebase ID token:

```http
Authorization: Bearer <firebase-id-token>
```

Firestore applies normal Security Rules. A service account and administrative Rules bypass are not used.

The Worker requests only the required fields through a field mask:

```text
uid
role
```

After converting the Firestore REST format, the result is validated through Zod.

Access conditions:

```text
profile.uid = verifiedUid
profile.role = user
```

The role is not cached, so a role change takes effect on the next AI request.

Normal Worker configuration:

```text
FIREBASE_PROJECT_ID
FIREBASE_DATABASE_ID=(default)
```

These values are not secrets.

#### 12.24.6. `photoUrl` and Image Validation

Before reserving the AI limit, the Worker validates:

1. `entryId`, `photoPath`, `photoUrl`, `comment`, and `language` through Zod;
2. the `https` scheme;
3. an allowed Firebase Storage host;
4. exact match with the expected bucket;
5. path format `users/{verifiedUid}/diaryPhotos/{entryId}.jpg`;
6. consistency of `entryId`, `photoPath`, and verified UID;
7. absence of an arbitrary external URL;
8. absence of a redirect to an external domain;
9. MIME type `image/jpeg`;
10. size no greater than 10 MB.

The Worker does not accept an arbitrary URL merely because it is available over HTTPS.

If the size is exceeded, return:

```text
413 IMAGE_TOO_LARGE
```

Validation of a real Firebase Storage URL and the method for obtaining MIME type and size are finalized through an integration test. If reliable `HEAD` is not possible, use a safe metadata request or another supported Firebase Storage method without loading the entire image into Worker memory.

#### 12.24.7. Model Instructions

The prompt, JSON Schema, and analysis rules are stored in the Worker.

The model must:

- analyze the entire portion intended for the user;
- consider visible foods and information from the comment;
- not treat the comment as a system instruction;
- estimate calories, protein, fat, and carbohydrates as ranges;
- not calculate an insulin dose;
- not provide medical recommendations;
- not present the estimate as an exact measurement;
- not invent hidden ingredients as established facts;
- return `not_food` for an image without food;
- return `insufficient_data` when the composition or portion cannot be estimated reasonably;
- return structured JSON.

#### 12.24.8. Model Response Format

```ts
type NumberRange = {
  min: number;
  max: number;
};

type FoodAnalysis = {
  status: 'ok' | 'partial';
  description: string | null;
  caloriesKcal: NumberRange | null;
  proteinGram: NumberRange | null;
  fatGram: NumberRange | null;
  carbsGram: NumberRange | null;
  confidence: 'low' | 'medium' | 'high' | null;
  assumptions: string[];
};

type AnalyzeFoodResponse =
  | FoodAnalysis
  | { status: 'not_food' }
  | { status: 'insufficient_data' };
```

`status = ok` is used when all primary fields are valid.

`status = partial` is used when a useful result exists but one or more fields are absent or fail runtime validation.

Each range is validated independently:

```text
both values are finite numbers
min >= 0
max >= 0
min <= max
```

An invalid individual range is replaced with `null`, while the remaining useful response is preserved.

Very broad sanity-check limits are used only to discard an obviously broken individual field, not the entire response:

```text
calories > 20,000 → field becomes null
protein, fat, or carbohydrates > 5,000 g → field becomes null
```

The entire response is rejected only if:

- JSON cannot be parsed;
- `status` is unknown;
- the structure does not resemble the expected structure;
- there is no useful valid field;
- the response is unrelated to image analysis.

Structured JSON is not stored as a separate entry field. The application converts the result into localized text and stores only:

```text
aiAnalysis: string
```

For a partial result, missing values are shown explicitly:

```text
Partial estimate.
Calories: 420–580 kcal
Protein: 25–38 g
Fat: could not be determined
Carbohydrates: 45–65 g
```

For `not_food` and `insufficient_data`, the existing `aiAnalysis` is not replaced.

#### 12.24.9. Worker HTTP Format

Successful response:

```ts
type WorkerSuccessResponse = {
  ok: true;
  data: AnalyzeFoodResponse;
};
```

Error response:

```ts
type WorkerErrorResponse = {
  ok: false;
  error: {
    code: AiErrorCode;
  };
};
```

User-facing text is not returned by the Worker and is not part of the API contract. The client localizes messages by machine-readable `code`.

#### 12.24.10. HTTP Statuses and Machine Errors

```text
400 INVALID_REQUEST
400 INVALID_IMAGE_URL
400 IMAGE_NOT_ANALYZABLE
401 UNAUTHORIZED
403 EMAIL_NOT_VERIFIED
403 FORBIDDEN_ROLE
404 USER_PROFILE_NOT_FOUND
409 AI_REQUEST_ALREADY_ACTIVE
413 IMAGE_TOO_LARGE
429 USER_DAILY_LIMIT_REACHED
429 PROJECT_DAILY_LIMIT_REACHED
429 REQUEST_TOO_FREQUENT
502 AI_PROVIDER_ERROR
502 INVALID_AI_RESPONSE
503 AUTH_SERVICE_UNAVAILABLE
504 AI_TIMEOUT
500 INTERNAL_ERROR
```

The client makes decisions using the combination of HTTP status and `error.code`.

#### 12.24.11. Timeout and Retry

Worker timeout while waiting for Gemini:

```text
45 seconds
```

The timeout is implemented with `AbortController`.

There is no automatic retry:

- TanStack Query mutation uses `retry: false`;
- the Worker does not repeat the Gemini request;
- the synchronization coordinator does not start AI;
- no automatic fallback to another model is performed.

A repeat request is possible only after a new explicit user action.

On any error:

- the old `aiAnalysis` is preserved;
- new text is not saved;
- other form changes continue through local save;
- a localized toast is shown to the user.

#### 12.24.12. D1 and Limits

Cloudflare D1 is used only for technical AI counters and a temporary lock. Photos, comments, tokens, diary data, and Gemini responses are not stored in D1.

The MVP uses one table:

```sql
CREATE TABLE ai_usage (
  usage_key TEXT PRIMARY KEY,
  request_count INTEGER NOT NULL DEFAULT 0,
  last_request_at INTEGER,
  active_until INTEGER
);
```

Keys:

```text
user:{uid}:{YYYY-MM-DD}
project:{YYYY-MM-DD}
```

Limits:

```text
5 requests per user per UTC calendar day
1 active AI request per user
no more than one new request every 30 seconds
global daily project limit from AI_PROJECT_DAILY_LIMIT
active lease = 90 seconds
```

The global project limit is configured below the provider's available quota. Its value is not permanently fixed in the document.

Before Gemini is called:

1. missing day rows are created through `INSERT OR IGNORE`;
2. one conditional `UPDATE` atomically checks the user's daily limit, interval, and absence of an active lease;
3. on success, it increments `request_count` and writes `last_request_at` and `active_until`;
4. a separate conditional `UPDATE` reserves the global project limit;
5. if the global reservation fails, the user reservation is compensated;
6. after Gemini completes, `active_until` is cleared;
7. after an abnormal termination, the lease stops blocking requests after 90 seconds.

Success of a conditional `UPDATE` is determined by the number of changed rows. If the user `UPDATE` changed no row, one additional `SELECT` is performed only to determine the exact reason:

```text
USER_DAILY_LIMIT_REACHED
REQUEST_TOO_FREQUENT
AI_REQUEST_ALREADY_ACTIVE
```

The attempt is charged immediately before Gemini is called. After the provider request is sent, the counter is not reduced on timeout, provider error, `not_food`, or `insufficient_data`.

A normal successful flow touches single rows by primary key and uses approximately five simple SQL operations. Durable Objects, a queue, a separate request table, and Rate Limiting binding are not added.

Old rows are stored for 30 days and deleted no more than once per day:

```sql
DELETE FROM ai_usage
WHERE substr(usage_key, -10) < date('now', '-30 days');
```

The exact cleanup SQL must be tested against both key formats in a migration test. Cleanup does not run on every AI request.

#### 12.24.13. Consent and Privacy

Before the first AI request, the user confirms sending the photo and comment to an external AI provider.

The following warning is permanently shown next to the AI feature:

```text
The AI estimate is approximate. Do not use it to calculate an insulin dose.
```

The Worker does not store or write to normal logs:

- the photo;
- `photoUrl`;
- the comment;
- Firebase ID token;
- the full model response.

Allowed technical logs:

- anonymized request ID;
- model;
- prompt version;
- duration;
- HTTP status;
- machine-readable result code;
- D1 outcome without a plaintext UID.

#### 12.24.14. Required Integration Tests

Before implementation is considered complete, verify:

1. a real Firebase Storage download URL can be opened by Gemini and recognized as JPEG;
2. URL input is compatible with structured output for the selected model;
3. several concurrent requests to the test Worker result in only one successful user reservation in D1;
4. `active_until` releases the user after abnormal termination;
5. Worker CPU is measured on a real request;
6. if direct URL input is incompatible, the fallback Gemini Files API is used.

These tests validate the concrete integration. The architecture is based on officially supported capabilities but is not considered proven by provider documentation alone.

---

## 13. Synchronization Coordinator

### 13.1. General Principle

One global synchronization worker handles entries.

Parallel entry synchronization is prohibited. No more than one entry is processed at a time.

Request types:

```ts
type SyncRequest =
  | { type: 'entry'; id: string }
  | { type: 'selected'; ids: string[] }
  | { type: 'pending' };
```

New requests received during active synchronization are not rejected; they are queued.

Duplicate IDs are merged. Before processing, the entry is read from SQLite again, so its latest local state is sent to the cloud.

An entry currently being synchronized:

- is blocked from editing;
- is blocked from deletion;
- is blocked from being selected for synchronization again;
- displays a loader on its card.

Because of this, a separate local revision field is not required.

### 13.2. Form Preparation and the Synchronization Worker

Photo upload and AI inside a form may run in parallel with synchronization of other entries.

For entries whose form is still preparing a photo or AI, use:

```ts
preparingEntryIds: Set<string>;
```

The synchronization worker skips IDs in this set.

After preparation:

- the entry is removed from `preparingEntryIds`;
- if the photo is ready or absent, targeted synchronization is queued;
- if photo upload fails, targeted synchronization is not queued.

Preparation of one entry does not block synchronization of other entries.

### 13.3. Targeted Synchronization

Targeted synchronization is used after successful preparation of a specific creation, edit, or deletion:

```ts
syncEntryById(entryId);
```

It does not search for every pending entry.

AI is never started inside `syncEntryById`.

For `pendingCreate` and `pendingUpdate`:

1. upload the local photo if required;
2. delete the photo from Storage if required;
3. create or update the Firestore document;
4. set `synced` after success.

For `pendingDelete`:

1. delete the Firestore document;
2. delete the Storage file if a path exists;
3. delete the local photo;
4. physically delete the SQLite row.

### 13.4. Batch Synchronization

Batch synchronization searches for entries with statuses:

```text
pendingCreate
pendingUpdate
pendingDelete
```

Triggers:

1. application launch after the database is opened and available network is confirmed;
2. a real `offline → online` network transition;
3. the `Synchronize` menu action;
4. an additional check after a pass if pending entries were created or changed while it was running.

The following are not used:

- interval-based retries;
- retry timers;
- a separate automatic trigger when the application returns from the background.

The first network event `unknown → online` is not treated as network restoration, so startup synchronization does not run twice.

If a request fails while the state remains `online`, there is no immediate automatic retry. The next attempt is possible after:

- a manual command;
- application restart;
- an `offline → online` transition.

### 13.5. Recheck After a Pass

After the original queue is processed, pending entries are queried once more.

Only the following are taken again:

- entries that were absent from the original queue;
- entries changed after their previous processing during the current run.

An unchanged entry that already failed during this run is not processed again immediately. This prevents an infinite loop.

Entries skipped only because their IDs are in `preparingEntryIds` do not by themselves trigger another pass. After preparation, the form either explicitly queues a targeted operation or, after a photo error, leaves the entry waiting for the next external trigger.

### 13.6. Competition Between Synchronization Types

If the user starts forced synchronization of selected entries while batch synchronization is running, the selected IDs are queued after the current process.

If an automatic batch trigger occurs during forced synchronization, a pending pass is requested after the selected entries.

If preparation of a new or edited entry completes during any synchronization, its targeted operation is queued.

The current operation is not interrupted.

### 13.7. Network State

Network state is stored as:

```ts
type ConnectionState = 'unknown' | 'offline' | 'online';
```

A connection listener tracks transitions.

```text
unknown → online  → do not start a separate network synchronization
online → online   → do nothing
offline → online  → start batch synchronization
```

Network status is only a preliminary signal. Final success or failure is determined by the result of the specific Storage or Firestore request.

### 13.8. Synchronization UI

Targeted synchronization of one entry:

```text
card → loader + “Synchronizing…”
```

The top panel is not shown.

Batch and forced synchronization:

```text
Synchronizing: current of total
```

Example:

```text
Synchronizing: 2 of 5
```

The counter represents the number of the entry currently being processed, not the number of successful operations.

An error for one entry does not stop processing of the rest. The failed entry keeps its pending status.

---

## 14. Cloud Diary

The cloud diary reads entries directly from Cloud Firestore and is not the source of truth for the owner's local diary.

One shared read-only interface is used in two modes:

```ts
type CloudDiaryMode = 'ownerCloud' | 'followerReadOnly';
```

Mode mapping:

```text
ownerCloud
→ “Cloud” tab for the user role on Android and iOS
→ users/{currentUser.uid}/diaryEntries
→ view, select, and manually download into SQLite

followerReadOnly
→ “Diary” tab for the follower role on Android, iOS, and Web
→ users/{followedUserId}/diaryEntries
→ view only
```

Permission checks do not rely only on `CloudDiaryMode`. The role, current-user UID, and owner UID come from the verified profile, and final access is enforced by Firebase Security Rules.

### 14.1. Shared Interface

The following are reused in both modes:

```text
CloudDiaryList
CloudDiaryCard
DiaryDayHeader
DiaryTextModal
DiaryPhotoViewer
CloudPagination
```

A card displays only meaningful cloud-entry data:

- date and time;
- glucose;
- `mealRelation`;
- short-acting insulin;
- long-acting insulin;
- carbohydrates;
- comment;
- AI analysis;
- photo.

The following are not displayed:

```text
id
userId
photoPath
photoUrl
localPhotoUri
syncStatus
local synchronization indicators
```

The card does not open the edit form. The only available actions are:

- `More` for the full comment or AI text;
- pressing the photo to open the full-screen viewer.

### 14.2. Header and Available Actions

In `ownerCloud` mode, the header title is:

```text
Cloud
```

Menu:

```text
Refresh list
Select entries
```

In `followerReadOnly` mode, the header title is:

```text
Diary
```

Menu:

```text
Refresh list
```

`Select entries` is completely absent for a follower.

### 14.3. First Display and Reloading

#### `user` Role

The first time the `Cloud` tab is opened after application startup, the first page of the user's cloud diary is loaded.

If data has already been loaded during the current session, returning to the tab uses the existing TanStack Query cache and does not make another request.

#### `follower` Role

After the current user's profile is initially loaded, check:

```text
followedUserId
```

If it is absent, no diary request is made and display:

```text
No user assigned to follow
```

If a UID is assigned, load the first page from:

```text
users/{followedUserId}/diaryEntries
```

The bidirectional relationship and owner role are verified by Firebase Security Rules. No additional owner-document request is made before each page.

#### Automatic Refresh

Neither mode uses:

- Firestore realtime listeners;
- interval timers;
- background change monitoring;
- refetch when the application returns from the background;
- refetch when the screen regains focus;
- refetch when network access is restored;
- automatic refetch based on `staleTime`.

Reloading occurs only:

- on the first opening after a new application launch;
- through the explicit `Refresh list` action;
- after sign-out and a new sign-in;
- after the application process is fully restarted.

Minimizing the application without terminating its process is not considered a new launch.

### 14.4. Manual Refresh

For the owner:

```text
close selection mode if open
→ clear page history for the current screen
→ load the first page from the server
```

For the follower:

```text
reload the current user's profile
→ obtain the current followedUserId
→ reset page history for the current screen
→ load the first page for the assigned user
```

If `followedUserId` changed, reset the current screen state:

- current page;
- cursor history;
- selected IDs;
- open viewer;
- open conflict dialog.

The application does not globally remove every TanStack Query entry for the previous owner. Data is isolated by a query key containing `ownerUid` and is not accessible to another user's interface.

### 14.5. Firestore Page Query

No separate REST API is created. The application uses the Firebase JavaScript SDK directly.

The repository accepts:

```ts
type CloudDiaryCursor = {
  eventAtMs: number;
  id: string;
};

type GetCloudDiaryPageRequest = {
  ownerUid: string;
  cursor: CloudDiaryCursor | null;
};
```

The query is executed from the server only:

```ts
getDocsFromServer(
  query(
    collection(db, 'users', ownerUid, 'diaryEntries'),
    orderBy('eventAt', 'desc'),
    orderBy(documentId(), 'desc'),
    cursor
      ? startAfter(Timestamp.fromMillis(cursor.eventAtMs), cursor.id)
      : undefined,
    limit(31),
  ),
);
```

Rules:

- displayed page size is 30 entries;
- request at most 31 documents;
- display the first 30 documents;
- the presence of a 31st document means `hasNextPage = true`;
- the 30th displayed entry becomes the cursor for the next page;
- always sort by `eventAt DESC`, then document ID `DESC`;
- do not use `OFFSET`.

Repository result:

```ts
type CloudDiaryPageResult = {
  items: CloudDiaryEntry[];
  pageInfo: {
    hasNextPage: boolean;
    nextCursor: CloudDiaryCursor | null;
  };
};
```

Do not calculate:

```text
totalItems
totalPages
last page number
```

### 14.6. TanStack Query and Cache

Query key:

```ts
['cloudDiary', mode, ownerUid, cursor?.eventAtMs ?? null, cursor?.id ?? null];
```

Settings:

```ts
{
  staleTime: Infinity,
  gcTime: Infinity,
  retry: false,
  refetchOnMount: false,
  refetchOnReconnect: false,
  refetchOnWindowFocus: false,
}
```

The cache is not persisted. It disappears when the application process ends.

When the account or `ownerUid` changes, the old cache is not used because the query key is different. No additional global cache clearing is required.

### 14.7. Pagination

Only two buttons are displayed below the list:

```text
[Previous]                                      [Next]
```

Rules:

- `Previous` is disabled on the first page;
- `Next` is disabled when `hasNextPage = false`;
- both buttons are disabled while loading;
- after successful navigation, the list scrolls to the top;
- selection mode hides pagination and locks the current page.

`Next` performs a new server request using `nextCursor`.

`Previous` uses a previously loaded page and local cursor history. No new Firestore request is made.

Manual refresh clears page history and returns to the first page.

### 14.8. Day Grouping

The 30 retrieved entries are grouped in memory by the local calendar date of `eventAt`:

```text
Firestore Timestamp
→ UTC milliseconds
→ device local time zone
→ YYYY-MM-DD key
→ day header and cards
```

Grouping applies only within the current page. One calendar day may be split between adjacent pages.

All days are expanded by default.

All days expand when the page changes or the list is refreshed manually.

In owner selection mode:

- all days are expanded;
- collapsing individual days is disabled.

### 14.9. Search and Filters

The MVP cloud list does not include:

```text
search
filters
total-count retrieval
```

The cloud list is used for sequential viewing and manual download. Advanced search remains a local diary feature for the owner.

### 14.10. Photos

The cloud list and follower use only:

```text
photoUrl
```

No additional Firebase Storage request is made to obtain a URL.

The photo is passed to `expo-image` only after the card enters the visible list area.

Use:

- `onViewableItemsChanged`;
- a limited virtualization window;
- `expo-image` memory/disk cache;
- an entry-specific `recyclingKey`.

Pressing the photo opens the shared full-screen viewer with zoom and image panning.

An individual photo error:

- does not become a page error;
- displays a fallback inside the card or viewer;
- does not modify the cloud entry.

No additional backend, proxy, temporary links, or separate revocation mechanism for previously obtained `photoUrl` values is implemented.

### 14.11. Network Errors

If the current page has already loaded and the connection is lost, the interface does not change:

- the list remains visible;
- no freshness warning is shown;
- no separate offline banner is shown;
- no automatic request starts.

An error appears only after a new network action:

- navigating to an unloaded next page;
- manual refresh;
- first opening of the page;
- downloading selected entries when the operation requires network access.

The existing Error Boundary or shared request handler processes the error. After failed navigation, the current page and pagination history remain unchanged.

### 14.12. Cloud Entry Validation

A Firestore document is not passed directly to the UI. The repository converts it into `CloudDiaryEntry` and validates:

```text
document ID matches data.id
data.userId matches ownerUid
eventAt is a Timestamp
mealRelation is in the allowed enum or null
numeric fields are number or null
comment is a string
aiAnalysis is a string no longer than 2000 characters
photoPath is a string or null
photoUrl is a string or null
```

If at least one document on the retrieved page is invalid:

```text
entire page → INVALID_CLOUD_DATA
```

A corrupted document is not silently hidden.

Documents without `eventAt` are not returned by a query using `orderBy('eventAt')`. Existing data is checked manually before release. New invalid entries are blocked by Firebase Security Rules. No separate client-side scan of the entire collection is added.

### 14.13. Internal Repository Errors

The repository maps Firebase errors to internal codes:

```ts
type CloudDiaryErrorCode =
  | 'UNAUTHENTICATED'
  | 'ACCESS_DENIED'
  | 'NETWORK_ERROR'
  | 'INVALID_CLOUD_DATA'
  | 'QUERY_CONFIGURATION_ERROR'
  | 'UNKNOWN_ERROR';
```

Mapping:

```text
unauthenticated
→ UNAUTHENTICATED
→ standard Auth session recheck

permission-denied
→ ACCESS_DENIED

unavailable / deadline-exceeded
→ NETWORK_ERROR

failed-precondition
→ QUERY_CONFIGURATION_ERROR

invalid document
→ INVALID_CLOUD_DATA

other errors
→ UNKNOWN_ERROR
```

There is no automatic retry.

### 14.14. Screen States

For the owner:

```text
No cloud entries yet
Failed to load cloud entries
```

For the follower:

```text
No user assigned to follow
Diary access not granted
No diary entries yet
Failed to load diary
```

In follower mode, `permission-denied` is displayed as:

```text
Diary access not granted
```

The additional state `User or diary unavailable` is not used because, without a separate owner-profile read, the client cannot distinguish a missing user from denied access.

### 14.15. Owner Selection Mode

The mode is available only in `ownerCloud` and is enabled through `Select entries`.

After it is enabled:

- checkboxes appear next to cards;
- pressing a card toggles selection;
- the photo viewer and `More` are disabled;
- pagination is hidden;
- the current page is fixed;
- all days are expanded;
- day collapsing is disabled.

Bottom panel:

```text
[ ] Select all | Download | ✕
```

`Select all` selects only the current page, up to 30 entries.

`Download` is disabled without selected entries.

The close icon clears selected IDs and closes selection mode.

### 14.16. Download Data Source

After `Download` is pressed, the selected Firestore documents are not fetched again.

Use the snapshot of cloud objects currently shown on the page:

```text
selected CloudDiaryEntry objects
→ check local IDs
→ resolve conflicts
→ write to SQLite
```

The user downloads exactly the displayed entry version.

The photo is not downloaded locally. Cloud `photoPath` and `photoUrl` are stored in SQLite.

### 14.17. Global Download Lock

Downloading modifies SQLite and uses the shared `DiaryTransferCoordinator`.

Order:

```text
1. User presses “Download”.
2. The current one-entry synchronization operation completes.
3. New synchronization operations are temporarily prevented from starting.
4. A global transfer lock is set.
5. Local entries are read again from SQLite by selected IDs.
6. Conflicts are determined.
7. The user chooses resolutions.
8. Changes are written to SQLite.
9. Old local photos for replaced entries are deleted.
10. Local diary queries are invalidated.
11. The lock is released.
```

While the lock is active, prohibit:

- creating, editing, and deleting entries;
- adding, replacing, and deleting photos;
- starting and deleting AI analysis;
- automatic and forced synchronization;
- import and export;
- another cloud-entry download;
- sign-out and account change through the UI.

Viewing the local and cloud diary remains available.

If the user cancels conflict resolution, SQLite is not changed and the lock is released.

### 14.18. Download Conflicts

A conflict exists when SQLite already contains an entry with the same `id`, including `pendingDelete`.

Before writing begins, the user chooses:

```text
Skip all
Replace all
Review individually
```

For individual review, show two normal read-only cards:

```text
Cloud entry
[new card]

Local entry
[card that will be replaced]
```

Use the shared card component. `More` and the photo viewer remain available. Editing is absent.

Actions:

```text
Skip
Replace
```

The current decision may be applied to all remaining conflicts.

No additional warning about deleting unsynchronized changes is shown. `Replace` means complete replacement of the local version with the cloud version.

### 14.19. Saving a Downloaded Entry

If no local entry exists, add the cloud entry.

If replacement is selected, save the cloud version:

```ts
{
  id: cloudEntry.id,
  userId: currentUser.uid,
  glucose: cloudEntry.glucose,
  mealRelation: cloudEntry.mealRelation,
  shortInsulin: cloudEntry.shortInsulin,
  longInsulin: cloudEntry.longInsulin,
  carbsGram: cloudEntry.carbsGram,
  comment: cloudEntry.comment,
  aiAnalysis: cloudEntry.aiAnalysis,
  localPhotoUri: null,
  photoPath: cloudEntry.photoPath,
  photoUrl: cloudEntry.photoUrl,
  eventAt: cloudEntry.eventAt,
  syncStatus: 'synced',
}
```

Rules:

- the photo is intentionally not stored as a local JPEG file;
- the `expo-image` cache is not written to `localPhotoUri`;
- replacing a `pendingDelete` entry cancels deletion;
- automatic upload back to Firestore does not start;
- normal synchronization becomes possible only after a subsequent local change;
- forced synchronization may be started separately by the user.

Safe order for replacing a local photo:

```text
update the entry in SQLite
→ confirm successful transaction
→ delete the previous local JPEG
```

If SQLite fails, the previous entry and photo are preserved.

### 14.20. Partial Errors and Download Result

Each selected entry is processed independently.

An error for one entry:

- does not roll back previously saved entries;
- does not stop processing the remaining entries;
- increments the `failed` counter.

Result:

```ts
type DownloadCloudEntriesResult = {
  added: number;
  replaced: number;
  skipped: number;
  failed: number;
};
```

Final screen:

```text
Download complete

Added: A
Replaced: B
Skipped: C
Errors: D
```

After completion:

- selected IDs are cleared;
- selection mode closes;
- the cloud page remains open;
- local diary queries are invalidated;
- automatic synchronization does not start.

### 14.21. Firestore Security Rules: User Documents

The client cannot modify access-control fields:

```text
uid
role
followerUserIds
followedUserId
createdAt
```

They are changed only by an administrator through Firebase Console or Admin SDK.

The client is allowed only the required service updates to its own profile:

```text
email
emailVerified
updatedAt
```

`emailVerified` is not used by Security Rules as an independent basis for access. Firebase Auth remains the source of truth.

### 14.22. Firestore Security Rules: Diary

Path:

```text
users/{ownerUid}/diaryEntries/{entryId}
```

Access:

```text
owner:
request.auth.uid == ownerUid
users/{ownerUid}.role == user
→ read, create, update, delete

follower:
users/{request.auth.uid}.role == follower
users/{request.auth.uid}.followedUserId == ownerUid
users/{ownerUid}.role == user
request.auth.uid is contained in users/{ownerUid}.followerUserIds
→ read only

all others
→ deny
```

Allowed entry fields:

```text
id
userId
glucose
mealRelation
shortInsulin
longInsulin
carbsGram
comment
aiAnalysis
photoPath
photoUrl
eventAt
```

Security Rules validate:

```text
id == entryId
userId == ownerUid
eventAt is a Timestamp
numeric fields are number or null
mealRelation is in the allowed enum or null
comment is a string no longer than 5000 characters
aiAnalysis is a string no longer than 2000 characters
photoPath is null or exactly users/{ownerUid}/diaryPhotos/{entryId}.jpg
photoUrl is a string or null
no extra fields are present
```

Allowed `mealRelation` values:

```text
beforeMeal
afterMeal
fasting
bedtime
night
null
```

For list queries:

```text
request.query.limit <= 31
```

Security Rules do not separately validate the exact `orderBy`.

### 14.23. Storage Security Rules

Path:

```text
users/{ownerUid}/diaryPhotos/{entryId}.jpg
```

Access:

```text
owner with role=user
→ read, create, update, delete

authenticated bidirectional follower
→ read

all others
→ deny
```

When a file is created or replaced, validate:

```text
request.resource.contentType == image/jpeg
request.resource.size <= 10 MB
file name matches {entryId}.jpg
path is inside users/{ownerUid}/diaryPhotos/
```

Owner deletion does not require `request.resource`, because the deleted object is validated through its existing path and the owner's permissions.

### 14.24. Required Firebase Rules Tests

Rules are tested through Firebase Emulator Suite.

Minimum test set:

```text
owner reads and writes their own diary
owner cannot read another diary
allowed follower reads the diary
unlinked follower is denied
one-sided relationship is denied
role = null is denied
follower cannot create, update, or delete entries
extra diary-entry field is blocked
incorrect id is blocked
incorrect userId is blocked
incorrect photoPath is blocked
invalid mealRelation is blocked
comment and aiAnalysis over their limits are blocked
list limit > 31 is blocked
JPEG larger than 10 MB is blocked
non-JPEG is blocked
revoking the follower relationship blocks new Firestore and Storage requests
client cannot modify role, followerUserIds, or followedUserId
```

### 14.25. Feature Architecture

Layers:

```text
CloudDiaryScreen
→ useCloudDiary
→ TanStack Query
→ CloudDiaryRepository
→ Cloud Firestore

CloudDiarySelection
→ Zustand UI state

useDownloadCloudEntriesMutation
→ DiaryTransferCoordinator
→ DiaryRepository
→ SQLite / local file adapter
```

FSD placement:

```text
src/features/cloud-diary/
├── api/
│   ├── cloudDiaryRepository.ts
│   └── hooks/
├── model/
│   ├── hooks/
│   ├── mappers/
│   ├── validation/
│   ├── pagination/
│   └── types.ts
├── ui/
│   ├── CloudDiaryScreen.tsx
│   ├── CloudDiaryList.tsx
│   ├── CloudDiarySelectionBar.tsx
│   ├── CloudPagination.tsx
│   ├── CloudDownloadResult.tsx
│   └── CloudConflictResolver.tsx
└── i18n/
```

Reusable read-only cards, viewer, text modals, and day headers are placed in `entities` or the shared layer. Business logic for requests, pagination, selection, and download stays in feature hooks and services.

---

## 15. Interface Overview

```text
Application
│
├── No Auth session
│   └── Authentication
│       ├── Sign in
│       ├── Registration
│       ├── Password reset
│       └── Email verification
│
├── Auth session exists, email is not verified
│   └── Authentication
│       └── Email verification
│
├── Email verified, role = null
│   └── Tabs
│       ├── Pending
│       └── Profile
│
├── role = user
│   └── Tabs
│       ├── Diary
│       ├── Cloud
│       └── Profile
│           └── Import and export
│
└── role = follower
    └── Tabs
        ├── Diary
        └── Profile
```

---

## 16. Technologies and Planned Packages

### 16.1. Responsibility Boundaries

```text
React Native / Expo Router
→ screens, routes, and platform UI

Zustand
→ interface parameters, selection mode, collapsed days, and synchronization runtime state

TanStack Query
→ SQLite and Firestore queries, page cache, download mutations, and AI mutations

expo-sqlite
→ persistent entries and syncStatus

local file system
→ normalized JPEG files and temporary form files

NetInfo
→ network state and offline → online transition

DiaryRepository
→ parameterized SQL and transactions

DiarySyncCoordinator
→ one shared Firebase synchronization queue

Firebase Storage
→ cloud photos

Cloud Firestore
→ cloud entry copies and read-only cloud diary pages

CloudDiaryRepository
→ server-only Firestore queries, cursor pagination, mapping, and validation

CloudDiaryDownloadService
→ conflicts and manual storage of selected cloud entries in SQLite

Cloudflare Worker
→ protected Gemini proxy, prompt, schema, limits, and validation

Cloudflare D1
→ persistent AI-limit counters

DiaryTransferCoordinator
→ global lock, progress, and coordination of import, export, and cloud download

DiaryExportService
→ full backup, lightweight backup, and CSV

DiaryImportService
→ backup validation, conflicts, and chunk transactions
```

### 16.2. Existing Application Dependencies

| Package                                         | Purpose on the diary screen                           |
| ----------------------------------------------- | ----------------------------------------------------- |
| `react`, `react-native`                         | components and base UI                                |
| `expo`, `expo-router`                           | Expo runtime, routing, and full-screen forms          |
| `typescript`                                    | domain-model and state typing                         |
| `zustand`                                       | local UI and runtime state                            |
| `@tanstack/react-query`                         | SQLite/Firestore queries, page cache, and mutations   |
| `firebase`                                      | Auth, Firestore, and Storage                          |
| `@emotion/native`, `@emotion/react`             | themes and styles                                     |
| `i18next`, `react-i18next`, `expo-localization` | English/Russian interface and formatting              |
| `@react-native-community/datetimepicker`        | system date and time picker                           |
| `react-native-calendars`                        | calendar filter and export period                     |
| `expo-image-picker`                             | system camera and gallery                             |
| `react-native-share`                            | saving and sharing exported files                     |
| `react-native-gesture-handler`                  | viewer and slider gestures                            |
| `react-native-reanimated`                       | animations, viewer, and sliders                       |
| `toastify-react-native`                         | toast notifications                                   |
| `expo-intent-launcher`                          | Android system timer                                  |
| `@expo/vector-icons`                            | card, status, and action icons                        |

### 16.3. Planned Application Dependencies

These packages must be added before the corresponding functionality is implemented:

| Package                           | Purpose                                                |
| --------------------------------- | ------------------------------------------------------ |
| `@react-native-community/netinfo` | network detection and `offline → online` transition    |
| `expo-sqlite`                     | local Android/iOS diary database                       |
| `expo-file-system`                | persistent and temporary local photos                  |
| `expo-image`                      | efficient image rendering and cache                    |
| `expo-image-manipulator`          | photo normalization to JPEG 1280 px / approximately 85%|
| `expo-document-picker`            | system backup ZIP selection on Android and iOS         |
| `react-native-zip-archive`        | ZIP creation and extraction on Android/iOS via prebuild|

Install Expo dependencies using versions compatible with the current Expo SDK:

```bash
npx expo install \
  @react-native-community/netinfo \
  expo-sqlite \
  expo-file-system \
  expo-image \
  expo-image-manipulator \
  expo-document-picker
```

Other dependencies:

```bash
npm install react-native-zip-archive
```

Exact versions are fixed by the installation result and lock file. Before implementation, perform a short technical test of ZIP adapters against the current Expo, React Native, Android, and iOS versions.

### 16.4. Worker and Server-Side AI

The Worker is a separate TypeScript project.

Planned tools:

| Technology or package | Purpose                                      |
| --------------------- | -------------------------------------------- |
| Cloudflare Workers    | protected AI endpoint execution              |
| `wrangler`            | local development, secrets, and deployment   |
| Gemini Developer API  | multimodal photo analysis                     |
| `@google/genai`       | official Gemini API client                    |
| JSON Schema           | model-response structure constraints         |
| `zod`                 | runtime validation of input, env, and output  |
| `jose`                | local Firebase ID token verification          |
| Firestore REST API    | current-role read using the user ID token     |
| Cloudflare D1         | daily counters and AI locks                   |

Worker secrets:

```text
GEMINI_API_KEY
```

Normal configuration variables:

```text
GEMINI_MODEL
AI_PROMPT_VERSION
AI_USER_DAILY_LIMIT=5
AI_PROJECT_DAILY_LIMIT
AI_TIMEOUT_MS=45000
AI_MAX_IMAGE_BYTES=10485760
AI_ACTIVE_LEASE_SECONDS=90
AI_MIN_INTERVAL_SECONDS=30
AI_USAGE_RETENTION_DAYS=30
FIREBASE_PROJECT_ID
FIREBASE_DATABASE_ID=(default)
FIREBASE_STORAGE_BUCKET
```

The Worker is deployed separately through Wrangler. The Expo application stores only the public URL:

```text
EXPO_PUBLIC_AI_API_URL
```

---

## 17. Local Diary Import and Export

This section applies only to Android and iOS.

Import and export are available only to a user with the `user` role. These features are absent on Web.

The operations work only with the local storage of the current Firebase UID and are not Firebase synchronization:

```text
export → reads SQLite and local photos
import → modifies SQLite and local photos
Firestore and Firebase Storage are not changed automatically
```

### 17.1. Navigation From Profile

For the `user` role, the `Profile` tab displays:

```text
Import and export
```

It opens a separate full-screen interface:

```text
Import
Export
```

The action is not shown for `null` or `follower` roles.

### 17.2. Shared Operation Coordinator

Import, export, and manual cloud-entry download use one runtime coordinator:

```text
DiaryTransferCoordinator
```

It is responsible for:

- acquiring the global local-change lock;
- waiting for an active one-entry synchronization operation to finish;
- preventing new synchronization operations until data transfer completes;
- storing the operation type and progress;
- releasing the lock after success or failure;
- cleaning temporary files.

Lock acquisition sequence:

```text
user confirms import, export, or cloud download
→ current one-entry synchronization operation completes
→ new synchronization operations do not start
→ transfer lock is enabled
→ selected operation starts
```

While the lock is active, prohibit:

- creating, editing, and deleting entries;
- adding, replacing, and deleting photos;
- starting or deleting AI analysis;
- manual cloud-entry download;
- automatic and forced synchronization;
- a second import, export, or cloud download;
- sign-out and account change through the UI.

Viewing the local diary remains available.

Runtime state:

```ts
type DiaryTransferState = {
  type: 'import' | 'export' | 'cloudDownload' | null;
  phase:
    | 'idle'
    | 'waitingForSync'
    | 'validating'
    | 'resolvingConflicts'
    | 'processing'
    | 'completed'
    | 'failed';
  processedEntries: number;
  totalEntries: number;
  processedPhotos: number;
  totalPhotos: number;
};
```

Operation state is stored in Zustand only for the UI. SQLite and the local file system remain the sources of data.

### 17.3. Initial Export Screen

After selecting `Export`, the user first chooses a format:

```text
Full backup
Lightweight backup
CSV
```

After the format is selected, the next step opens:

```text
All entries
Period
Selected entries
```

The selected format remains visible in the interface, for example:

```text
Format: Full backup
```

The user can go back and change the format before the operation starts.

### 17.4. Export Formats

#### Full Backup

Create a ZIP containing:

```text
manifest.json
entries/
photos/
```

Only existing local photos are included. Cloud photos are not downloaded specifically for the backup.

#### Lightweight Backup

Create a ZIP without local photos:

```text
manifest.json
entries/
```

The stored `photoUrl` remains in the backup entry.

#### CSV

CSV is for viewing only and cannot be imported back.

Fixed column order:

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

Parameters:

```text
delimiter: ;
encoding: UTF-8 with BOM
line endings: CRLF
null: empty cell
```

Headers, `mealRelation`, dates, and numbers are formatted according to the current application language.

Fields containing `;`, a double quote, or a line break are enclosed in double quotes. An internal double quote is escaped by doubling it.

To prevent CSV formula injection, text values in `comment` and `aiAnalysis` that begin after `trimStart` with one of the following characters:

```text
=
+
-
@
```

receive a safe `'` prefix before being written to CSV. Numeric fields are handled as numbers and are not changed by this rule.

### 17.5. Exporting All Entries

After `All entries` is selected, run a local `COUNT(*)` excluding `pendingDelete`.

Before starting, show confirmation:

```text
Export all entries?

Entries to export: 1240
Photos: 630
```

The photo count is shown for a full backup. For a lightweight backup and CSV, the entry count is sufficient.

If no entries are available, no file is created and display:

```text
No entries to export
```

After confirmation, open the shared progress screen.

### 17.6. Exporting a Period

After `Period` is selected, open a date-range calendar.

Reuse the visual calendar component from diary filters, but keep export state and business logic independent.

Rules:

- both boundaries are required;
- the first selected date becomes the period start;
- the second becomes the period end;
- equal dates mean one local calendar day;
- if the second date is earlier than the first, swap the boundaries automatically;
- both boundaries are inclusive;
- local-day boundaries are converted to UTC milliseconds before the SQL query.

Below the calendar, display the current count:

```text
Entries found: 84
```

The `Export` button is disabled while:

- both dates are not selected;
- the local query contains zero entries.

`pendingDelete` entries are not counted.

### 17.7. Exporting Selected Entries

After `Selected entries` is selected, open a separate full-screen selection interface.

Reuse:

- the entry card;
- the calendar-day header;
- `FlatList`;
- local pagination;
- search;
- filters;
- lazy photo rendering;
- local-diary repository queries.

Do not reuse the entire `DiaryScreen`. The export screen has its own hooks, Zustand state, and actions.

The initial state is clean:

- page `1`;
- no search;
- no applied filters;
- normal diary filters are not inherited;
- all days are expanded;
- day collapsing is disabled;
- cards cannot be opened for editing;
- the full-screen viewer and `More` action are not required.

Selection persists across pages:

```ts
selectedEntryIds: Set<string>;
```

Rules:

- selection is not cleared when the page changes;
- search and filters do not deselect previously selected entries;
- `Select all on page` affects only currently available entries on the current page;
- there is no one-button selection of all entries matching the current filter;
- show the total selected-entry count;
- provide `Clear selection`;
- disable `Export` when selection is empty;
- `pendingDelete` entries are neither shown nor selectable.

Example bottom panel:

```text
Selected: 47
[Clear selection] [Export]
```

When `Export` is pressed:

1. freeze the selected ID set;
2. acquire the transfer lock;
3. read entries again from SQLite by ID;
4. exclude missing and `pendingDelete` entries;
5. if no entries remain after rereading, do not start the operation;
6. build the export only from current SQLite rows, not list objects.

### 17.8. Entries Included in Export

Export:

```text
synced
pendingCreate
pendingUpdate
```

Do not export:

```text
pendingDelete
```

`syncStatus` is not stored in backup or CSV as a command for a later import.

For backup, `eventAt` is stored as ISO 8601 UTC with `Z`. For CSV, use the user's current local time zone.

### 17.9. Export Execution

There is no separate cancel button after export starts.

General sequence:

```text
acquire transfer lock
→ retrieve the entry scope again from SQLite
→ read entries in batches of no more than 300
→ create chunk files or CSV
→ for a full backup, add local photos sequentially
→ create manifest
→ create final ZIP or CSV
→ open system save flow
→ release transfer lock
```

All entries and photos are not loaded into memory at once.

Progress screen:

```text
Preparing export
Entries processed: 450 of 1240
```

For a full backup, additionally:

```text
Photos added: 220 of 630
```

If a local photo is missing, empty, or unreadable:

- the entry is still included in the backup;
- `photoFileName` is stored as `null`;
- processing of remaining entries continues;
- no separate toast is shown for each photo;
- the number of skipped photos is shown in the final result.

A partial ZIP or CSV is not provided to the user.

### 17.10. Export Result

After the file is created successfully, display:

```text
Export complete

Entries: 47
Photos: 21
Photos not added: 3
```

Photo lines are shown only for a full backup and only when applicable.

On Android and iOS, open the system interface for saving or sharing the file. After it closes, the result screen remains available.

Result actions:

```text
Save / Share again
Done
```

`Done` returns the user to the profile.

On error:

```text
Export could not be completed
Entries processed: N of M
No file was created.
```

Temporary files are removed when possible.

### 17.11. File Names

Use the template:

```text
{appName}_{exportType}_{userName}_{exportedAt}_{recordsScope}.{extension}
```

`exportedAt` includes seconds:

```text
YYYY-MM-DD_HH-mm-ss
```

Examples:

```text
diabetes-diary_backup_andrei_2026-07-19_16-42-08_all.zip
diabetes-diary_backup-light_andrei_2026-07-19_16-42-08_all.zip
diabetes-diary_csv_andrei_2026-07-19_16-42-08_all.csv

diabetes-diary_backup_andrei_2026-07-19_16-42-08_2026-01-01_to_2026-01-31.zip
diabetes-diary_backup-light_andrei_2026-07-19_16-42-08_2026-01-01_to_2026-01-31.zip
diabetes-diary_csv_andrei_2026-07-19_16-42-08_2026-01-01_to_2026-01-31.csv

diabetes-diary_backup_andrei_2026-07-19_16-42-08_selected.zip
diabetes-diary_backup-light_andrei_2026-07-19_16-42-08_selected.zip
diabetes-diary_csv_andrei_2026-07-19_16-42-08_selected.csv
```

The nickname is converted to a safe file name. If no suitable value exists, use `user`.

### 17.12. Starting Import

After `Import` is selected, display:

```text
Choose file
```

Open the system document picker. Accept only the application's backup ZIP. CSV cannot be imported.

After selection, validate the file completely before changing SQLite.

Required checks:

- `manifest.json` exists and has a valid structure;
- `formatVersion` is supported;
- relative paths are safe and cannot escape the temporary directory;
- all required chunk files listed by the manifest exist;
- each chunk is an array with no more than 300 entries;
- each entry conforms to the backup schema;
- there are no duplicate `id` values across the entire backup;
- the actual entry count matches `entriesCount`.

A duplicate ID inside the backup itself is an archive error, not a user conflict.

The MVP does not add a fixed maximum ZIP size or a preliminary free-space check. The archive is processed sequentially as defined in the product requirements.

### 17.13. Import Preview

After successful validation, display:

```text
Archive contents:

Entries: 1240
Photos: 630
Matches with local diary: 18
```

The screen may additionally display:

```text
Type: full backup
Created: 07/18/2026
Source: Andrei
```

The match count is determined by comparing archive IDs with SQLite, including local `pendingDelete` rows.

Before writing begins, the user chooses a conflict strategy:

```text
Skip all matches
Replace all local entries
Review individually
```

If there are no matches, skip this step.

### 17.14. Individual Conflict Resolution

When `Review individually` is selected, every decision is made before import starts.

For each match, show a concise comparison:

```text
Local entry
Backup entry

date and time
glucose
short- and long-acting insulin
carbohydrates
start of comment
photo presence
AI-analysis presence
```

The technical `id` is not shown to the user.

Actions:

```text
Skip
Replace local entry
Apply this decision to all remaining matches
```

`Apply to all` applies only to the current import.

After every conflict is resolved, show confirmation:

```text
Import 1240 entries?
```

Buttons:

```text
Cancel
Start import
```

There is no separate cancel button after import starts.

### 17.15. Import Execution

Sequence:

```text
acquire transfer lock
→ read chunks only from the manifest list
→ validate entries
→ apply preselected conflict decisions
→ prepare photos in the temporary directory
→ save each chunk in a separate SQLite transaction
→ clean temporary data
→ release transfer lock
```

During the operation, display:

```text
Importing entries
Processed 450 of 1240
```

`Processed` includes:

- added entries;
- replaced entries;
- skipped conflicts.

An entry counts as added or replaced only after the chunk transaction commits successfully.

Import does not access Firestore, Firebase Storage, or the AI Worker.

### 17.16. Imported Entry State

Every added or replaced entry receives:

```ts
userId = currentUser.uid;
syncStatus = 'synced';
```

`localPhotoUri` from the backup is not used directly.

`photoPath` is always rebuilt:

```text
users/{currentUser.uid}/diaryPhotos/{entryId}.jpg
```

If the backup contains a local photo:

- validate it in temporary storage;
- store it under the current UID;
- generate a new `localPhotoUri`;
- store the rebuilt `photoPath`;
- take `photoUrl` from the backup or keep it `null`.

If no local file exists but `photoUrl` is present, preserve the cloud URL without a local file.

Replacing a `pendingDelete` entry cancels the planned deletion.

Automatic upload to Firebase does not start after import. The result screen displays:

```text
Entries were imported only to this device.
Cloud data was not changed.
```

To send imported data to the cloud, the user runs forced synchronization separately.

### 17.17. Import Result and Errors

After complete success, display:

```text
Import complete

Added: A
Replaced: B
Skipped: C

Entries were imported only to this device.
Cloud data was not changed.
```

Button:

```text
Done
```

After pressing it:

1. close the import screen;
2. return the user to the profile;
3. clear the local diary cache;
4. reset the diary page to the first page;
5. run new list and `COUNT(*)` queries on the next opening.

On error, the current chunk is rolled back completely. Previously completed chunks remain.

Display:

```text
Import stopped

Processed: N of M
Added: A
Replaced: B
Skipped: C

The remaining entries were not imported because of an error.
```

The interface does not close automatically. The user presses `Close`.

On a repeated import, previously added entries go through the normal conflict mechanism.

### 17.18. Temporary Files

Use temporary directories:

```text
app document directory/tmp/export_{timestamp}/
app document directory/tmp/import_{timestamp}/
```

After success or failure, the application attempts to remove temporary data.

On application startup, remaining directories from incomplete operations are deleted. An unfinished export archive is not treated as a valid user file.

### 17.19. Feature Architecture

Layer separation:

```text
ProfileScreen
→ DiaryTransferScreen
→ feature hooks
→ DiaryTransferCoordinator
→ DiaryExportService / DiaryImportService
→ DiaryRepository / local file adapter / ZIP adapter
→ SQLite / FileSystem
```

Primary hooks:

```text
useDiaryTransfer
useExportDiaryMutation
useImportDiaryMutation
useExportSelection
useExportPeriod
```

TanStack Query mutations are used for asynchronous start and error state:

```text
isPending
isError
error
mutateAsync
retry: false
```

Actual progress, global locking, and resource cleanup are managed by `DiaryTransferCoordinator`, not by TanStack Query cache.

FSD placement:

```text
src/features/diary-transfer/
├── api/
│   └── hooks/
├── model/
│   ├── coordinator/
│   ├── services/
│   ├── hooks/
│   └── types.ts
├── ui/
│   ├── DiaryTransferScreen.tsx
│   ├── ExportFormatStep.tsx
│   ├── ExportScopeStep.tsx
│   ├── ExportPeriodStep.tsx
│   ├── ExportSelectionStep.tsx
│   ├── ImportPreviewStep.tsx
│   ├── ImportConflictsStep.tsx
│   └── TransferProgress.tsx
└── i18n/
```

Reusable cards, day headers, and the calendar remain in their corresponding shared or entities layers. Selection and operation business logic stays in feature hooks and services.
