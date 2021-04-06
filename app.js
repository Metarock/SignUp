const express = require('express');
const https = require('https');
const bodyParser = require('body-parser');
const app = express();

//This is what allows us to access our HTML file
app.use(bodyParser.urlencoded({extended:true}));

//mailchimp api key
const apiKey = "5ce7de0ef5fe62467c41b376087f8cd7-us1";
//mailchimp unique ID
const uniqueID = "bf195111e5";
  //we will need to use express to access static files such as CSS and images
app.use(express.static("public"));

//get the information
app.get("/", (req,res) => {
  res.sendFile(__dirname + "/signup.html")
})

//post the information
app.post("/", (req, res) => {
  //This basically gets html elements from the signup html file
  const firstName = req.body.fName;
  const lastName = req.body.lName;
  const email = req.body.email;

//To understand how this works we have to go to mailChimp website's documentation
//https://mailchimp.com/developer/marketing/api/lists/batch-subscribe-or-unsubscribe/
//https://us1.admin.mailchimp.com/lists/settings/merge-tags?id=1634126
//The JSON variables have to be according to mailChimp variables based on their documentation or else it won't be recognizable.
//This is what we are going to send to mailchimp
  const data = {
    members: [
      {
        email_address: email,
        status: "subscribed",
        merge_fields: {
          FNAME: firstName,
          LNAME: lastName,
        }
      }
    ]
  };

  //stringify converts the javascript object (data) to JSON format
  const jsonData = JSON.stringify(data);

  //this is mailchimp url and we're specifying where to send it which is lists
  const url = "https://us1.api.mailchimp.com/3.0/lists/" + uniqueID;

//go through POST requst successfully
  const options ={
    method: "POST",
    auth: "sanggy:" + apiKey,
  }

  //This is the POST requests, which sends data to the external server
  const request = https.request(url, options, (responds) => {

    if(responds.statusCode == 200)
    {
      res.sendFile(__dirname + "/success.html");
    }
    else
    {
      res.sendFile(__dirname + "/failure.html");
    }

    responds.on("data", (data) => {
      console.log(JSON.parse(data));
    })
  })

  request.write(jsonData);
  //to specify we're done with the request
  request.end();
  console.log(firstName + " " + lastName + " " + email);
})


//This simply means when the user presses the button it is redirected to the hope page
//this is possible because of the .redirect function
app.post("/failure", (req, res) => {
  res.redirect("/");
})

app.post("/success", (req,res) => {
  res.redirect("/");s
})

//process.env.PORT is a dynamic port that will Heroku to define on the go.
app.listen(process.env.PORT || 3000, () => {
  console.log("Server running at port 3000");
})
