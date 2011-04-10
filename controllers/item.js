
/**
 * Module dependencies.
 */

var utils = require('../lib/helpers');

/**
 * Validate `obj`'s `prop`, with the given validation `type`.
 *
 * @param {Object} obj
 * @param {String} prop
 * @param {String} type
 */

function validate(obj, prop, type) {
  var val = obj[prop];
  switch (type || 'present') {
    case 'number':
      val = parseFloat(val);
      if (isNaN(val)) throw new Error(prop + ' must be a number');
      obj[prop] = val;
      break;
    case 'present':
      if (!val) throw new Error(prop + ' required');
      break;
    case 'date':
      validate(obj, prop, 'present');
      val = utils.parseDate(val);
      if (!(val instanceof Date)) throw new Error(prop + ' must be a date');
      if (isNaN(val.getTime())) throw new Error(prop + ' is an invalid date');
      obj[prop] = val;
      break;
  }
}

/**
 * Respond with items.
 */

exports.index = function(req, res){
  res.send(db.items);
};

/**
 * Create an item.
 */

exports.create = function(req, res, next){
  var item = req.body.item;
  item.tags = item.tags
    ? item.tags.split(/ *, */)
    : [];
  try {
    validate(item, 'entity');
    validate(item, 'date', 'date');
    validate(item, 'category');
    validate(item, 'amount', 'number');
    item.id = db.ids++;
    db.items[item.id] = item;
    db.save();
    res.partial('item', { object: item }, function(err, html){
      if (err) return next(err);
      res.send({ append: html, to: '#items' });
    });
  } catch (err) {
    res.send({ error: err.message });
  }
};

/**
 * Destroy an item.
 */

exports.destroy = function(req, res, next){
  var id = req.params.item;
  if (!db.items[id]) return res.send({ error: 'Invalid item' });
  delete db.items[id];
  db.save();
  res.send({});
};