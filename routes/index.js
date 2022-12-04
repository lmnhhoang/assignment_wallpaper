var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var { Schema } = mongoose;
var multer = require('multer');
var path = require('path');
var url = require('url');
var sharp = require('sharp');

const wallpaperSchema = new Schema({
  id: String,
  title: String,
  desc: String,
  createDate: Date,
  img: {
    url: String,
    contentType: String,
    thumbnail: String
  }
});
const imgModel = mongoose.model('wallpaper', wallpaperSchema);

const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/upload')
  },
  filename: (req, file, cb) => {
    cb(null, Date.now()+ path.extname(file.originalname))
  }
});
const imageUpload = multer({
  storage: imageStorage,
  limits: {
    fileSize: 1000000
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(png|jpg|jpeg|svg)$/)) {
      return cb(new Error('Please upload a Image'))
    }
    cb(undefined, true)
  }
});

/* GET home page. */
router.get('/', function(req, res, next) {
  imgModel.find({}, (err, items) => {
    if (err) {
      console.log(err);
      res.status(500).send('An error occurred', err);
    }
    else {
      res.render('index', { items: items});
    }
  });
});
router.get('/upload', function(req, res, next) {
  res.render('upload', { title: 'Upload' });
});
router.post('/upload', imageUpload.single('image'),function(req, res, next) {
  sharp(req.file.path).resize(150, 150).toFile('./public/upload/'+ '150x150-'+req.file.filename, function(err) {
    if (err) {
      console.error('sharp>>>', err);
    }
    console.log('ok okoko')
  })
  var obj = {
    id: req.body.id,
    title: req.body.name,
    desc: req.body.desc,
    img: {
      url: path.join(__dirname, '../' + '/public/upload/' + req.file.filename),
      contentType: req.file.mimetype,
      thumbnail: path.join(__dirname, '../' + '/public/upload/150x150-' + req.file.filename)
    },
    createDate: Date.now()
  }
  imgModel.create(obj, (err, item) => {
    if (err) {
      console.log(err);
    }
    else {
      // item.save();
      res.redirect('/');
    }
  });
  // imgModel.findOne({ name: req.body.name }, function (err, img) {
  //   if (img._id == null){
  //     var obj = {
  //       id: req.body.id,
  //       title: req.body.name,
  //       desc: req.body.desc,
  //       img: {
  //         url: path.join(__dirname, '../' + '/upload/' + req.file.filename),
  //         contentType: req.file.mimetype
  //       },
  //       createDate: Date.now()
  //     }
  //     imgModel.create(obj, (err, item) => {
  //       if (err) {
  //         console.log(err);
  //       }
  //       else {
  //         // item.save();
  //         res.redirect('/');
  //       }
  //     });
  //   } else {
  //     imgModel.updateOne({_id: img._id}, {
  //       id: req.body.id,
  //       title: req.body.name,
  //       desc: req.body.desc,
  //       img: {
  //         url: path.join(__dirname, '../' + '/upload/' + req.file.filename),
  //         contentType: req.file.mimetype
  //       },
  //       createDate: Date.now()
  //     }).then(data => {
  //       if (data != null) res.send("Update thanh cong~!!!!")
  //     })
  //   }
  // });
});
module.exports = router;
