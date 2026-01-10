const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoute = require('./routes/auth');
const tenantRoute = require('./routes/tenants'); 
const propertyRoute = require('./routes/properties');
const {startScheduler} = require('./utils/scheduler');
const leaseRoute = require('./routes/leases');
const dashboardRoute = require('./routes/dashboard');
const landlordRoute = require('./routes/landlords');
const apartmentRoute = require('./routes/apartments');

const app = express();

app.use(express.json());
app.use(cors());
startScheduler();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Enikin Database Connected'))
  .catch((err) => console.log(err));

app.use('/api/auth', authRoute);
app.use('/api/tenants', tenantRoute); 
app.use('/api/apartments', apartmentRoute); 
app.use('/api/properties', propertyRoute);
app.use('/api/leases', leaseRoute);
app.use('/api/dashboard', dashboardRoute);
app.use('/api/landlords', landlordRoute);



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));