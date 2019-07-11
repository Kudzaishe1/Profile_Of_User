var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose")
var session = require('express-session');

mongoose.connect("mongodb+srv://test:test@authentication-ltrsa.mongodb.net/test?retryWrites=true&w=majority",{ useNewUrlParser: true });

var MongoSchema = new mongoose.Schema({
  Name:String,
  Surname:String,
  Email:String,
  Age:Number,
  Password:String
});

var MongoProfileSchema = new mongoose.Schema({
  Email:String,
  Name:String,
  Surname:String,
  Degree:String,
  Age:Number,
  FavouriteCourse:String
});

var Details = mongoose.model('Details',MongoSchema);
var Profiles = mongoose.model("Profiles",MongoProfileSchema);

var app = express();
var urlencodedParser = bodyParser.urlencoded({extended:false});

///////////////////////////////////////USE
app.use(session({secret: 'mySecret', resave: false, saveUninitialized: false}));
app.use("/assets",express.static("assets"));
app.set('view engine','ejs');

////////////////////////////GETS
app.get('/',function(req,res){
    res.render('Sign_Up_Page',{Error:"Join Now"});
});

app.get('/sign_in',function(req,res){
    res.render('Sign_In_Page',{Status_CHeck:"LOGIN"});
});

app.get('/Profile_Page',function(req,res){;
    var check = {Email:req.session.message};
    var Account = Profiles.find(check,function(err,data){
      if(err) throw err;
      console.log(data)
      res.render('Profile_Page',data[0]);
    });
});
////////////////////////////POSTS

app.post('/Profile_Page',urlencodedParser,function(req,res){
      Profiles.findOneAndUpdate({Email:req.session.message}, { "$set": { Name:req.body.Name, Surname:req.body.Surname,Age:req.body.Age,Degree:req.body.Degree,FavouriteCourse:req.body.FavouriteCourse}}).exec(function(err, data){
        if(err) throw err;
        var check = {Email:req.session.message};
        var Account = Profiles.find(check,function(err,data){
          if(err) throw err;
          console.log(data)
          res.render('Profile_Page',data[0]);
        });
      });
});

app.post('/Sign_In',urlencodedParser,function(req,res){
    var check = {Email:req.body.login,Password:req.body.passwrd}
    var Account = Details.find(check,function(err,data){
      if(err) throw err;
      if(data.length !=0)
      {
          console.log("EXISTS");
          req.session.message = req.body.login;
          res.redirect('Profile_Page');
      }
      else
      {
        console.log("NEW");
        res.render('Sign_In_Page',{Status_CHeck:"Incorrect Email or Password"});
      }
    });
});

app.post('/',urlencodedParser,function(req,res){
  var check = {Email:req.body.Email};
  var Account = Details.find(check,function(err,data){
    if(err) throw err;
    if(data.length !=0)
    {
        console.log("EXISTS");
        res.render('Sign_Up_Page',{Error:"User Account Already Exists"});
    }
    else
    {
      console.log("NEW");
      if(req.body.Password === req.body.Confirm_Password)
      {
          var me = Details({Name:req.body.Name,Surname:req.body.Surname,Email:req.body.Email,Age:req.body.Age,Password:req.body.Password}).save(function(err){
            if(err) throw err;
          });

          var User = Profiles({Email:req.body.Email,Name:req.body.Name,Surname:req.body.Surname,Degree:"",Age:req.body.Age,FavouriteCourse:""}).save(function(err){
            if(err) throw err;
          });

          res.redirect('/Sign_In');
      }
    }
  });
})

console.log("Now listening on port 3000");
app.listen(3000);
