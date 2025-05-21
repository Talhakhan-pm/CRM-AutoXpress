# AutoXpress CRM

A modern CRM for AutoXpress, an auto parts reseller specializing in OEM and aftermarket parts.

## About AutoXpress

AutoXpress generates leads through Google Ads (call-only format). Agents handle callbacks, quotes, and fulfillment using this CRM.

- **Business Email**: orders@autoxpress.us
- **Customer Support Line**: 1-833-597-0070

## Project Overview

This project is a full-featured CRM built to replace an Airtable setup. It includes:

### Stack

- **Frontend**: React + Tailwind CSS + TanStack Table (React Table)
- **Backend**: FastAPI + PostgreSQL (with SQLAlchemy)

### Modules

- Callbacks (implemented)
- Orders (planned)
- Products (planned)
- Invoices (planned)
- Agents (planned)

## Getting Started

The project is split into two main parts:

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Follow the setup instructions in the [backend README](backend/README.md).

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Follow the setup instructions in the [frontend README](frontend/README.md).

## Callbacks Module Structure

The Callbacks module includes the following fields:

- Product
- Vehicle Year
- Car Make
- Car Model
- ZIP Code
- Customer Name
- Callback Number
- Follow-up Date
- Status (Pending, Sale, No Answer, Follow-up Later, etc.)
- Agent Name
- Lead Score (optional number field)
- Comments (multiline text)
- Last Modified (auto timestamp)
- Last Modified By (agent name or user)

## Future Enhancements

The following features are planned for future iterations:

- Daily 7:30 AM agent reminders
- Auto-voicemail drop if Status is marked "No Answer" twice
- Smart lead scoring logic

## License

This project is proprietary and for use by AutoXpress only.