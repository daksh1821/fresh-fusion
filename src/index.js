const express = require("express");
const path = require("path");
const app = express();
const LogInCollection = require("./mongo");
const Razorpay = require("razorpay");
const port = process.env.PORT || 3006;
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/imagee", express.static(path.join(__dirname, "/public/imagee")));

const templatePath = path.join(__dirname, '../templates');
const publicPath = path.join(__dirname, '../public');
var instance = new Razorpay({
    key_id: 'rzp_test_XpcnRUirOO8j6U',
    key_secret: 'xnrhun4fXBNM46fyJNOzsDcy',
});
app.set('view engine', 'ejs');
app.set('views', templatePath);
app.use(express.static(publicPath));

app.get('/', (req, res) => {
    res.render('index'); 
});

app.get('/signup', (req, res) => {
    res.render('signup');
});

app.get('/login', (req, res) => {
    res.render('login');
});
app.get("/services", (req, res) => {
    res.render("services");
});

app.get("/indexe", (req, res) => {
    console.log(req.body.amount)
   res.render('indexe');
});

app.post('/signup', async (req, res) => {
    const data = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
}

    // Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(req.body.email)) {
        return res.send("Invalid email format");
    }

    try {
        const checking = await LogInCollection.findOne({ email: req.body.email })

        if (checking) {
            return res.send("User with this email already exists");
        }

        await LogInCollection.insertMany([data])
        res.status(201).render("index", { naming: req.body.name })
    } catch (error) {
        res.send("Error while signing up")
    }
});

app.post('/login', async (req, res) => {
    try {
        const check = await LogInCollection.findOne({ email: req.body.email })

        if (!check) {
            return res.send("User with this email does not exist");
        }

        if (check.password === req.body.password) {
            return res.status(201).render("index", { naming: req.body.email })
        } else {
            return res.send("Incorrect password")
        }
    } catch (error) {
        res.send("Error while logging in")
    }
});
app.post('/create/orderId', (req, res) => {
    console.log("Create orderId request",req.body.amount);
     var options = {
         amount: req.body.amount*100,
         currency: "INR",
         receipt: "rcp1"
    };

     razorpayInstance.orders.create(options, (err, order) => {
         if (err) {
             console.error("Error creating order:", err);
             res.status(500).send("Error creating order");
         } else {
             console.log("Order created:", order);
             res.send({ orderId: order.id });
         }
    });
})
app.post("/validate-payment", (req, res) => {
    const { order_id, payment_id, signature } = req.body;
    const secret = "your_razorpay_webhook_secret"; // Your Razorpay webhook secret

    try {
        validatePaymentVerification({ order_id, payment_id }, signature, secret);
        res.send("Payment verification successful.");
    } catch (error) {
        res.status(400).send("Error validating payment: " + error.message);
    }
});

// Handle 404 errors
app.use((req, res, next) => {
    res.status(404).send("404: Page not found");
});

// Handle other errors
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(port, () => {
    console.log('Server started on port', port);
});
const fs = require('fs').promises;
const {authenticate} = require('@google-cloud/local-auth');
const {google} = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/contacts.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

/**
 * Serializes credentials to a file compatible with GoogleAuth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client) {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: 'authorized_user',
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

/**
 * Load or request or authorization to call APIs.
 *
 */
async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}

/**
 * Print the display name if available for 10 connections.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
async function listConnectionNames(auth) {
  const service = google.people({version: 'v1', auth});
  const res = await service.people.connections.list({
    resourceName: 'people/me',
    pageSize: 10,
    personFields: 'names,emailAddresses',
  });
  const connections = res.data.connections;
  if (!connections || connections.length === 0) {
    console.log('No connections found.');
    return;
  }
  console.log('Connections:');
  connections.forEach((person) => {
    if (person.names && person.names.length > 0) {
      console.log(person.names[0].displayName);
    } else {
      console.log('No display name found for connection.');
    }
  });
}

authorize().then(listConnectionNames).catch(console.error);