# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

#### Bitable (Multidimensional Table) Tool
- **New tool**: `feishu_bitable` for managing Feishu multidimensional tables
- **10 operations**:
  - `list_tables` - List all tables in a base
  - `create_table` - Create new table with fields
  - `list_fields` - List all fields with type information
  - `create_field` - Create new field with type configuration
  - `list_records` - Query records with pagination (50-500 per page)
  - `search_records` - Search records with filters
  - `create_record` - Create single record
  - `batch_create_records` - Batch create up to 500 records
  - `update_record` - Update existing record
  - `delete_record` - Delete record
- **Field type support**: 23 field types including text, number, single select, multi-select, date, checkbox, person, attachment, formula, etc.
- **Automatic field detection**: Filters out read-only fields (formula, auto-number, lookup)
- **Comprehensive documentation**: Complete usage guide with examples
- **Permission**: `bitable:app:readonly` (read), `bitable:app` (write)

#### Calendar Tool
- **New tool**: `feishu_calendar` for managing calendars and events
- **8 operations**:
  - `list_calendars` - List accessible calendars
  - `list_events` - List events with time range filtering (default: today)
  - `get_event` - Get event details with attendees and reminders
  - `create_event` - Create event with attendees, reminders, and location
  - `update_event` - Update event (partial update supported)
  - `delete_event` - Delete event
  - `search_events` - Search events by keyword with time filtering
  - `get_freebusy` - Check availability (requires user_id in ou_xxx format)
- **Time format support**:
  - All-day events: `YYYY-MM-DD`
  - Precise time: `YYYY-MM-DD HH:mm`
  - Default timezone: `Asia/Shanghai`
- **Auto calendar selection**: Automatically uses primary calendar if not specified
- **Attendees and reminders**: JSON format support with escaping
- **API constraints**: `page_size` minimum 50 (not 10), `user_id` required for freebusy (not optional)
- **Permission**: `calendar:calendar:readonly` (read), `calendar:calendar` (write)

#### Minutes Tool
- **New tool**: `feishu_minutes` for viewing meeting minutes metadata
- **2 operations**:
  - `get` - Get minutes basic information
  - `statistics` - Get statistics data
- **Read-only**: Minutes API only supports read operations
- **API limitations documented**:
  - Permission may not take effect even when granted
  - Returns 403 with error code 2091005 in most environments
  - Recommended to use `feishu_doc` tool for accessing minutes content
- **Comprehensive limitation documentation**: `MINUTES-API-LIMITATION.md` with diagnostic results
- **Permission**: `minutes:minutes:readonly`

### Changed
- Updated `src/types.ts` to include `bitable`, `calendar`, `minutes` in `FeishuToolsConfig`
- Updated `src/tools-config.ts` to enable new tools by default
- Updated `index.ts` to register all three new tools
- Enhanced README with:
  - New tool permissions table
  - Bitable Base vs Wiki table distinction
  - Minutes API limitation warning
  - Usage examples and notes

### Documentation
- **New**: `skills/feishu-bitable/SKILL.md` - Complete Bitable usage guide (370+ lines)
- **New**: `skills/feishu-calendar/SKILL.md` - Complete Calendar usage guide (450+ lines)
- **New**: `skills/feishu-minutes/SKILL.md` - Minutes usage guide with API limitation notes
- **New**: `BITABLE-TEST-GUIDE.md` - Comprehensive testing guide with 13 test cases
- **New**: `MINUTES-API-LIMITATION.md` - Detailed API limitation analysis with diagnostic results
- **New**: `test-bitable-simple.mjs` - Simplified Bitable test script with auto field detection
- **New**: `test-calendar.mjs` - Calendar test script with all 8 operations
- **New**: `test-minutes.mjs` - Minutes diagnostic test script
- **New**: `diagnose-minutes.mjs` - Detailed Minutes API diagnostic tool

### Fixed
- **Bitable**: Auto-detect writable fields by filtering out read-only types (formula, auto-number, lookup)
- **Bitable**: Use `field_name` instead of `field_id` for record operations (more reliable)
- **Calendar**: Fixed `searchEvents` filter structure (moved time filters into filter object)
- **Calendar**: Updated `page_size` minimum from 10 to 50 (API requirement)
- **Calendar**: Made `user_id` required for `get_freebusy` (API doesn't accept "me")

### Testing
- ✅ **Bitable**: All 10 operations tested and verified working
- ✅ **Calendar**: 7 core operations tested and verified working
- ⚠️ **Minutes**: API limitations confirmed through diagnostic testing

## Known Issues

### Minutes API Limitations
- **Issue**: `minutes:minutes:readonly` permission shows as granted but does not take effect
- **Error**: Returns 403 with code 2091005 (permission deny)
- **Impact**: Cannot access Minutes API even with correct configuration
- **Root cause**: Permission not included in `tenant_access_token` scope list
- **Workaround**: Use `feishu_doc` tool to access minutes content (stored as documents)
- **Status**: Feishu platform limitation, not a plugin issue

### Bitable Base vs Wiki Tables
- **Issue**: Bitable API only works with Base tables, not Wiki tables
- **Impact**: Cannot access tables created inside wiki spaces via API
- **Solution**: Always create Base tables (independent multidimensional tables) for API access
- **Identification**: Base URL format `https://xxx.feishu.cn/base/{app_id}`

## [Previous Versions]

See Git history for changes before the Bitable/Calendar/Minutes tool additions.

---

**Note**: This changelog covers the major feature additions of Bitable, Calendar, and Minutes tools to the openclaw-feishu plugin.
