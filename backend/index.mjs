// index.js
import {verifyCloudProof} from '@worldcoin/idkit';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

const app = express();
const port = 3000;

app.use(cors());

app.use(bodyParser.json());

// Middleware to parse URL-encoded data
app.use(bodyParser.urlencoded({ extended: true }));

// Define a simple route
app.post("/verifyWorldCoin", async (req, res) => {
  const proof = JSON.parse(req.body.result);

  console.log("In backend -- ", proof);
  const app_id = "app_staging_86f46e6e2736ccbaea9169f1827abe88";
  // const app_id = "app_f15fac6b62bb0a6f5aa99a43333aa8c8";
  const action = "testing-action";
  // const action = "production-action";
  const verifyRes = await verifyCloudProof(proof, app_id, action);

  if (verifyRes.success) {
    // This is where you should perform backend actions if the verification succeeds
    // Such as, setting a user as "verified" in a database
    res.status(200).send(verifyRes);
  } else {
    // This is where you should handle errors from the World ID /verify endpoint.
    // Usually these errors are due to a user having already verified.
    res.status(400).send(verifyRes);
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
