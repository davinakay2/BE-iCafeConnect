const express = require('express'),
    app = express(),
    bodyparser = require('body-parser')
require('express-async-errors')

const {db, db2} = require('./db'), 
    loginRoutes = require('./controllers/loginController')
    homeRoutes = require('./controllers/homeController')
    bindingAccountRoutes = require('./controllers/bindingAccountController')
    paymentRoutes = require('./controllers/paymentController')
    settingsRoutes = require('./controllers/settingsController')

//middleware
app.use(bodyparser.json())
app.use('/loginpage', loginRoutes)
app.use('/homepage', homeRoutes)
app.use('/bindingaccountpage', bindingAccountRoutes)
app.use('/paymentpage', paymentRoutes)
app.use('/settingspage', settingsRoutes)
app.use((err, req, res, next) => {
    console.log(err)
    res.status(err.status || 500).send('Something went wrong!')
})

// to make sure the db connection is successful
// db.query("SELECT 1")
//     .then(() => { 
//         console.log("db connection succeeded.")
//         app.listen(3000, 
//             () => console.log('server started at 3000')
//         )
//     })
//     .catch(err => console.log("db connection failed. \n" + err));

Promise.all([
    db.query("SELECT 1"),
    db2.query("SELECT 1")
])
.then(() => { 
    console.log("All database connections succeeded.");
    app.listen(3000, () => console.log('Server started at port 3000'));
})
.catch(err => {
    console.log("Database connection failed. \n" + err);
});