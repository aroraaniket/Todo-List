const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();
const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
mongoose.connect(process.env.mongoURI, { useNewUrlParser: true });
const itemSchema = {
  name: String,
};
const Item = mongoose.model('Item', itemSchema);
const item1 = new Item({
  name: 'Welcome to your todo List ',
});
const item2 = new Item({
  name: 'Hit the + button to add ',
});
const item3 = new Item({
  name: 'press checkbox button to delete ',
});
const defaultItem = [item1, item2, item3];
const listSchema = {
  name: String,
  items: [itemSchema],
};
const List = mongoose.model('List', listSchema);
var today = new Date();
const options = {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
};
var title = today.toLocaleDateString('en-US', options);

app.get('/', function (req, res) {
  Item.find({}, function (err, found) {
    if (found.length === 0) {
      Item.insertMany(defaultItem, function (err) {
        if (!err) {
          console.log('successfully saved to db');
        } else {
          res.send(err);
        }
      });
      res.redirect('/');
    } else {
      res.render('list', { listTitle: title, lists: found });
    }
  });
});

app.post('/', function (req, res) {
  var itemname = req.body.Newitem;
  const listname = req.body.listname;
  const item = new Item({
    name: itemname,
  });
  if (listname === title) {
    item.save();
    res.redirect('/');
  } else {
    List.findOne({ name: listname }, function (err, foundlist) {
      foundlist.items.push(item);
      foundlist.save();
      res.redirect('/' + listname);
    });
  }
});
app.post('/delete', function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listname = req.body.listname;
  if (listname === title) {
    Item.findByIdAndRemove(checkedItemId, function (err) {
      if (!err) {
        console.log('succesfully deleted');
        res.redirect('/');
      }
    });
  } else {
    List.findOneAndUpdate(
      { name: listname },
      { $pull: { items: { _id: checkedItemId } } },
      function (err, foundList) {
        if (!err) {
          res.redirect('/' + listname);
        }
      }
    );
  }
});
app.get('/:customitemname', function (req, res) {
  const customitemname = req.params.customitemname;
  List.findOne({ name: customitemname }, function (err, foundlist) {
    if (!err) {
      if (!foundlist) {
        //create a new list
        const list = new List({
          name: customitemname,
          items: defaultItem,
        });
        list.save();
        res.redirect('/' + customitemname);
      } else {
        //show existing list
        res.render('list', {
          listTitle: foundlist.name,
          lists: foundlist.items,
        });
      }
    }
  });
});

app.listen(3000);
