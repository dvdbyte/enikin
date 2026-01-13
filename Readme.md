# Enikin (Web): <a href="#" target="_blank">Visit Here</a>

<a href="#" target="_blank">
<img src="https://via.placeholder.com/800x400?text=Enikin+Demo+Preview" width="100%" alt="Enikin Demo Video"/>
</a>

A robust **Property Management Dashboard** designed to streamline the chaotic
process of managing real estate portfolios. Enikin empowers agents and
landlords to track properties, manage tenant relationships, automate rent
reminders, and monitor lease lifecycles from a centralized interface.

The platform focuses on automation, data organization, and proactive
communication to reduce vacancy rates and ensure timely rent payments.

---

## Tech Used

![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=jsonwebtokens)
![Cron Jobs](https://img.shields.io/badge/Cron%20Jobs-000000?style=for-the-badge&logo=linux&logoColor=white)


---

## Key Learning Focus

The core learning objective of this project was architecting a **Lease
Lifecycle Engine**, ensuring that the system autonomously tracks the status
of every agreement without constant manual oversight:

**Lease Creation → Active Monitoring → Expiry Detection → Automated Reminder
→ Renewal / Termination**

This required implementing backend logic to calculate date differences
daily, categorize leases (*Active, Expiring, Overdue, History*), and trigger
the appropriate status updates and notifications automatically.

---

## Optimizations

A major architectural consideration was **data integrity and search
performance** across deeply related entities.

- **Automated Cron Jobs**: Implemented scheduled server-side tasks to run
  daily checks on lease expiry dates, updating lease statuses without user
  intervention.

- **Image Optimization**: Integrated **Cloudinary** for efficient storage
  and delivery of tenant profile photos and property images, keeping the
  database lightweight.

- **Relational Data Management**: Leveraged **Mongoose populate and
  virtuals** to seamlessly link *Landlords → Properties → Units → Tenants*,
  enabling deep data retrieval in a single API call.

---

## Future Improvements

Future iterations will focus on financial integration and tenant
accessibility:

- **Integrated Rent Collection** using **Paystack** to allow tenants to pay
  rent directly via the platform.
- **Tenant Portal** enabling tenants to view payment history, lease status,
  and submit maintenance requests.
- **SMS / WhatsApp Notifications** (via Twilio) to reach tenants who may not
  actively check email reminders.

---

## Lessons Learned

- **Handling Dates & Timezones**: Standardizing backend date handling in
  **UTC** was critical to avoiding off-by-one-day errors in lease expiry and
  reminder systems.

- **Cascading Deletes**: Implementing cleanup hooks ensured that deleting a
  Property correctly handled associated Units, Leases, and Tenant records,
  preventing orphaned data.

- **State Management**: Building multi-step workflows (such as the *Add
  Lease* wizard) reinforced best practices around **controlled components**
  and **context-driven state management** in React.

---

## Admin Capabilities

Agents and Admins can:

- Onboard and manage landlord profiles and banking details
- Add properties and configure individual units/apartments
- Register tenants and upload digital lease agreements
- View a smart dashboard highlighting overdue payments and upcoming
  vacancies
- Generate rent receipts and download them as PDFs

Access is secured using **JWT-based authentication**, ensuring tenant data
remains private.

---

## Installation

```bash
git clone <repo-url>
cd <project-folder>
npm install
```

---

## Environment Variables

Create a `.env` file in the root directory and add:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## Usage

### Backend

```bash
npm run server
```

### Frontend

```bash
npm start
```

---

## More Projects

<table bordercolor="#66b2b2">
<tr>
<td width="33.3%" valign="top">
<a target="_blank" href="#">FarmMoni (Fintech)</a><br />
<a target="_blank" href="#">
<img src="https://via.placeholder.com/300x150?text=FarmMoni" width="100%" alt="FarmMoni"/>
</a>
</td>
<td width="33.3%" valign="top">
<a target="_blank" href="#">Arduino IoT Portfolio</a><br />
<a target="_blank" href="#">
<img src="https://via.placeholder.com/300x150?text=IoT+Portfolio" width="100%" alt="IoT Portfolio"/>
</a>
</td>
<td width="33.3%" valign="top">
<a target="_blank" href="#">E-Commerce Store</a><br />
<a target="_blank" href="#">
<img src="https://via.placeholder.com/300x150?text=E-Commerce" width="100%" alt="E-Commerce"/>
</a>
</td>
</tr>
</table>
