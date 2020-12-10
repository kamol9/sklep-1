const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads');
  },
  filename: function (req, file, cb) {
    cb(
      null,
      new Date().toISOString().replace(':', '_').replace(':', '_') +
        file.originalname
    );
  },
});

function fileFilter(req, file, cb) {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(null, false);
  }
}

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 },
  fileFilter: fileFilter,
});

const router = express.Router();

const Product = require('../models/product');

router.get('/', (req, res, next) => {
  Product.find()
    .exec()
    .then((docs) => {
      res.status(200).json({
        wiadomosc: 'Lista wszystkich produktów',
        szczegoly: docs,
      });
    })
    .catch((err) => res.status(500).json({ error: err }));
});

router.post('/', upload.single('productImage'), (req, res, next) => {
  console.log(req.file);
  const product = new Product({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    price: req.body.price,
    productImage: req.file.path
  });

  product
    .save()
    .then((doc) => {
      console.log(doc);
      res.status(201).json({
        wiadomosc: 'Dodano nowy produkt',
        szczegoly: doc,
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

router.get('/:productId', (req, res, next) => {
  const id = req.params.productId;
  Product.findById(id)
    .exec()
    .then((doc) => {
      res.status(200).json({
        wiadomosc: 'Szczegóły produktu o nr ' + id,
        szczegoly: doc,
      });
    })
    .catch((err) => res.status(500).json({ error: err }));
});

router.patch('/:productId', (req, res, next) => {
  const id = req.params.productId;
  Product.findByIdAndUpdate(
    id,
    { name: req.body.name, price: req.body.price },
    { new: true }
  )
    .exec()
    .then((doc) => {
      res.status(200).json({
        wiadomosc: 'Zmiana produktu o nr ' + id,
        szczegoly: doc,
      });
    })
    .catch((err) => res.status(500).json({ error: err }));
});

router.delete('/:productId', (req, res, next) => {
  const id = req.params.productId;
  Product.findByIdAndRemove(id)
    .exec()
    .then((doc) => {
      res.status(200).json({
        wiadomosc: 'Usunięto produkt o nr ' + id,
        szczegoly: doc,
      });
    })
    .catch((err) => res.status(500).json({ error: err }));
});

module.exports = router;
